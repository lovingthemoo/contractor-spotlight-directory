
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";

const extractYearsInBusiness = (value: string | number | null): number | undefined => {
  if (!value) return undefined;
  
  if (typeof value === 'number') return value;
  
  // Handle string formats like "10+ years in business" or "5+ years"
  const match = String(value).match(/(\d+)(?:\+)?\s*(?:years?)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return undefined;
};

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

export const transformContractor = (dbContractor: DatabaseContractor): Contractor => {
  let google_reviews: GoogleReview[] | undefined;
  let google_photos: GooglePhoto[] | undefined;
  
  // Parse Google reviews if available
  if (dbContractor.google_reviews) {
    try {
      const reviewsData = typeof dbContractor.google_reviews === 'string' 
        ? JSON.parse(dbContractor.google_reviews) 
        : dbContractor.google_reviews;
        
      google_reviews = Array.isArray(reviewsData) 
        ? reviewsData.map(review => ({
            rating: Number(review.rating) || 0,
            text: String(review.text || ''),
            time: String(review.time || ''),
            author_name: String(review.author_name || '')
          }))
        : undefined;
    } catch (e) {
      console.error('Error parsing google_reviews:', e);
      google_reviews = undefined;
    }
  }

  // Parse Google photos if available
  if (dbContractor.google_photos) {
    try {
      const photosData = typeof dbContractor.google_photos === 'string'
        ? JSON.parse(dbContractor.google_photos)
        : dbContractor.google_photos;

      google_photos = Array.isArray(photosData)
        ? photosData.map(photo => ({
            url: String(photo.url || ''),
            width: Number(photo.width) || 0,
            height: Number(photo.height) || 0,
            type: String(photo.type || '')
          }))
        : undefined;
    } catch (e) {
      console.error('Error parsing google_photos:', e);
      google_photos = undefined;
    }
  }

  // Use database years_in_business or calculate from founded_year if available
  const years_in_business = dbContractor.years_in_business || 
    (dbContractor.founded_year 
      ? new Date().getFullYear() - dbContractor.founded_year 
      : undefined);

  // Use database certifications or parse from string if needed
  const certifications = dbContractor.certifications 
    ? (Array.isArray(dbContractor.certifications) 
        ? dbContractor.certifications 
        : typeof dbContractor.certifications === 'string'
          ? JSON.parse(dbContractor.certifications)
          : undefined)
    : undefined;

  const website_url = formatWebsiteUrl(dbContractor.website_url);

  // Use database rating if available, or calculate from Google reviews if present
  const rating = dbContractor.rating 
    ? Number(Number(dbContractor.rating).toFixed(1))
    : google_reviews && google_reviews.length > 0
      ? Number((google_reviews.reduce((sum, review) => sum + review.rating, 0) / google_reviews.length).toFixed(1))
      : undefined;

  // Use database review count if available, or count Google reviews if present
  const review_count = dbContractor.review_count || 
    (google_reviews ? google_reviews.length : 0);

  return {
    ...dbContractor,
    google_reviews,
    google_photos,
    certifications,
    years_in_business,
    website_url,
    rating,
    review_count,
    images: dbContractor.images || [],
    project_types: dbContractor.project_types || []
  };
};

export const getDisplayImage = (contractor: Contractor): string => {
  const exteriorPhoto = contractor.google_photos?.find(photo => photo.type === 'exterior');
  if (exteriorPhoto?.url) return exteriorPhoto.url;

  const workPhoto = contractor.google_photos?.find(photo => photo.type === 'work_sample');
  if (workPhoto?.url) return workPhoto.url;

  if (contractor.google_photos?.[0]?.url) return contractor.google_photos[0].url;

  if (contractor.images?.[0]) return contractor.images[0];

  return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e';
};

export const getDisplayAddress = (contractor: Contractor): string => {
  return contractor.google_formatted_address || contractor.location || 'London';
};
