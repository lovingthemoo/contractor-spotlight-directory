
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";
import { formatWebsiteUrl } from "./url-utils";

export const transformContractor = async (dbContractor: DatabaseContractor): Promise<Contractor> => {
  let google_reviews: GoogleReview[] | undefined;
  let google_photos: GooglePhoto[] | undefined;
  
  // Parse Google reviews if available
  if (dbContractor.google_reviews) {
    try {
      let reviewsData = dbContractor.google_reviews;
      
      if (typeof reviewsData === 'string') {
        reviewsData = JSON.parse(reviewsData);
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
      console.error('Error parsing google_reviews for', dbContractor.business_name, e);
    }
  }

  // Parse Google photos
  try {
    // Initialize with empty array if null (shouldn't happen with new constraints)
    let photosData = dbContractor.google_photos || [];
    
    // Handle string case (from older data)
    if (typeof photosData === 'string') {
      try {
        photosData = JSON.parse(photosData);
      } catch (e) {
        console.error('Failed to parse google_photos string:', e);
        photosData = [];
      }
    }
    
    if (Array.isArray(photosData)) {
      google_photos = photosData
        .filter(photo => photo && typeof photo === 'object' && photo.url)
        .map(photo => ({
          url: String(photo.url),
          width: Number(photo.width || 0),
          height: Number(photo.height || 0),
          type: String(photo.type || '')
        }));
      
      console.log('Processed Google photos:', {
        business: dbContractor.business_name,
        total: photosData.length,
        valid: google_photos.length
      });
    }
  } catch (e) {
    console.error('Error processing google_photos for', dbContractor.business_name, e);
    google_photos = [];
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

  // Process images array
  const images = Array.isArray(dbContractor.images)
    ? dbContractor.images.filter(img => img && typeof img === 'string' && img.startsWith('http'))
    : [];

  console.log('Processed contractor images:', {
    business: dbContractor.business_name,
    uploadedImages: images.length,
    googlePhotos: google_photos?.length || 0
  });

  const contractor: Contractor = {
    ...dbContractor,
    rating,
    review_count,
    years_in_business: dbContractor.years_in_business || undefined,
    images,
    project_types: Array.isArray(dbContractor.project_types) ? dbContractor.project_types : [],
    google_reviews,
    google_photos,
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
