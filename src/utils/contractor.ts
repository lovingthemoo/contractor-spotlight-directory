
import { Contractor, DatabaseContractor, GooglePhoto, GoogleReview } from "@/types/contractor";

const extractYearsInBusiness = (value: string | number | null): number | undefined => {
  if (!value) return undefined;
  
  if (typeof value === 'number') return value;
  
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

  const years_in_business = dbContractor.years_in_business || 
    (dbContractor.founded_year 
      ? new Date().getFullYear() - dbContractor.founded_year 
      : undefined);

  const certifications = dbContractor.certifications 
    ? (Array.isArray(dbContractor.certifications) 
        ? dbContractor.certifications 
        : typeof dbContractor.certifications === 'string'
          ? JSON.parse(dbContractor.certifications)
          : undefined)
    : undefined;

  const website_url = formatWebsiteUrl(dbContractor.website_url);

  const rating = dbContractor.rating 
    ? Number(dbContractor.rating)
    : undefined;

  return {
    ...dbContractor,
    google_reviews,
    google_photos,
    certifications,
    years_in_business,
    website_url,
    rating,
    review_count: dbContractor.review_count || 0,
    images: dbContractor.images || [],
    project_types: dbContractor.project_types || []
  };
};

export const getDisplayImage = (contractor: Contractor): string => {
  if (contractor.google_photos?.[0]?.url) return contractor.google_photos[0].url;
  if (contractor.images?.[0]) return contractor.images[0];
  return '';
};

export const getDisplayAddress = (contractor: Contractor): string => {
  if (contractor.google_formatted_address) return contractor.google_formatted_address;
  if (contractor.location) return contractor.location;
  return '';
};
