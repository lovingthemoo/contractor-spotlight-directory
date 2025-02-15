
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
  if (url.includes('images.unsplash.com')) {
    // Add required Unsplash parameters
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=800&q=80`;
  }
  return url;
};

export const getDisplayImage = (contractor: Contractor): string => {
  console.log('Starting image selection process for:', contractor.business_name);

  // Ensure we have a contractor with required fields
  if (!contractor || !contractor.specialty) {
    console.error('Invalid contractor data:', contractor);
    return '/placeholder.svg';
  }

  // Ensure we have valid image priority
  const imagePriority = contractor.image_priority?.order || [
    "google_photos",
    "uploaded_images",
    "default_specialty_image"
  ];

  // Try each image source according to priority
  for (const source of imagePriority) {
    switch (source) {
      case "google_photos":
        if (Array.isArray(contractor.google_photos)) {
          const validPhoto = contractor.google_photos.find(isValidGooglePhoto);
          if (validPhoto) {
            return validPhoto.url;
          }
        }
        break;

      case "uploaded_images":
        if (Array.isArray(contractor.images)) {
          const validImage = contractor.images.find(img => 
            typeof img === 'string' && isValidUrl(img)
          );
          if (validImage) {
            return validImage;
          }
        }
        break;

      case "default_specialty_image":
        if (contractor.default_specialty_image && isValidUrl(contractor.default_specialty_image)) {
          return formatUnsplashUrl(contractor.default_specialty_image);
        }
        break;
    }
  }

  // Return the default placeholder
  return '/placeholder.svg';
};
