
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
      
      console.log('Parsed reviews data:', reviewsData);
        
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        google_reviews = reviewsData.map(review => ({
          rating: Number(review.rating) || 0,
          text: String(review.text || ''),
          time: String(review.time || ''),
          author_name: String(review.author_name || '')
        }));
        console.log('Transformed reviews:', google_reviews);
      }
    } catch (e) {
      console.error('Error parsing google_reviews:', e);
    }
  }

  // Parse Google photos if available
  if (dbContractor.google_photos) {
    try {
      console.log('Raw google_photos:', dbContractor.google_photos);
      let photosData;
      
      if (typeof dbContractor.google_photos === 'string') {
        photosData = JSON.parse(dbContractor.google_photos);
      } else {
        photosData = dbContractor.google_photos;
      }
      
      console.log('Parsed photos data:', photosData);

      if (Array.isArray(photosData) && photosData.length > 0) {
        google_photos = photosData
          .filter(photo => photo && typeof photo === 'object' && photo.url)
          .map(photo => ({
            url: String(photo.url || ''),
            width: Number(photo.width) || 0,
            height: Number(photo.height) || 0,
            type: String(photo.type || '')
          }));
        console.log('Transformed photos:', google_photos);
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

  console.log('Processing rating and review count:', {
    rawRating: dbContractor.rating,
    processedRating: rating,
    rawReviewCount: dbContractor.review_count,
    processedReviewCount: review_count
  });

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

  // Log the final transformed contractor
  console.log('Transformed contractor:', {
    id: contractor.id,
    business_name: contractor.business_name,
    google_place_name: contractor.google_place_name,
    rating: contractor.rating,
    review_count: contractor.review_count,
    has_photos: contractor.google_photos?.length || 0,
    has_reviews: contractor.google_reviews?.length || 0,
    phone: contractor.google_formatted_phone || contractor.phone
  });

  // Remove any undefined values to ensure clean data
  Object.keys(contractor).forEach(key => {
    if (contractor[key] === undefined) {
      delete contractor[key];
    }
  });

  return contractor;
};

export const getDisplayImage = (contractor: Contractor): string | undefined => {
  console.log('Getting display image for:', contractor.business_name, {
    has_google_photos: !!contractor.google_photos?.length,
    has_images: !!contractor.images?.length,
    google_photos: contractor.google_photos,
    first_image: contractor.images?.[0]
  });

  // First priority: Company-specific Google photos
  if (Array.isArray(contractor.google_photos) && contractor.google_photos.length > 0) {
    const photo = contractor.google_photos[0];
    if (photo && photo.url) {
      console.log('Using Google photo:', photo.url);
      return photo.url;
    }
  }
  
  // Second priority: Uploaded images
  if (Array.isArray(contractor.images) && contractor.images[0]) {
    console.log('Using uploaded image:', contractor.images[0]);
    return contractor.images[0];
  }
  
  // If no image is available, return undefined
  console.log('No image available for:', contractor.business_name);
  return undefined;
};

export const getDisplayAddress = (contractor: Contractor): string => {
  if (contractor.google_formatted_address) return contractor.google_formatted_address;
  if (contractor.location) return contractor.location;
  return '';
};
