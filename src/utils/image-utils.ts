
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

// Helper to format Unsplash URLs with proper parameters
const formatUnsplashUrl = (url: string): string => {
  if (!url) {
    console.debug('Empty URL provided to formatUnsplashUrl');
    return '';
  }
  
  // Check if it's an Unsplash URL
  if (!url.includes('images.unsplash.com')) {
    return url;
  }

  try {
    // Parse the URL to handle existing query parameters
    const urlObj = new URL(url);
    
    // Add or update required parameters
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('fit', 'crop');
    urlObj.searchParams.set('w', '800');
    urlObj.searchParams.set('q', '80');
    
    const formattedUrl = urlObj.toString();
    console.debug('Formatted Unsplash URL:', formattedUrl);
    return formattedUrl;
  } catch (error) {
    console.error('Error formatting Unsplash URL:', {
      originalUrl: url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return url;
  }
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
            const formattedUrl = formatUnsplashUrl(defaultImage);
            console.debug('Using default specialty image:', formattedUrl);
            return formattedUrl;
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
