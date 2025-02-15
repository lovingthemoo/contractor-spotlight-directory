
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contractor } from "@/types/contractor";

interface ContractorCardProps {
  contractor: Contractor;
}

const ContractorCard = ({ contractor }: ContractorCardProps) => {
  // Compute the display image, prioritizing uploaded images then Google photos
  const getDisplayImage = (): string => {
    // Base URL for fallback images
    const baseUrl = "https://images.unsplash.com/photo-";
    
    // First try uploaded images
    if (Array.isArray(contractor.images) && contractor.images.length > 0) {
      const validImage = contractor.images.find(img => 
        typeof img === 'string' && img.startsWith('http')
      );
      if (validImage) return validImage;
    }
    
    // Then try Google photos
    if (Array.isArray(contractor.google_photos) && contractor.google_photos.length > 0) {
      const validPhoto = contractor.google_photos.find(photo => 
        photo && typeof photo.url === 'string' && photo.url.startsWith('http')
      );
      if (validPhoto) return validPhoto.url;
    }
    
    // Fallback images based on specialty
    switch (contractor.specialty?.toLowerCase()) {
      case "roofing":
        return `${baseUrl}1632863677807-846708d2e7f4`;
      case "electrical":
        return `${baseUrl}1565193492-05bd3fa5cf4c`;
      case "plumbing":
        return `${baseUrl}1504328345606-16dec41d99b7`;
      case "gardening":
        return `${baseUrl}1466692476868-9ee5a3a3e93b`;
      case "home repair":
      case "handyman":
        return `${baseUrl}1581578731048-c40b7c3dbf30`;
      default:
        return `${baseUrl}1503387762-592deb58ef4e`; // Generic construction
    }
  };

  // Get the display address
  const getDisplayAddress = (): string => {
    return contractor.google_formatted_address || contractor.location || 'London';
  };

  // Get business name
  const businessName = contractor.google_place_name || contractor.business_name;
  
  // Get the image URL
  const imageUrl = getDisplayImage();
  
  // Format rating display
  const displayRating = contractor.rating?.toFixed(1) || '0.0';
  const reviewCount = contractor.review_count || 0;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link 
        to={`/london/${contractor.specialty?.toLowerCase()}/${contractor.slug}`}
        className="block h-full"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={`${businessName} - ${contractor.specialty} contractor in London`}
            className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {businessName}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-400 mr-2">
              <Star className="fill-current w-4 h-4" />
              <span className="ml-1 text-sm font-medium">{displayRating}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {contractor.specialty}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            <span className="line-clamp-1">{getDisplayAddress()}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ContractorCard;
