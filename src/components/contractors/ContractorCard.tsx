
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contractor } from "@/types/contractor";

interface ContractorCardProps {
  contractor: Contractor;
  getDisplayImage: (contractor: Contractor) => string | undefined;
  getDisplayAddress: (contractor: Contractor) => string;
}

const ContractorCard = ({ contractor, getDisplayImage, getDisplayAddress }: ContractorCardProps) => {
  const imageUrl = getDisplayImage(contractor);
  const address = getDisplayAddress(contractor);
  
  const displayRating = contractor.rating?.toFixed(1) || '0.0';
  const reviewCount = contractor.review_count || 0;

  // Function to get a consistent fallback image based on contractor specialty
  const getFallbackImage = () => {
    const baseUrl = "https://images.unsplash.com/photo-";
    switch (contractor.specialty?.toLowerCase()) {
      case "roofing":
        return `${baseUrl}1439337153520-7082a56a81f4`; // Clear glass roof image
      case "building":
        return `${baseUrl}1487958449943-2429e8be8625`; // Building construction site
      case "construction":
        return `${baseUrl}1527576539890-dfa815648363`; // Construction project
      case "plumbing":
        return `${baseUrl}1518005020951-eccb494ad742`; // Modern bathroom fixtures
      case "electrical":
        return `${baseUrl}1496307653780-42ee777d4833`; // Electrical work
      case "gardening":
        return `${baseUrl}1466692476868-9ee5a3a3e93b`; // Garden landscape
      case "home repairs":
        return `${baseUrl}1581578731048-c40b7c3dbf30`; // Home repair tools
      default:
        return `${baseUrl}1487958449943-2429e8be8625`; // Default building image
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link 
        to={`/london/${contractor.specialty?.toLowerCase()}/${contractor.slug}`}
        className="block h-full"
      >
        <div className="relative aspect-video overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${contractor.business_name} project`}
              className="object-cover w-full h-full transform transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = getFallbackImage();
              }}
            />
          ) : (
            <img
              src={getFallbackImage()}
              alt={`${contractor.business_name} project`}
              className="object-cover w-full h-full transform transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {contractor.business_name}
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
          
          <div className="text-sm text-gray-500 mb-2">
            {contractor.specialty}
          </div>
          
          {address && (
            <div className="text-sm text-gray-500 line-clamp-1">
              {address}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default ContractorCard;
