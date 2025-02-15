
import { Contractor } from "@/types/contractor";

const getFallbackImage = (contractor: Contractor): string => {
  const baseUrl = "https://images.unsplash.com/photo-";
  const unsplashParams = "?auto=format&fit=crop&w=800&q=80";
  
  // UK-specific images for each specialty
  const specialtyImages: Record<string, string[]> = {
    roofing: [
      "1635339261790-798d8f252c62", // UK Victorian roof detail
      "1624971159578-461e8d4a19a3", // British slate roofing
      "1600047509807-69cd03b6da84", // Traditional UK roofing
      "1567763617984-5d415c6ee64b", // London townhouse roof
      "1518893883800-44f5fcc3fec9", // UK chimney repair
      "1531756716853-e86dad04d946", // British terrace roofing
      "1534340697931-092a303e7299", // Period property roof work
      "1588859734031-967669c9de58", // UK roof maintenance
      "1593112658515-0c972f4fe32c", // Historic building restoration
      "1580893297897-b09c1df87a49"  // Professional roofing work
    ],
    building: [
      "1486944936320-044d441619f1", // London construction
      "1515263487990-c859c69e0d51", // UK building site
      "1486304873000-235643847519", // British architecture
      "1523217582562-09d95dc6678f", // UK property development
      "1592928038403-5c27bd11d535", // London renovation
      "1516156008796-094cd392bda7", // British construction team
      "1589939705384-5185137a7f0f", // UK building work
      "1517581177684-8777137abd91", // Modern UK construction
      "1590644776933-e05027243a9d", // British development project
      "1494522358652-f1fd3bf75a25"  // UK residential construction
    ],
    electrical: [
      "1573321993197-d6de9c0bc13f", // UK electrical installation
      "1545167871-65b8aee21c03", // British electrical work
      "1521224616346-91bbb3d0138b", // UK electrical safety
      "1589939705384-5185137a7f0f", // Professional electrician
      "1581092160562-40cea0e01cbb", // UK home electrics
      "1591955506264-3f3a04613b53", // Electrical maintenance
      "1558449907-8b82b0264682", // British electrical panel
      "1581092334702-0883c098e602", // UK electrical testing
      "1581092160607-4baab05fb72e", // Professional wiring
      "1581092218081-39e4fd4b7baa"  // UK electrical repairs
    ],
    plumbing: [
      "1584466977375-bc7603e1090d", // UK bathroom installation
      "1584622650111-93e69d876a0c", // British plumbing work
      "1584622965147-af357855e4b6", // UK plumbing repair
      "1584622650111-93e69d876a0c", // Professional plumber
      "1581092581146-a52a1b7148b9", // UK home plumbing
      "1581092160562-40cea0e01cbb", // British plumbing tools
      "1581092218081-39e4fd4b7baa", // Emergency plumbing
      "1581092160607-4baab05fb72e", // UK boiler installation
      "1581092334702-0883c098e602", // Professional gas work
      "1591955506264-3f3a04613b53"  // British plumbing service
    ],
    "home repair": [
      "1581092219167-1d6cc46ef9c0", // UK home maintenance
      "1581092160562-40cea0e01cbb", // British DIY work
      "1581092218081-39e4fd4b7baa", // UK property repair
      "1581092334702-0883c098e602", // Home improvement
      "1581092160607-4baab05fb72e", // Professional repairs
      "1591955506264-3f3a04613b53", // British handyman
      "1589939705384-5185137a7f0f", // UK renovation
      "1515263487990-c859c69e0d51", // Home restoration
      "1486944936320-044d441619f1", // Property maintenance
      "1523217582562-09d95dc6678f"  // British home repair
    ],
    handyman: [
      "1581092218081-39e4fd4b7baa", // UK handyman service
      "1581092160562-40cea0e01cbb", // British maintenance
      "1581092219167-1d6cc46ef9c0", // Professional repairs
      "1581092334702-0883c098e602", // UK home services
      "1581092160607-4baab05fb72e", // British tradesman
      "1591955506264-3f3a04613b53", // Local handyman
      "1589939705384-5185137a7f0f", // UK property maintenance
      "1515263487990-c859c69e0d51", // Home improvements
      "1486944936320-044d441619f1", // Professional service
      "1523217582562-09d95dc6678f"  // British repair work
    ],
    gardening: [
      "1523348837708-15d4a09cfac2", // British garden design
      "1558904541-c19784525cf4", // UK landscaping
      "1466692476868-9ee5a3a3e93b", // English garden
      "1591857177580-dc82b9ac4e1e", // Professional gardening
      "1416879595882-3373a0480b5b", // UK garden maintenance
      "1523712999610-f77fbcfc3843", // British landscaping
      "1589939705384-5185137a7f0f", // Garden services
      "1515263487990-c859c69e0d51", // UK garden design
      "1486944936320-044d441619f1", // Professional gardener
      "1523217582562-09d95dc6678f"  // British garden work
    ],
    construction: [
      "1486944936320-044d441619f1", // London construction site
      "1515263487990-c859c69e0d51", // UK development
      "1486304873000-235643847519", // British building work
      "1523217582562-09d95dc6678f", // Construction management
      "1592928038403-5c27bd11d535", // UK construction
      "1516156008796-094cd392bda7", // Professional builders
      "1589939705384-5185137a7f0f", // British construction
      "1517581177684-8777137abd91", // UK building project
      "1590644776933-e05027243a9d", // Development work
      "1494522358652-f1fd3bf75a25"  // Construction site
    ]
  };
  
  // Default images for unknown specialties (UK-specific)
  const defaultImages = [
    "1486944936320-044d441619f1", // UK construction
    "1515263487990-c859c69e0d51", // British tradesperson
    "1486304873000-235643847519", // Professional work
    "1523217582562-09d95dc6678f", // UK services
    "1592928038403-5c27bd11d535", // British contractor
    "1516156008796-094cd392bda7", // UK professional
    "1589939705384-5185137a7f0f", // Trade services
    "1517581177684-8777137abd91", // British workmanship
    "1590644776933-e05027243a9d", // Professional services
    "1494522358652-f1fd3bf75a25"  // UK trade work
  ];

  let availableImages = defaultImages;
  
  if (contractor.specialty) {
    const normalizedSpecialty = contractor.specialty.toLowerCase();
    availableImages = specialtyImages[normalizedSpecialty] || defaultImages;
  }

  // Enhanced selection logic using both ID and business name for better distribution
  const uniqueString = `${contractor.id}-${contractor.business_name}`;
  const hash = uniqueString.split('').reduce((sum, char, index) => {
    return sum + char.charCodeAt(0) * ((index + 1) * 17); // Prime multiplier for better distribution
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
