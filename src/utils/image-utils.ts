
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

  console.log('Image selection process:', {
    business: contractor.business_name,
    specialty: contractor.specialty,
    hasGooglePhotos: Array.isArray(contractor.google_photos) && contractor.google_photos.length > 0,
    hasUploadedImages: Array.isArray(contractor.images) && contractor.images.length > 0,
    hasDefaultImage: Boolean(contractor.default_specialty_image),
    priorityOrder: imagePriority
  });

  // Try each image source according to priority
  for (const source of imagePriority) {
    switch (source) {
      case "google_photos":
        if (Array.isArray(contractor.google_photos)) {
          const validPhoto = contractor.google_photos.find(isValidGooglePhoto);
          if (validPhoto) {
            console.log('Selected Google photo:', {
              business: contractor.business_name,
              photo: validPhoto.url
            });
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
            console.log('Selected uploaded image:', {
              business: contractor.business_name,
              image: validImage
            });
            return validImage;
          }
        }
        break;

      case "default_specialty_image":
        if (contractor.default_specialty_image && isValidUrl(contractor.default_specialty_image)) {
          console.log('Selected default specialty image:', {
            business: contractor.business_name,
            image: contractor.default_specialty_image
          });
          return contractor.default_specialty_image;
        }
        break;
    }
  }

  // Fallback: Use a specialty-specific placeholder if available
  console.warn('No valid images found for:', {
    business: contractor.business_name,
    specialty: contractor.specialty
  });

  // Return the default placeholder
  return '/placeholder.svg';
};
