
import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Get the specialty type from the database types
type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

export const selectImage = async (contractor: Contractor): Promise<string> => {
  if (!contractor?.specialty) {
    console.debug('No specialty provided for contractor:', contractor?.business_name);
    return '/placeholder.svg';
  }

  // Ensure specialty is of the correct type
  const specialty = contractor.specialty as ContractorSpecialty;

  try {
    // First try to get contractor-specific images
    if (contractor.id) {
      const { data: contractorImages, error: contractorImagesError } = await supabase
        .from('contractor_images')
        .select('storage_path')
        .eq('contractor_id', contractor.id)
        .eq('is_active', true)
        .order('priority');

      if (!contractorImagesError && contractorImages && contractorImages.length > 0) {
        const selectedImage = contractorImages[0];
        const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/contractor-images/${selectedImage.storage_path}`;
        console.debug('Using contractor-specific image:', {
          path: selectedImage.storage_path,
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
      .order('priority');

    if (specialtyError) {
      console.error('Error fetching specialty images:', specialtyError);
      return '/placeholder.svg';
    }

    if (!specialtyImages || specialtyImages.length === 0) {
      console.debug('No specialty images found for:', specialty);
      return '/placeholder.svg';
    }

    // Use multiple contractor properties for better distribution
    const uniqueString = `${contractor.id}-${contractor.business_name}-${specialty}`;
    const hash = createImageHash(uniqueString);
    const index = Math.abs(hash) % specialtyImages.length;
    
    const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/contractor-images/${specialtyImages[index].storage_path}`;
    
    console.debug('Selected specialty image:', {
      specialty,
      totalImages: specialtyImages.length,
      selectedIndex: index,
      path: specialtyImages[index].storage_path,
      url: imageUrl
    });

    return imageUrl;
  } catch (error) {
    console.error('Error in selectImage:', error);
    return '/placeholder.svg';
  }
};

const createImageHash = (uniqueString: string): number => {
  return uniqueString.split('').reduce((sum, char, index) => {
    // Use prime numbers for better distribution
    return sum + char.charCodeAt(0) * ((index + 1) * 31);
  }, 0);
};

