
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
  let google_reviews: GoogleReview[] | undefined;
  let google_photos: GooglePhoto[] | undefined;
  
  // Parse Google reviews if available
  if (dbContractor.google_reviews) {
    try {
      const reviewsData = typeof dbContractor.google_reviews === 'string' 
        ? JSON.parse(dbContractor.google_reviews) 
        : dbContractor.google_reviews;
        
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
      const photosData = typeof dbContractor.google_photos === 'string'
        ? JSON.parse(dbContractor.google_photos)
        : dbContractor.google_photos;

      if (Array.isArray(photosData) && photosData.length > 0) {
        google_photos = photosData.map(photo => ({
          url: String(photo.url || ''),
          width: Number(photo.width) || 0,
          height: Number(photo.height) || 0,
          type: String(photo.type || '')
        }));
      }
    } catch (e) {
      console.error('Error parsing google_photos:', e);
    }
  }

  // Check if enrichment is needed
  const needsEnrichment = !dbContractor.google_place_name || 
                         !dbContractor.rating || 
                         !dbContractor.years_in_business || 
                         !dbContractor.description;

  if (needsEnrichment) {
    console.log(`Marking contractor ${dbContractor.id} for enrichment`);
    await supabase
      .from('contractors')
      .update({
        needs_google_enrichment: true,
        last_enrichment_attempt: null
      })
      .eq('id', dbContractor.id);
  }

  // Only include fields that have actual values
  const contractor: Contractor = {
    ...dbContractor,
    rating: dbContractor.rating || undefined,
    review_count: dbContractor.review_count || 0,
    years_in_business: dbContractor.years_in_business || undefined,
    images: Array.isArray(dbContractor.images) ? dbContractor.images : [],
    project_types: Array.isArray(dbContractor.project_types) ? dbContractor.project_types : [],
    google_reviews: google_reviews || undefined,
    google_photos: google_photos || undefined,
    certifications: Array.isArray(dbContractor.certifications) ? dbContractor.certifications : undefined,
    website_url: formatWebsiteUrl(dbContractor.website_url)
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
  if (contractor.google_photos?.[0]?.url) return contractor.google_photos[0].url;
  if (Array.isArray(contractor.images) && contractor.images[0]) return contractor.images[0];
  return '';
};

export const getDisplayAddress = (contractor: Contractor): string => {
  if (contractor.google_formatted_address) return contractor.google_formatted_address;
  if (contractor.location) return contractor.location;
  return '';
};
