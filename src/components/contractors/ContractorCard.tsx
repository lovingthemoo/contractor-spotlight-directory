
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contractor } from "@/types/contractor";
import { getDisplayImage } from "@/utils/image-utils";
import { useState } from "react";

interface ContractorCardProps {
  contractor: Contractor;
}

const ContractorCard = ({ contractor }: ContractorCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Get business name
  const businessName = contractor.google_place_name || contractor.business_name;
  
  // Get the image URL using our utility function
  const imageUrl = getDisplayImage(contractor);
  
  // Format rating display
  const displayRating = contractor.rating?.toFixed(1) || '0.0';
  const reviewCount = contractor.review_count || 0;

  // Get the display address
  const getDisplayAddress = (): string => {
    return contractor.google_formatted_address || contractor.location || 'London';
  };

  const handleImageError = () => {
    console.error('Image failed to load:', {
      business: businessName,
      imageUrl: imageUrl
    });
    setImageError(true);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link 
        to={`/london/${contractor.specialty?.toLowerCase()}/${contractor.slug}`}
        className="block h-full"
      >
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={imageError ? '/placeholder.svg' : imageUrl}
            alt={`${businessName} - ${contractor.specialty} contractor in London`}
            className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            crossOrigin="anonymous"
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
