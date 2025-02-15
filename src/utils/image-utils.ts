
import { Contractor } from "@/types/contractor";

const getFallbackImage = (specialty?: string): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  switch (specialty?.toLowerCase()) {
    case "roofing":
      return `${baseUrl}1632863677807-846708d2e7f4`; // Roofing image
    case "building":
    case "construction":
      return `${baseUrl}1503387762-592deb58ef4e`; // Construction site
    case "electrical":
      return `${baseUrl}1565193492-05bd3fa5cf4c`; // Electrical work
    case "plumbing":
      return `${baseUrl}1504328345606-16dec41d99b7`; // Plumbing
    case "home repair":
    case "handyman":
      return `${baseUrl}1581578731048-c40b7c3dbf30`; // Tools
    case "gardening":
      return `${baseUrl}1466692476868-9ee5a3a3e93b`; // Garden
    default:
      return `${baseUrl}1503387762-592deb58ef4e`; // Generic construction
  }
};

export const getDisplayImage = (contractor: Contractor): string => {
  // Log available images for debugging
  console.log('Image sources for', contractor.business_name, {
    uploadedImages: contractor.images?.length || 0,
    googlePhotos: contractor.google_photos?.length || 0,
    specialty: contractor.specialty
  });

  // Priority 1: Company-specific uploaded images
  if (contractor.images && Array.isArray(contractor.images) && contractor.images.length > 0) {
    const validUploadedImages = contractor.images.filter(img => 
      typeof img === 'string' && 
      img.trim().length > 0 && 
      img.startsWith('http')
    );

    if (validUploadedImages.length > 0) {
      console.log('Using uploaded image:', validUploadedImages[0]);
      return validUploadedImages[0];
    }
  }
  
  // Priority 2: Google photos
  if (contractor.google_photos && Array.isArray(contractor.google_photos)) {
    const validGooglePhotos = contractor.google_photos.filter(photo => 
      photo && 
      typeof photo === 'object' &&
      'url' in photo &&
      photo.url &&
      typeof photo.url === 'string' &&
      photo.url.trim().length > 0 &&
      photo.url.startsWith('http')
    );

    if (validGooglePhotos.length > 0) {
      const photoUrl = validGooglePhotos[0].url;
      console.log('Using Google photo:', photoUrl);
      return photoUrl;
    }
  }
  
  // Return fallback image if no valid images found
  const fallbackImage = getFallbackImage(contractor.specialty);
  console.log('Using fallback image for', contractor.business_name, fallbackImage);
  return fallbackImage;
};
