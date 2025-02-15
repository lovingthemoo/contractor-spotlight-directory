
import { Contractor } from "@/types/contractor";

const getFallbackImage = (contractor: Contractor): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  const unsplashParams = "?auto=format&fit=crop&w=800&q=80";
  
  // Expanded collection of specialty-specific images with more options to reduce duplication
  const specialtyImages: Record<string, string[]> = {
    roofing: [
      "1632863677807-846708d2e7f4", // Roofing workers
      "1635424709852-0458e8d0f47f", // Modern roof architecture
      "1600585152220-90363fe7e115", // Residential roofing
      "1622003184639-ddbb3a35422c", // Roof tiles
      "1589939705384-5185137a7f0f", // Solar roof installation
      "1635424709852-0458e8d0f47f"  // Modern roofing
    ],
    building: [
      "1503387762-592deb58ef4e", // Construction site
      "1621568584120-2f9896611d25", // Building exterior
      "1590725140366-fe96f2cf05c6", // Building process
      "1541971875051-aec1c2f00405", // Modern building
      "1628744876479-bcd37bf5ed4c", // Building renovation
      "1589939705384-5185137a7f0f"  // Construction project
    ],
    electrical: [
      "1565193492-05bd3fa5cf4c", // Electrical work
      "1555963966-b7fad8930b03", // Circuit board
      "1531986627196-72d4714264f4", // Electrician at work
      "1558449907-8b82b0264682", // Electrical panel
      "1597694491841-16c3320db9ce", // Industrial electrical
      "1589939705384-5185137a7f0f"  // Smart home electrical
    ],
    plumbing: [
      "1504328345606-16dec41d99b7", // Plumbing tools
      "1581244927444-6967703db066", // Modern bathroom
      "1575517111028-9a6f38112bb8", // Plumbing work
      "1584622650111-93e69d876a0c", // Bathroom renovation
      "1632863677807-846708d2e7f4", // Water system
      "1599493758267-c6c884c7071f"  // Plumbing repair
    ],
    "home repair": [
      "1581578731048-c40b7c3dbf30", // Tools
      "1584622650111-93e69d876a0c", // Home maintenance
      "1556909211-a1522699c2c3", // Interior repair
      "1581244927444-6967703db066", // Home renovation
      "1556908893-f30975b14b9f", // Home improvement
      "1564182842519-8a3b2af3e228"  // General repairs
    ],
    handyman: [
      "1581578731048-c40b7c3dbf30", // Tools arrangement
      "1621905251189-68b6095f3a6d", // Workshop
      "1540496905036-5937c10647cc", // Handyman working
      "1581244927444-6967703db066", // Home maintenance
      "1584622650111-93e69d876a0c", // Repairs
      "1564182842519-8a3b2af3e228"  // Tool collection
    ],
    gardening: [
      "1466692476868-9ee5a3a3e93b", // Garden view
      "1591857177580-dc82b9ac4e1e", // Gardening tools
      "1523348837708-15d4a09cfac2", // Landscaping
      "1589939705384-5185137a7f0f", // Garden maintenance
      "1599686101142-c6b5b81e1d9d", // Professional gardening
      "1558449907-8b82b0264682"     // Garden design
    ],
    construction: [
      "1503387762-592deb58ef4e", // Construction site
      "1624633505074-90526c6a5811", // Construction work
      "1517581177684-8777137abd91", // Heavy machinery
      "1541971875051-aec1c2f00405", // Modern construction
      "1628744876479-bcd37bf5ed4c", // Building site
      "1590725140366-fe96f2cf05c6"  // Construction project
    ]
  };
  
  // Default images for unknown specialties
  const defaultImages = [
    "1503387762-592deb58ef4e", // Generic construction
    "1584622650111-93e69d876a0c", // Generic maintenance
    "1621905251189-68b6095f3a6d", // Generic workshop
    "1556909211-a1522699c2c3", // Generic interior
    "1581244927444-6967703db066", // Generic renovation
    "1564182842519-8a3b2af3e228"  // Generic tools
  ];

  let availableImages = defaultImages;
  
  if (contractor.specialty) {
    const normalizedSpecialty = contractor.specialty.toLowerCase();
    availableImages = specialtyImages[normalizedSpecialty] || defaultImages;
  }

  // Use the contractor's ID to consistently select the same image
  // Using a hash of the ID to ensure better distribution across the available images
  const idSum = contractor.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = idSum % availableImages.length;
  const photoId = availableImages[index];

  const fallbackUrl = `${baseUrl}${photoId}${unsplashParams}`;
  console.log('Generated fallback URL:', { 
    business: contractor.business_name,
    specialty: contractor.specialty, 
    photoId, 
    fallbackUrl 
  });
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
  
  return getFallbackImage(contractor);
};
