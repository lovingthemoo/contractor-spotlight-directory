
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contractor } from "@/types/contractor";

interface ContractorCardProps {
  contractor: Contractor;
  getDisplayImage: (contractor: Contractor) => string;
  getDisplayAddress: (contractor: Contractor) => string;
}

const ContractorCard = ({ contractor, getDisplayImage, getDisplayAddress }: ContractorCardProps) => {
  const imageUrl = getDisplayImage(contractor);
  const address = getDisplayAddress(contractor);
  
  // Format rating to display one decimal place
  const displayRating = contractor.rating?.toFixed(1) || '0.0';
  const reviewCount = contractor.review_count || 0;

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
                e.currentTarget.src = 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f';
                console.log('Image failed to load, using fallback:', contractor.business_name);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
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
