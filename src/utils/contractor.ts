import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";

const formatWebsiteUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  let formattedUrl = url.trim();
  
  try {
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    new URL(formattedUrl);
    return formattedUrl;
  } catch (e) {
    console.error('Invalid URL:', url);
    return undefined;
  }
};

export const transformContractor = async (dbContractor: DatabaseContractor): Promise<Contractor> => {
  console.log('Raw contractor data:', dbContractor);
  
  let google_reviews: GoogleReview[] | undefined;
  let google_photos: GooglePhoto[] | undefined;
  
  // Parse Google reviews if available
  if (dbContractor.google_reviews) {
    try {
      console.log('Raw google_reviews:', dbContractor.google_reviews);
      let reviewsData;
      
      if (typeof dbContractor.google_reviews === 'string') {
        reviewsData = JSON.parse(dbContractor.google_reviews);
      } else {
        reviewsData = dbContractor.google_reviews;
      }
      
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        google_reviews = reviewsData.map(review => ({
          rating: Number(review.rating) || 0,
          text: String(review.text || ''),
          time: String(review.time || ''),
          author_name: String(review.author_name || '')
        }));
      }
    } catch (e) {
      console.error('Error parsing google_reviews:', e);
    }
  }

  // Parse Google photos if available
  if (dbContractor.google_photos) {
    try {
      let photosData = dbContractor.google_photos;
      
      // If it's a string (shouldn't happen with JSONB but just in case), parse it
      if (typeof photosData === 'string') {
        photosData = JSON.parse(photosData);
      }
      
      // Ensure we have a valid array of photo objects
      if (Array.isArray(photosData)) {
        google_photos = photosData
          .filter(photo => photo && typeof photo === 'object' && photo.url)
          .map(photo => ({
            url: String(photo.url || ''),
            width: Number(photo.width) || 0,
            height: Number(photo.height) || 0,
            type: String(photo.type || '')
          }));
        
        console.log('Processed Google photos:', {
          contractorName: dbContractor.business_name,
          photoCount: google_photos.length,
          firstPhotoUrl: google_photos[0]?.url
        });
      } else {
        console.warn('Invalid google_photos format:', photosData);
      }
    } catch (e) {
      console.error('Error parsing google_photos:', e);
    }
  }

  // Create a slug if one doesn't exist
  const slug = dbContractor.slug || (dbContractor.business_name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + 
    '-' + dbContractor.id.substring(0, 6);

  // Ensure rating and review_count are properly typed as numbers
  const rating = typeof dbContractor.rating === 'string' 
    ? parseFloat(dbContractor.rating) 
    : typeof dbContractor.rating === 'number' 
      ? dbContractor.rating 
      : undefined;

  const review_count = typeof dbContractor.review_count === 'string'
    ? parseInt(dbContractor.review_count)
    : typeof dbContractor.review_count === 'number'
      ? dbContractor.review_count
      : 0;

  const contractor: Contractor = {
    ...dbContractor,
    rating,
    review_count,
    years_in_business: dbContractor.years_in_business || undefined,
    images: Array.isArray(dbContractor.images) ? dbContractor.images : [],
    project_types: Array.isArray(dbContractor.project_types) ? dbContractor.project_types : [],
    google_reviews: google_reviews || undefined,
    google_photos: google_photos || undefined,
    certifications: Array.isArray(dbContractor.certifications) ? dbContractor.certifications : undefined,
    website_url: formatWebsiteUrl(dbContractor.website_url),
    slug
  };

  // Remove any undefined values to ensure clean data
  Object.keys(contractor).forEach(key => {
    if (contractor[key] === undefined) {
      delete contractor[key];
    }
  });

  return contractor;
};

export const getDisplayImage = (contractor: Contractor): string => {
  // Default fallback image based on specialty
  const getFallbackImage = (specialty?: string): string => {
    const baseUrl = "https://images.unsplash.com/photo-";
    switch (specialty?.toLowerCase()) {
      case "roofing":
        return `${baseUrl}1632863677807-846708d2e7f4`; // Roofing image
      case "building":
      case "construction":
        return `${baseUrl}1503387762-592deb58ef4e`; // Construction site
      case "electrical":
        return `${baseUrl}1565193492-05bd3fa5cf4c`; // Electrical work
      case "plumbing":
        return `${baseUrl}1504328345606-16dec41d99b7`; // Plumbing
      case "home repair":
      case "handyman":
        return `${baseUrl}1581578731048-c40b7c3dbf30`; // Tools
      case "gardening":
        return `${baseUrl}1466692476868-9ee5a3a3e93b`; // Garden
      default:
        return `${baseUrl}1503387762-592deb58ef4e`; // Generic construction
    }
  };

  // Log available images for debugging
  console.log('Image sources for', contractor.business_name, {
    uploadedImages: contractor.images?.length || 0,
    googlePhotos: contractor.google_photos?.length || 0
  });

  // Priority 1: Company-specific uploaded images
  if (contractor.images && Array.isArray(contractor.images) && contractor.images.length > 0) {
    const validUploadedImages = contractor.images.filter(img => 
      typeof img === 'string' && 
      img.trim().length > 0 && 
      img.startsWith('http')
    );

    if (validUploadedImages.length > 0) {
      console.log('Using uploaded image:', validUploadedImages[0]);
      return validUploadedImages[0];
    }
  }
  
  // Priority 2: Google photos
  if (contractor.google_photos && Array.isArray(contractor.google_photos)) {
    const validGooglePhotos = contractor.google_photos.filter(photo => 
      photo && 
      typeof photo === 'object' &&
      'url' in photo &&
      typeof photo.url === 'string' &&
      photo.url.trim().length > 0 &&
      photo.url.startsWith('http')
    );

    if (validGooglePhotos.length > 0) {
      const photoUrl = validGooglePhotos[0].url;
      console.log('Using Google photo:', photoUrl);
      return photoUrl;
    }
  }
  
  // If no valid images found, return a fallback based on specialty
  console.log('No valid images found for:', contractor.business_name);
  return getFallbackImage(contractor.specialty);
};

export const getDisplayAddress = (contractor: Contractor): string => {
  if (contractor.google_formatted_address) return contractor.google_formatted_address;
  if (contractor.location) return contractor.location;
  return '';
};
