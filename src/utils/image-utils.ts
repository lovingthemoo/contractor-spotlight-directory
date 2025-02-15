
import { Contractor } from "@/types/contractor";

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper to validate photo object
const isValidGooglePhoto = (photo: any): boolean => {
  if (!photo || typeof photo !== 'object') {
    console.debug('Invalid photo object:', photo);
    return false;
  }
  
  if (typeof photo.url !== 'string' || !isValidUrl(photo.url)) {
    console.debug('Invalid photo URL:', photo.url);
    return false;
  }
  
  return true;
};

export const getDisplayImage = (contractor: Contractor): string => {
  if (!contractor?.specialty) {
    console.debug('No contractor or specialty provided');
    return '/placeholder.svg';
  }

  // Get image priority order with fallback
  const priorityOrder = contractor.image_priority?.order || [
    "google_photos",
    "uploaded_images", 
    "default_specialty_image"
  ];

  console.debug('Processing images for:', {
    business: contractor.business_name,
    specialty: contractor.specialty,
    priorityOrder
  });

  // Try each image source in priority order
  for (const source of priorityOrder) {
    try {
      switch (source) {
        case "google_photos": {
          const photos = contractor.google_photos;
          if (Array.isArray(photos) && photos.length > 0) {
            const validPhoto = photos.find(isValidGooglePhoto);
            if (validPhoto?.url) {
              console.debug('Using Google photo:', validPhoto.url);
              return validPhoto.url;
            }
          }
          break;
        }

        case "uploaded_images": {
          const images = contractor.images;
          if (Array.isArray(images) && images.length > 0) {
            const validImage = images.find(img => typeof img === 'string' && isValidUrl(img));
            if (validImage) {
              console.debug('Using uploaded image:', validImage);
              return validImage;
            }
          }
          break;
        }

        case "default_specialty_image": {
          const defaultImage = contractor.default_specialty_image;
          if (defaultImage && isValidUrl(defaultImage)) {
            console.debug('Using default specialty image:', defaultImage);
            return defaultImage;
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing image source:', {
        source,
        business: contractor.business_name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.debug('No valid images found, using placeholder');
  return '/placeholder.svg';
};
