
import { Contractor } from "@/types/contractor";

const getFallbackImage = (specialty?: string): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  const unsplashParams = "?auto=format&fit=crop&w=800&q=80";
  
  let photoId: string;
  
  switch (specialty?.toLowerCase()) {
    case "roofing":
      photoId = "1632863677807-846708d2e7f4"; // Roofing image
      break;
    case "building":
    case "construction":
      photoId = "1503387762-592deb58ef4e"; // Construction site
      break;
    case "electrical":
      photoId = "1565193492-05bd3fa5cf4c"; // Electrical work
      break;
    case "plumbing":
      photoId = "1504328345606-16dec41d99b7"; // Plumbing
      break;
    case "home repair":
    case "handyman":
      photoId = "1581578731048-c40b7c3dbf30"; // Tools
      break;
    case "gardening":
      photoId = "1466692476868-9ee5a3a3e93b"; // Garden
      break;
    default:
      photoId = "1503387762-592deb58ef4e"; // Generic construction
  }

  return `${baseUrl}${photoId}${unsplashParams}`;
};

export const getDisplayImage = (contractor: Contractor): string => {
  // First try uploaded images
  if (contractor.images && contractor.images.length > 0) {
    const validImage = contractor.images.find(img => 
      typeof img === 'string' && 
      img.trim().length > 0 && 
      img.startsWith('http')
    );
    
    if (validImage) {
      console.log('Using uploaded image for', contractor.business_name, validImage);
      return validImage;
    }
  }
  
  // Then try Google photos
  if (contractor.google_photos && contractor.google_photos.length > 0) {
    const validPhoto = contractor.google_photos.find(photo => 
      photo && 
      photo.url && 
      typeof photo.url === 'string' && 
      photo.url.startsWith('http')
    );

    if (validPhoto) {
      console.log('Using Google photo for', contractor.business_name, validPhoto.url);
      return validPhoto.url;
    }
  }
  
  // Fallback to default image
  const fallbackImage = getFallbackImage(contractor.specialty);
  console.log('Using fallback image for', contractor.business_name);
  return fallbackImage;
};
