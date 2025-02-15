
import { supabase } from "@/integrations/supabase/client";
import type { ContractorSpecialty } from "@/types/image-types";
import { getStorageUrl } from "./storage-url";
import { getBrokenUrls } from "./broken-image-handler";

export const getSpecialtyFallbackImage = async (specialty: ContractorSpecialty): Promise<string> => {
  try {
    console.debug('Getting fallback image for specialty:', specialty);
    
    // Get list of broken URLs
    const brokenUrlList = await getBrokenUrls(specialty);
    
    // Get specialty images that aren't in the broken URLs list
    const { data: specialtyImages, error } = await supabase
      .from('contractor_images')
      .select('storage_path')
      .eq('image_type', 'specialty')
      .eq('is_active', true)
      .not('storage_path', 'in', `(${brokenUrlList.map(url => `'${url}'`).join(',')})`);
    
    if (error) {
      console.error('Error fetching specialty fallback image:', error);
      return '/placeholder.svg';
    }

    if (!specialtyImages?.length) {
      console.debug('No specialty fallback images found, using placeholder');
      return '/placeholder.svg';
    }

    // Take a random image from the results
    const randomIndex = Math.floor(Math.random() * specialtyImages.length);
    const fallbackUrl = getStorageUrl(specialtyImages[randomIndex].storage_path);
    
    console.debug('Selected random fallback image:', {
      specialty,
      url: fallbackUrl,
      totalAvailable: specialtyImages.length
    });
    
    return fallbackUrl;
  } catch (error) {
    console.error('Error getting specialty fallback image:', error);
    return '/placeholder.svg';
  }
};
