
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

  // Check if enrichment is needed
  const needsEnrichment = !dbContractor.rating || 
    !dbContractor.years_in_business || 
    !dbContractor.description ||
    !dbContractor.google_reviews;

  if (needsEnrichment) {
    // Update the contractor to mark it for enrichment
    await supabase
      .from('contractors')
      .update({
        needs_google_enrichment: true,
        last_enrichment_attempt: null
      })
      .eq('id', dbContractor.id);
  }

  const website_url = formatWebsiteUrl(dbContractor.website_url);

  // Only use values that are actually present in the database
  return {
    ...dbContractor,
    google_reviews,
    google_photos,
    certifications: dbContractor.certifications || undefined,
    years_in_business: dbContractor.years_in_business || undefined,
    website_url,
    rating: dbContractor.rating || undefined,
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
