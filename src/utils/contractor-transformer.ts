
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";
import { formatWebsiteUrl } from "./url-utils";

export const transformContractor = async (dbContractor: DatabaseContractor): Promise<Contractor> => {
  console.log('Raw contractor data:', {
    business_name: dbContractor.business_name,
    google_photos_type: typeof dbContractor.google_photos,
    google_photos_sample: dbContractor.google_photos
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
      console.error('Error parsing google_reviews:', e);
    }
  }

  // Parse Google photos if available
  if (dbContractor.google_photos) {
    try {
      let photosData = dbContractor.google_photos;
      
      // Handle case where photos might be a string
      if (typeof photosData === 'string') {
        photosData = JSON.parse(photosData);
      }
      
      // Handle case where it might be empty array in string form
      if (photosData === '[]') {
        photosData = [];
      }
      
      if (Array.isArray(photosData)) {
        const validPhotos = photosData.filter(photo => 
          photo && 
          typeof photo === 'object' &&
          ('url' in photo || 'id' in photo)
        );

        google_photos = validPhotos.map(photo => {
          // Handle both direct URL objects and Google Places photo references
          const photoUrl = photo.url || 
            (typeof photo.id === 'string' ? 
              `https://places.googleapis.com/v1/places/${photo.id}/photos` : 
              undefined);

          return {
            url: String(photoUrl || ''),
            width: Number(photo.width || 0),
            height: Number(photo.height || 0),
            type: String(photo.type || '')
          };
        }).filter(photo => photo.url.length > 0);

        console.log('Processed photos for', dbContractor.business_name, {
          rawCount: photosData.length,
          validCount: google_photos.length
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
