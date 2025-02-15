
import { Contractor } from "@/types/contractor";
import { selectImage } from "./image-selection";

export const getDisplayImage = (contractor: Contractor): string => {
  console.log('Processing images for:', {
    business: contractor.business_name,
    uploadedImages: contractor.images,
    googlePhotos: contractor.google_photos,
    specialty: contractor.specialty,
    defaultImage: contractor.default_specialty_image
  });

  // Follow the priority order defined in contractor.image_priority
  const priorityOrder = contractor.image_priority?.order || ["google_photos", "uploaded_images", "default_specialty_image"];
  
  for (const source of priorityOrder) {
    switch (source) {
      case "google_photos":
        if (contractor.google_photos && contractor.google_photos.length > 0) {
          const validPhoto = contractor.google_photos.find(photo => 
            photo && 
            photo.url && 
            typeof photo.url === 'string' && 
            photo.url.startsWith('http')
          );

          if (validPhoto) {
            console.log('Using Google photo:', {
              business: contractor.business_name,
              photo: validPhoto
            });
            return validPhoto.url;
          }
        }
        break;

      case "uploaded_images":
        if (contractor.images && contractor.images.length > 0) {
          const validImage = contractor.images.find(img => 
            typeof img === 'string' && 
            img.trim().length > 0 && 
            img.startsWith('http')
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
          console.log('Using default specialty image:', {
            business: contractor.business_name,
            specialty: contractor.specialty,
            image: contractor.default_specialty_image
          });
          return contractor.default_specialty_image;
        }
        break;
    }
  }
  
  // Final fallback to legacy system if everything else fails
  const fallbackUrl = selectImage(contractor);
  console.log('Using fallback image:', {
    business: contractor.business_name,
    specialty: contractor.specialty,
    url: fallbackUrl
  });
  
  return fallbackUrl;
};
