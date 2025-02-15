
import { Contractor } from "@/types/contractor";
import { specialtyImages, defaultImages } from "./image-collections";

const createImageHash = (uniqueString: string): number => {
  return uniqueString.split('').reduce((sum, char, index) => {
    // Use prime numbers for better distribution
    return sum + char.charCodeAt(0) * ((index + 1) * 31);
  }, 0);
};

export const selectImage = (contractor: Contractor): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  const unsplashParams = "?auto=format&fit=crop&w=800&q=80";

  let availableImages = defaultImages;
  
  if (contractor.specialty) {
    const normalizedSpecialty = contractor.specialty.toLowerCase();
    availableImages = specialtyImages[normalizedSpecialty] || defaultImages;
  }

  // Use multiple contractor properties for better distribution
  const uniqueString = `${contractor.id}-${contractor.business_name}-${contractor.specialty || ''}`;
  const hash = createImageHash(uniqueString);
  const index = Math.abs(hash) % availableImages.length;
  const photoId = availableImages[index];

  return `${baseUrl}${photoId}${unsplashParams}`;
};
