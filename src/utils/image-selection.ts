
import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";
import { isValidSpecialty } from "./specialty-validator";
import { getStorageUrl } from "./storage-url";
import { markImageAsBroken } from "./broken-image-handler";
import { getSpecialtyFallbackImage } from "./fallback-image";

export const selectImage = async (contractor: Contractor): Promise<string> => {
  // Validate specialty before proceeding
  if (!contractor?.specialty || !isValidSpecialty(contractor.specialty)) {
    console.debug('Invalid or no specialty provided for contractor:', contractor?.business_name);
    return '/placeholder.svg';
  }

  const specialty = contractor.specialty;

  try {
    // First check for Google Photos
    if (contractor.google_photos && contractor.google_photos.length > 0) {
      const photo = contractor.google_photos[0];
      if (photo.url) {
        // Check if the URL is known to be broken
        const { data: brokenCheck } = await supabase
          .from('broken_image_urls')
          .select('url')
          .eq('url', photo.url)
          .eq('specialty', specialty)
          .maybeSingle();

        if (!brokenCheck) {
          console.debug('Using Google photo:', {
            contractor: contractor.business_name,
            url: photo.url
          });
          return photo.url;
        }
      }
    }

    // Then check for default specialty image
    if (contractor.default_specialty_image) {
      const imageUrl = getStorageUrl(contractor.default_specialty_image);
      
      // Check if the URL is known to be broken
      const { data: brokenCheck } = await supabase
        .from('broken_image_urls')
        .select('url')
        .eq('url', imageUrl)
        .eq('specialty', specialty)
        .maybeSingle();

      if (!brokenCheck) {
        console.debug('Using default specialty image:', {
          contractor: contractor.business_name,
          image: contractor.default_specialty_image,
          url: imageUrl
        });
        return imageUrl;
      }
    }

    // Then try to get contractor-specific images
    if (contractor.id) {
      const { data: contractorImages, error: contractorImagesError } = await supabase
        .from('contractor_images')
        .select('storage_path')
        .eq('contractor_id', contractor.id)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .limit(1);

      if (!contractorImagesError && contractorImages && contractorImages.length > 0) {
        const imageUrl = getStorageUrl(contractorImages[0].storage_path);
        
        // Check if the URL is known to be broken
        const { data: brokenCheck } = await supabase
          .from('broken_image_urls')
          .select('url')
          .eq('url', imageUrl)
          .eq('specialty', specialty)
          .maybeSingle();

        if (!brokenCheck) {
          console.debug('Found contractor-specific image:', {
            contractor: contractor.business_name,
            path: contractorImages[0].storage_path,
            url: imageUrl
          });
          return imageUrl;
        }
      }
      
      if (contractorImagesError) {
        console.error('Error fetching contractor images:', {
          error: contractorImagesError,
          contractor: contractor.business_name
        });
      }
    }

    // If no working images found, get a specialty-specific fallback image
    return await getSpecialtyFallbackImage(specialty);
  } catch (error) {
    console.error('Error selecting image:', error);
    return '/placeholder.svg';
  }
};

export { markImageAsBroken };
