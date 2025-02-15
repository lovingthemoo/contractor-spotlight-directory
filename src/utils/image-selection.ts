
import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Get the specialty type from the database types
type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

const getStorageUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/contractor-images/${path}`;
};

export const selectImage = async (contractor: Contractor): Promise<string> => {
  if (!contractor?.specialty) {
    console.debug('No specialty provided for contractor:', contractor?.business_name);
    return '/placeholder.svg';
  }

  try {
    // First try to get contractor-specific images
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
        console.debug('Found contractor-specific image:', {
          contractor: contractor.business_name,
          path: contractorImages[0].storage_path,
          url: imageUrl
        });
        return imageUrl;
      }
      
      if (contractorImagesError) {
        console.error('Error fetching contractor images:', {
          error: contractorImagesError,
          contractor: contractor.business_name
        });
      }
    }

    // Fallback to specialty images
    const { data: specialtyImages, error: specialtyError } = await supabase
      .from('contractor_images')
      .select('storage_path')
      .is('contractor_id', null)
      .eq('image_type', 'specialty')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (specialtyError) {
      console.error('Error fetching specialty images:', specialtyError);
      return '/placeholder.svg';
    }

    if (!specialtyImages || specialtyImages.length === 0) {
      console.debug('No specialty images found, using placeholder');
      return '/placeholder.svg';
    }

    // Select a specialty image based on contractor properties
    const uniqueString = `${contractor.id}-${contractor.business_name}-${contractor.specialty}`;
    const selectedIndex = Math.abs(createImageHash(uniqueString)) % specialtyImages.length;
    const imageUrl = getStorageUrl(specialtyImages[selectedIndex].storage_path);
    
    console.debug('Selected specialty image:', {
      contractor: contractor.business_name,
      totalImages: specialtyImages.length,
      selectedIndex,
      path: specialtyImages[selectedIndex].storage_path,
      url: imageUrl
    });

    return imageUrl;
  } catch (error) {
    console.error('Error selecting image:', error);
    return '/placeholder.svg';
  }
};

const createImageHash = (uniqueString: string): number => {
  return uniqueString.split('').reduce((sum, char, index) => {
    return sum + char.charCodeAt(0) * ((index + 1) * 31);
  }, 0);
};
