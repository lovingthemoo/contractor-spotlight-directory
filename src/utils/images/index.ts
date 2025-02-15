
import { roofingImages } from './roofing-images';
import { buildingImages } from './building-images';
import { electricalImages } from './electrical-images';
import { plumbingImages } from './plumbing-images';
import { homeRepairImages } from './home-repair-images';
import { handymanImages } from './handyman-images';
import { gardeningImages } from './gardening-images';
import { constructionImages } from './construction-images';
import { defaultImages } from './default-images';

export const specialtyImages: Record<string, string[]> = {
  roofing: roofingImages,
  building: buildingImages,
  electrical: electricalImages,
  plumbing: plumbingImages,
  'home repair': homeRepairImages,
  handyman: handymanImages,
  gardening: gardeningImages,
  construction: constructionImages
};

export { defaultImages };

// Utility function to get random images for new specialties
export const getRandomDescription = (descriptions: string[]): string => {
  const index = Math.floor(Math.random() * descriptions.length);
  return descriptions[index];
};
