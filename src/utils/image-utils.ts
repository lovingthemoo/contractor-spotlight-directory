
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
  return photo && 
         typeof photo === 'object' && 
         typeof photo.url === 'string' && 
         isValidUrl(photo.url);
};

// Helper to format Unsplash URLs
const formatUnsplashUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=800&q=80`;
  }
  return url;
};

export const getDisplayImage = (contractor: Contractor): string => {
  // Default to placeholder if no contractor or specialty
  if (!contractor?.specialty) {
    return '/placeholder.svg';
  }

  // Get image priority order with fallback
  const priorityOrder = contractor.image_priority?.order || [
    "google_photos",
    "uploaded_images", 
    "default_specialty_image"
  ];

  // Try each image source in priority order
  for (const source of priorityOrder) {
    try {
      switch (source) {
        case "google_photos": {
          const photos = contractor.google_photos;
          if (Array.isArray(photos) && photos.length > 0) {
            const validPhoto = photos.find(isValidGooglePhoto);
            if (validPhoto?.url) {
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
              return validImage;
            }
          }
          break;
        }

        case "default_specialty_image": {
          const defaultImage = contractor.default_specialty_image;
          if (defaultImage && isValidUrl(defaultImage)) {
            return formatUnsplashUrl(defaultImage);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing image source:', {
        source,
        business: contractor.business_name,
        error: error.message
      });
    }
  }

  // Fallback to placeholder if no valid images found
  return '/placeholder.svg';
};
