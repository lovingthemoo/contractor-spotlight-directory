
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";
import { formatWebsiteUrl } from "./url-utils";

export const transformContractor = async (dbContractor: DatabaseContractor): Promise<Contractor> => {
  // Add detailed logging for debugging
  console.log('Processing contractor:', dbContractor.business_name, {
    hasGooglePhotos: !!dbContractor.google_photos,
    googlePhotosType: typeof dbContractor.google_photos,
    photosSample: dbContractor.google_photos && typeof dbContractor.google_photos === 'object' 
      ? Array.isArray(dbContractor.google_photos) 
        ? dbContractor.google_photos.slice(0, 1) 
        : 'Not an array'
      : 'No photos',
    hasImages: Array.isArray(dbContractor.images) && dbContractor.images.length > 0
  });
  
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

  // Parse Google photos if available
  if (dbContractor.google_photos) {
    try {
      let photosData = dbContractor.google_photos;
      
      // Ensure we're working with an array of photo objects
      if (typeof photosData === 'string') {
        photosData = JSON.parse(photosData);
      }
      
      // Log the photos data structure for debugging
      console.log('Photos data for', dbContractor.business_name, {
        isArray: Array.isArray(photosData),
        length: Array.isArray(photosData) ? photosData.length : 0,
        firstPhoto: Array.isArray(photosData) && photosData.length > 0 ? photosData[0] : null
      });
      
      if (Array.isArray(photosData)) {
        google_photos = photosData
          .filter(photo => {
            const isValid = photo && 
              typeof photo === 'object' && 
              'url' in photo && 
              photo.url && 
              typeof photo.url === 'string';
            
            if (!isValid) {
              console.log('Invalid photo object:', photo);
            }
            
            return isValid;
          })
          .map(photo => ({
            url: String(photo.url),
            width: Number(photo.width || 0),
            height: Number(photo.height || 0),
            type: String(photo.type || '')
          }));
          
        console.log('Processed photos for', dbContractor.business_name, {
          total: photosData.length,
          valid: google_photos.length,
          sample: google_photos.slice(0, 1)
        });
      }
    } catch (e) {
      console.error('Error parsing google_photos for', dbContractor.business_name, e);
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
    images: Array.isArray(dbContractor.images) ? dbContractor.images.filter(img => img && typeof img === 'string') : [],
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
