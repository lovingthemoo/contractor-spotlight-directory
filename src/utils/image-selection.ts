
import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";

export const selectImage = async (contractor: Contractor): Promise<string> => {
  if (!contractor?.specialty) {
    console.debug('No specialty provided for contractor:', contractor?.business_name);
    return '/placeholder.svg';
  }

  try {
    // Query the database for specialty images
    const { data: specialtyImages, error } = await supabase
      .from('specialty_default_images')
      .select('image_url')
      .eq('specialty', contractor.specialty)
      .eq('is_active', true)
      .order('priority');

    if (error) {
      console.error('Error fetching specialty images:', error);
      return '/placeholder.svg';
    }

    if (!specialtyImages || specialtyImages.length === 0) {
      console.debug('No specialty images found for:', contractor.specialty);
      return '/placeholder.svg';
    }

    // Use multiple contractor properties for better distribution
    const uniqueString = `${contractor.id}-${contractor.business_name}-${contractor.specialty}`;
    const hash = createImageHash(uniqueString);
    const index = Math.abs(hash) % specialtyImages.length;
    
    console.debug('Selected specialty image:', {
      specialty: contractor.specialty,
      totalImages: specialtyImages.length,
      selectedIndex: index,
      imageUrl: specialtyImages[index].image_url
    });

    return specialtyImages[index].image_url;
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
