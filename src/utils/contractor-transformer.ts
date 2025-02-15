
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";
import { formatWebsiteUrl } from "./url-utils";

export const transformContractor = async (dbContractor: DatabaseContractor): Promise<Contractor> => {
  let google_reviews: GoogleReview[] | undefined;
  let google_photos: GooglePhoto[] | undefined;
  
  // Parse Google photos first since this seems to be the main issue
  if (dbContractor.google_photos) {
    try {
      let photosData = dbContractor.google_photos;
      
      // Handle case where it might be a string
      if (typeof photosData === 'string') {
        photosData = JSON.parse(photosData);
      }
      
      // Ensure we have an array of photo objects
      if (Array.isArray(photosData)) {
        google_photos = photosData
          .filter(photo => photo && typeof photo === 'object' && photo.url)
          .map(photo => ({
            url: String(photo.url || ''),
            width: Number(photo.width || 0),
            height: Number(photo.height || 0),
            type: String(photo.type || '')
          }));
          
        console.debug('Processed Google photos:', {
          total: photosData.length,
          valid: google_photos.length,
          sample: google_photos[0]
        });
      } else {
        console.error('Google photos is not an array:', photosData);
      }
    } catch (e) {
      console.error('Error processing google_photos for', dbContractor.business_name, e);
      google_photos = [];
    }
  }

  // Parse Google reviews if available
  if (dbContractor.google_reviews) {
    try {
      let reviewsData = dbContractor.google_reviews;
      
      if (typeof reviewsData === 'string') {
        reviewsData = JSON.parse(reviewsData);
      }
      
      if (Array.isArray(reviewsData)) {
        google_reviews = reviewsData
          .filter(review => review && typeof review === 'object')
          .map(review => ({
            rating: Number(review.rating) || 0,
            text: String(review.text || ''),
            time: String(review.time || ''),
            author_name: String(review.author_name || '')
          }));
          
        console.debug('Processed Google reviews:', {
          total: reviewsData.length,
          valid: google_reviews.length
        });
      }
    } catch (e) {
      console.error('Error parsing google_reviews for', dbContractor.business_name, e);
    }
  }

  // Parse image_priority with fallback
  let image_priority;
  try {
    if (dbContractor.image_priority) {
      if (typeof dbContractor.image_priority === 'string') {
        image_priority = JSON.parse(dbContractor.image_priority);
      } else {
        image_priority = dbContractor.image_priority;
      }
    }
  } catch (e) {
    console.error('Error parsing image_priority for', dbContractor.business_name, e);
  }
  
  // Always provide a fallback image priority
  image_priority = image_priority || { order: ["google_photos", "uploaded_images", "default_specialty_image"] };

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

  // Process images array and ensure all URLs are valid
  const images = Array.isArray(dbContractor.images)
    ? dbContractor.images.filter(img => img && typeof img === 'string' && img.trim().length > 0)
    : [];

  // Ensure we have a valid default_specialty_image
  const default_specialty_image = dbContractor.default_specialty_image && 
    typeof dbContractor.default_specialty_image === 'string' && 
    dbContractor.default_specialty_image.trim().length > 0
      ? dbContractor.default_specialty_image
      : undefined;

  console.log('Transformed contractor:', {
    business: dbContractor.business_name,
    default_specialty_image,
    google_photos: google_photos ? {
      length: google_photos.length,
      sample: google_photos[0]
    } : 'none',
    uploaded_images: images.length
  });

  const contractor: Contractor = {
    ...dbContractor,
    rating,
    review_count,
    years_in_business: dbContractor.years_in_business || undefined,
    images,
    google_reviews,
    google_photos,
    project_types: Array.isArray(dbContractor.project_types) ? dbContractor.project_types : [],
    certifications: Array.isArray(dbContractor.certifications) ? dbContractor.certifications : undefined,
    website_url: formatWebsiteUrl(dbContractor.website_url),
    image_priority,
    default_specialty_image,
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
