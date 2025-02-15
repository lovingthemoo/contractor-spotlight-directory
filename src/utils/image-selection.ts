
import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Get the specialty type from the database types
type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

const getStorageUrl = (path: string): string => {
  // If it's already a full URL (e.g. https://...), return as is
  if (path.startsWith('http')) {
    // Special case: if it's an Unsplash URL that we know is failing, return placeholder
    if (path.includes('unsplash.com/photo-1581094794329-c8112a89df44')) {
      console.debug('Detected broken Unsplash URL, using placeholder');
      return '/placeholder.svg';
    }
    return path;
  }
  
  // Ensure the path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the full storage URL
  const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/contractor-images/${cleanPath}`;
  console.debug('Constructed storage URL:', {
    originalPath: path,
    cleanPath,
    storageUrl
  });
  return storageUrl;
};

export const selectImage = async (contractor: Contractor): Promise<string> => {
  if (!contractor?.specialty) {
    console.debug('No specialty provided for contractor:', contractor?.business_name);
    return '/placeholder.svg';
  }

  try {
    // First, if the contractor has a default_specialty_image, use it
    if (contractor.default_specialty_image) {
      const imageUrl = getStorageUrl(contractor.default_specialty_image);
      console.debug('Using default specialty image:', {
        contractor: contractor.business_name,
        image: contractor.default_specialty_image,
        url: imageUrl
      });
      return imageUrl;
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
