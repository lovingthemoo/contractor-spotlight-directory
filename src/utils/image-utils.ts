
import { Contractor } from "@/types/contractor";

export const getDisplayImage = (contractor: Contractor): string => {
  console.log('Processing images for:', {
    business: contractor.business_name,
    uploadedImages: contractor.images,
    googlePhotos: contractor.google_photos,
    specialty: contractor.specialty,
    defaultImage: contractor.default_specialty_image,
    imagePriority: contractor.image_priority
  });

  // Follow the priority order defined in contractor.image_priority
  const priorityOrder = contractor?.image_priority?.order || ["google_photos", "uploaded_images", "default_specialty_image"];
  
  for (const source of priorityOrder) {
    switch (source) {
      case "google_photos":
        if (contractor.google_photos && Array.isArray(contractor.google_photos) && contractor.google_photos.length > 0) {
          const validPhoto = contractor.google_photos.find(photo => 
            photo && 
            photo.url && 
            typeof photo.url === 'string' &&
            photo.url.trim().length > 0
          );

          if (validPhoto) {
            console.log('Using Google photo:', {
              business: contractor.business_name,
              photo: validPhoto.url
            });
            return validPhoto.url;
          }
        }
        break;

      case "uploaded_images":
        if (Array.isArray(contractor.images) && contractor.images.length > 0) {
          const validImage = contractor.images.find(img => 
            typeof img === 'string' && 
            img.trim().length > 0
          );
          
          if (validImage) {
            console.log('Using uploaded image:', {
              business: contractor.business_name,
              image: validImage
            });
            return validImage;
          }
        }
        break;

      case "default_specialty_image":
        if (contractor.default_specialty_image) {
          const defaultImage = contractor.default_specialty_image.trim();
          if (defaultImage.length > 0) {
            console.log('Using default specialty image:', {
              business: contractor.business_name,
              specialty: contractor.specialty,
              image: defaultImage
            });
            return defaultImage;
          }
        }
        break;
    }
  }
  
  // If no valid image is found, return placeholder
  console.log('No valid image found, using placeholder:', {
    business: contractor.business_name,
    priorityOrder,
    defaultImage: contractor.default_specialty_image
  });
  return '/placeholder.svg';
};
