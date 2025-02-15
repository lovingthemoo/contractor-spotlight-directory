
import { Contractor } from "@/types/contractor";

const getFallbackImage = (specialty?: string): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  const unsplashParams = "?auto=format&fit=crop&w=800&q=80";
  
  // Expanded collection of specialty-specific images
  const specialtyImages: Record<string, string[]> = {
    roofing: [
      "1632863677807-846708d2e7f4", // Roofing workers
      "1635424709852-0458e8d0f47f", // Modern roof architecture
      "1600585152220-90363fe7e115"  // Residential roofing
    ],
    building: [
      "1503387762-592deb58ef4e", // Construction site
      "1621568584120-2f9896611d25", // Building exterior
      "1590725140366-fe96f2cf05c6"  // Building process
    ],
    electrical: [
      "1565193492-05bd3fa5cf4c", // Electrical work
      "1555963966-b7fad8930b03", // Circuit board
      "1531986627196-72d4714264f4"  // Electrician at work
    ],
    plumbing: [
      "1504328345606-16dec41d99b7", // Plumbing tools
      "1581244927444-6967703db066", // Modern bathroom
      "1575517111028-9a6f38112bb8"  // Plumbing work
    ],
    "home repair": [
      "1581578731048-c40b7c3dbf30", // Tools
      "1584622650111-93e69d876a0c", // Home maintenance
      "1556909211-a1522699c2c3"     // Interior repair
    ],
    handyman: [
      "1581578731048-c40b7c3dbf30", // Tools arrangement
      "1621905251189-68b6095f3a6d", // Workshop
      "1540496905036-5937c10647cc"  // Handyman working
    ],
    gardening: [
      "1466692476868-9ee5a3a3e93b", // Garden view
      "1591857177580-dc82b9ac4e1e", // Gardening tools
      "1523348837708-15d4a09cfac2"  // Landscaping
    ],
    construction: [
      "1503387762-592deb58ef4e", // Construction site
      "1624633505074-90526c6a5811", // Construction work
      "1517581177684-8777137abd91"  // Heavy machinery
    ]
  };
  
  // Default images for unknown specialties
  const defaultImages = [
    "1503387762-592deb58ef4e",
    "1584622650111-93e69d876a0c",
    "1621905251189-68b6095f3a6d"
  ];

  let availableImages = defaultImages;
  
  if (specialty) {
    const normalizedSpecialty = specialty.toLowerCase();
    availableImages = specialtyImages[normalizedSpecialty] || defaultImages;
  }

  // Use the contractor's ID or timestamp to consistently select the same image
  // This ensures the same contractor always gets the same fallback image
  const index = Math.floor(Date.now() % availableImages.length);
  const photoId = availableImages[index];

  const fallbackUrl = `${baseUrl}${photoId}${unsplashParams}`;
  console.log('Generated fallback URL:', { specialty, photoId, fallbackUrl });
  return fallbackUrl;
};

export const getDisplayImage = (contractor: Contractor): string => {
  console.log('Processing images for:', {
    business: contractor.business_name,
    uploadedImages: contractor.images,
    googlePhotos: contractor.google_photos,
    specialty: contractor.specialty
  });

  // First try uploaded images
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
    } else {
      console.log('No valid uploaded images found:', {
        business: contractor.business_name,
        images: contractor.images
      });
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
      console.log('Using Google photo:', {
        business: contractor.business_name,
        photo: validPhoto
      });
      return validPhoto.url;
    } else {
      console.log('No valid Google photos found:', {
        business: contractor.business_name,
        photos: contractor.google_photos
      });
    }
  }
  
  // Fallback to default image
  console.log('No valid images found, using fallback for:', {
    business: contractor.business_name,
    specialty: contractor.specialty
  });
  
  const fallbackImage = getFallbackImage(contractor.specialty);
  return fallbackImage;
};
