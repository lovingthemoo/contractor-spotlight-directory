import { Contractor } from "@/types/contractor";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Get the specialty type from the database types
type ContractorSpecialty = Database['public']['Enums']['contractor_specialty'];

// Cache to track recently used images per specialty
const recentlyUsedImages: Record<string, Set<string>> = {};

const getStorageUrl = (path: string): string => {
  // If path is empty or null, return placeholder
  if (!path) {
    console.debug('Empty path provided, using placeholder');
    return '/placeholder.svg';
  }

  // If it's already a full URL (e.g. https://...), return as is
  if (path.startsWith('http')) {
    // Special case: if it's an Unsplash URL that we know is failing, return placeholder
    if (path.includes('unsplash.com/photo-1581094794329-c8112a89df44')) {
      console.debug('Detected broken Unsplash URL, using placeholder');
      return '/placeholder.svg';
    }
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

const getUnusedImage = (images: { storage_path: string }[], specialty: string): { storage_path: string } | null => {
  if (!images || images.length === 0) return null;
  
  // Initialize set for this specialty if it doesn't exist
  if (!recentlyUsedImages[specialty]) {
    recentlyUsedImages[specialty] = new Set();
  }
  
  // If all images have been used, clear the set and start over
  if (recentlyUsedImages[specialty].size >= images.length) {
    recentlyUsedImages[specialty].clear();
  }
  
  // Find an image that hasn't been used recently
  for (const image of images) {
    if (!recentlyUsedImages[specialty].has(image.storage_path)) {
      recentlyUsedImages[specialty].add(image.storage_path);
      return image;
    }
  }
  
  // If all images are used (shouldn't happen due to clear above), use first one
  recentlyUsedImages[specialty].add(images[0].storage_path);
  return images[0];
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
        console.debug('Using Google photo:', {
          contractor: contractor.business_name,
          url: photo.url
        });
        return photo.url;
      }
    }

    // Then check for default specialty image
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

    // Finally try specialty images, getting recently downloaded ones first
    const { data: specialtyImages, error: specialtyError } = await supabase
      .from('contractor_images')
      .select('storage_path')
      .is('contractor_id', null)
      .eq('image_type', 'specialty')
      .eq('is_active', true)
      .order('created_at', { ascending: false }) // Get most recently added first
      .order('priority', { ascending: true });

    if (specialtyError) {
      console.error('Error fetching specialty images:', specialtyError);
      return '/placeholder.svg';
    }

    if (!specialtyImages || specialtyImages.length === 0) {
      console.debug('No specialty images found, using placeholder');
      return '/placeholder.svg';
    }

    // Get an unused image for this specialty
    const selectedImage = getUnusedImage(specialtyImages, contractor.specialty);
    if (!selectedImage) {
      console.debug('No unused images found, using placeholder');
      return '/placeholder.svg';
    }

    const imageUrl = getStorageUrl(selectedImage.storage_path);
    console.debug('Selected specialty image:', {
      contractor: contractor.business_name,
      totalImages: specialtyImages.length,
      path: selectedImage.storage_path,
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
