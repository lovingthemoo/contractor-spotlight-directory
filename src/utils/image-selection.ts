
import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Get the specialty type from the database types
type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

const getStorageUrl = (path: string): string => {
  // If path is empty or null, return placeholder
  if (!path) {
    console.debug('Empty path provided, using placeholder');
    return '/placeholder.svg';
  }

  // If it's already a full URL (e.g. https://...), return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If it's a storage URL that already includes the full path, return as is
  if (path.includes('storage/v1/object/public')) {
    return path;
  }
  
  // For google photos URLs, return as is
  if (path.startsWith('photos/')) {
    return path;
  }
  
  // Ensure the path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the full storage URL
  const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/contractor-images/${cleanPath}`;
  console.debug('Constructed storage URL:', {
    originalPath: path,
    cleanPath,
    storageUrl,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL
  });
  return storageUrl;
};

const getSpecialtyFallbackImage = async (specialty: ContractorSpecialty): Promise<string> => {
  try {
    console.debug('Getting fallback image for specialty:', specialty);
    
    // Get a random active specialty image that:
    // 1. Matches the specialty
    // 2. Is marked as active
    // 3. Isn't marked as broken
    // 4. Preferably hasn't been used recently
    const { data: specialtyImages, error } = await supabase
      .from('contractor_images')
      .select('storage_path')
      .eq('image_type', 'specialty')
      .eq('is_active', true)
      .not('storage_path', 'in', (
        supabase
          .from('broken_image_urls')
          .select('url')
          .eq('specialty', specialty)
      ))
      .order('RANDOM()')  // Randomize selection
      .limit(1);

    if (error) {
      console.error('Error fetching specialty fallback image:', error);
      return '/placeholder.svg';
    }

    if (!specialtyImages?.length) {
      console.debug('No specialty fallback images found, using placeholder');
      return '/placeholder.svg';
    }

    const fallbackUrl = getStorageUrl(specialtyImages[0].storage_path);
    console.debug('Selected fallback image:', {
      specialty,
      url: fallbackUrl
    });
    
    return fallbackUrl;
  } catch (error) {
    console.error('Error getting specialty fallback image:', error);
    return '/placeholder.svg';
  }
};

const markImageAsBroken = async (url: string, specialty?: ContractorSpecialty) => {
  try {
    const { error } = await supabase
      .from('broken_image_urls')
      .insert({
        url,
        specialty,
        reported_by: 'system',
        error_message: 'Image failed to load'
      })
      .single();

    if (error) {
      console.error('Error marking image as broken:', error);
    }
  } catch (error) {
    console.error('Error in markImageAsBroken:', error);
  }
};

export const selectImage = async (contractor: Contractor): Promise<string> => {
  if (!contractor?.specialty) {
    console.debug('No specialty provided for contractor:', contractor?.business_name);
    return '/placeholder.svg';
  }

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
          .eq('specialty', contractor.specialty)
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
        .eq('specialty', contractor.specialty)
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
          .eq('specialty', contractor.specialty)
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
    return await getSpecialtyFallbackImage(contractor.specialty);
  } catch (error) {
    console.error('Error selecting image:', error);
    return '/placeholder.svg';
  }
};

export { markImageAsBroken };
