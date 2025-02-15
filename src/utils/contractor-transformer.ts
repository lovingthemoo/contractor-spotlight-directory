
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";
import { formatWebsiteUrl } from "./url-utils";

export const transformContractor = async (dbContractor: DatabaseContractor): Promise<Contractor> => {
  // Add detailed logging for debugging
  console.log('Processing contractor:', dbContractor.business_name, {
    hasGooglePhotos: !!dbContractor.google_photos,
    googlePhotosType: typeof dbContractor.google_photos,
    rawGooglePhotos: dbContractor.google_photos,
    hasImages: Array.isArray(dbContractor.images) && dbContractor.images.length > 0,
    rawImages: dbContractor.images
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
      
      // Handle both string and already parsed object cases
      if (typeof photosData === 'string') {
        try {
          photosData = JSON.parse(photosData);
        } catch (e) {
          console.error('Failed to parse google_photos string:', photosData);
          photosData = null;
        }
      }
      
      // Log the raw parsed data
      console.log('Raw parsed photos data:', {
        business: dbContractor.business_name,
        data: photosData
      });
      
      if (Array.isArray(photosData)) {
        google_photos = photosData
          .filter(photo => {
            // More detailed validation
            if (!photo) {
              console.log('Null or undefined photo object');
              return false;
            }
            
            if (typeof photo !== 'object') {
              console.log('Photo is not an object:', typeof photo);
              return false;
            }
            
            if (!('url' in photo)) {
              console.log('Photo missing url property:', Object.keys(photo));
              return false;
            }
            
            if (!photo.url || typeof photo.url !== 'string') {
              console.log('Invalid url in photo:', photo.url);
              return false;
            }
            
            return true;
          })
          .map(photo => ({
            url: String(photo.url),
            width: Number(photo.width || 0),
            height: Number(photo.height || 0),
            type: String(photo.type || '')
          }));
          
        console.log('Processed photos result:', {
          business: dbContractor.business_name,
          totalPhotos: photosData.length,
          validPhotos: google_photos.length,
          firstValidPhoto: google_photos[0]
        });
      } else {
        console.log('Photos data is not an array:', {
          business: dbContractor.business_name,
          type: typeof photosData,
          value: photosData
        });
      }
    } catch (e) {
      console.error('Error processing google_photos for', dbContractor.business_name, e);
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
    images: Array.isArray(dbContractor.images) 
      ? dbContractor.images.filter(img => img && typeof img === 'string' && img.startsWith('http')) 
      : [],
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
