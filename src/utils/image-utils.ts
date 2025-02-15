
import { Contractor } from "@/types/contractor";

const getFallbackImage = (contractor: Contractor): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  const unsplashParams = "?auto=format&fit=crop&w=800&q=80";
  
  // Expanded collection of specialty-specific images with 40+ unique, relevant images
  const specialtyImages: Record<string, string[]> = {
    roofing: [
      "1632863677807-846708d2e7f4", // Professional roofing team
      "1635424709852-0458e8d0f47f", // Modern roof architecture
      "1600585152220-90363fe7e115", // Residential roofing
      "1622003184639-ddbb3a35422c", // New roof installation
      "1589939705384-5185137a7f0f", // Commercial roofing
      "1597694491841-16c3320db9ce", // Roofing materials
      "1519501025264-65ba15a82390", // Tile roofing
      "1518709414768-a88981a4515d", // Roof inspection
      "1524397612500-5c134b859b43", // Slate roofing
      "1508274239787-048664b8919a"  // Metal roofing
    ],
    building: [
      "1504307651254-35b1a71c4706", // Modern construction
      "1621568584120-2f9896611d25", // Building exterior
      "1590725121839-892b458a74b1", // Construction site
      "1541971875051-aec1c2f00405", // Architecture
      "1628744876479-bcd37bf5ed4c", // Building process
      "1517581177684-8777137abd91", // Commercial building
      "1523217582562-09d95dc6678f", // Residential building
      "1531834685032-c7c6c84caa24", // Building materials
      "1525909002947-0a855ffe6963", // Construction team
      "1512917774080-9991f1c4c750"  // Building renovation
    ],
    electrical: [
      "1565193492-05bd3fa5cf4c", // Electrical work
      "1555963966-b7fad8930b03", // Circuit installation
      "1531986627196-72d4714264f4", // Professional electrician
      "1416939692227-3eb34e91b381", // Wiring work
      "1580893297897-b09c1df87a49", // Industrial electrical
      "1484807352052-23338990c6c6", // Smart electrical
      "1561646783-f6e38a7e8b58", // Electrical panel
      "1562768565-da9875a57650", // Electrical maintenance
      "1544724667-8e52c8ac9c91", // Commercial electrical
      "1528839219339-ac09ef6d5877"  // Residential electrical
    ],
    plumbing: [
      "1504328345606-16dec41d99b7", // Plumbing tools
      "1585944285623-d31c27069c1e", // Modern plumbing
      "1575517111028-9a6f38112bb8", // Professional plumber
      "1584622650111-93e69d876a0c", // Bathroom plumbing
      "1599493758267-c6c884c7071f", // Plumbing repair
      "1556908893-f30975b14b9f", // Pipe work
      "1562768565-da9875a57650", // Plumbing installation
      "1581244927444-6967703db066", // Kitchen plumbing
      "1544724667-8e52c8ac9c91", // Commercial plumbing
      "1528839219339-ac09ef6d5877"  // Residential plumbing
    ],
    "home repair": [
      "1581578731048-c40b7c3dbf30", // Tool set
      "1617104461687-7637c6d5c145", // Home maintenance
      "1556909211-a1522699c2c3", // Interior work
      "1573505825448-61b76fef4fd6", // Repair work
      "1584663737865-4c402a662837", // General repairs
      "1530124566582-a618bc2615dc", // Professional repairs
      "1523217582562-09d95dc6678f", // Home improvement
      "1512917774080-9991f1c4c750", // Renovation
      "1544724667-8e52c8ac9c91", // Maintenance
      "1528839219339-ac09ef6d5877"  // Home services
    ],
    handyman: [
      "1580901368919-7892f7c339db", // Professional handyman
      "1621905251189-68b6095f3a6d", // Workshop
      "1540496905036-5937c10647cc", // Maintenance work
      "1564182842519-8a3b2af3e228", // Tool collection
      "1599686101142-c6b5b81e1d9d", // Home repairs
      "1590004953683-5c1177c5c2c8", // DIY work
      "1523217582562-09d95dc6678f", // Skilled work
      "1512917774080-9991f1c4c750", // Professional service
      "1544724667-8e52c8ac9c91", // Home maintenance
      "1528839219339-ac09ef6d5877"  // Repair service
    ],
    gardening: [
      "1466692476868-9ee5a3a3e93b", // Landscaping
      "1591857177580-dc82b9ac4e1e", // Garden work
      "1523348837708-15d4a09cfac2", // Garden design
      "1558904541-c19784525cf4", // Professional gardening
      "1416879595882-3373a0480b5b", // Garden maintenance
      "1523712999610-f77fbcfc3843", // Landscape design
      "1523217582562-09d95dc6678f", // Garden service
      "1512917774080-9991f1c4c750", // Outdoor work
      "1544724667-8e52c8ac9c91", // Garden care
      "1528839219339-ac09ef6d5877"  // Landscaping service
    ],
    construction: [
      "1503387762-592deb58ef4e", // Construction site
      "1624633505074-90526c6a5811", // Building work
      "1521791586668-83c8cf25a6c2", // Construction planning
      "1590644776933-e05027243a9d", // Development
      "1533077162588-6c3f2e67b273", // Construction team
      "1572715376701-98568319fd0b", // Site work
      "1523217582562-09d95dc6678f", // Project management
      "1512917774080-9991f1c4c750", // Construction process
      "1544724667-8e52c8ac9c91", // Building development
      "1528839219339-ac09ef6d5877"  // Construction service
    ]
  };
  
  // Default images for unknown specialties
  const defaultImages = [
    "1512314889357-e157c22f938d", // Professional work
    "1517292987719-0369a794ec0f", // Service provider
    "1556911261-6bd341186b2f", // Maintenance
    "1530124566582-a618bc2615dc", // Professional service
    "1584663737865-4c402a662837", // Quality work
    "1581578731048-c40b7c3dbf30", // Tools and equipment
    "1573505825448-61b76fef4fd6", // Service work
    "1599686101142-c6b5b81e1d9d", // Professional team
    "1590004953683-5c1177c5c2c8", // Service quality
    "1523712999610-f77fbcfc3843"  // Professional results
  ];

  let availableImages = defaultImages;
  
  if (contractor.specialty) {
    const normalizedSpecialty = contractor.specialty.toLowerCase();
    availableImages = specialtyImages[normalizedSpecialty] || defaultImages;
  }

  // Enhanced selection logic using both ID and business name
  const uniqueString = `${contractor.id}-${contractor.business_name}`;
  const hash = uniqueString.split('').reduce((sum, char, index) => {
    return sum + char.charCodeAt(0) * (index + 1);
  }, 0);
  
  const index = Math.abs(hash) % availableImages.length;
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
