
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contractor } from "@/types/contractor";
import { selectImage, markImageAsBroken } from "@/utils/image-selection";
import { useState, useEffect } from "react";

interface ContractorCardProps {
  contractor: Contractor;
}

const ContractorCard = ({ contractor }: ContractorCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.svg');
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Get display name, defaulting to business name
  const displayName = contractor.google_place_name || contractor.business_name;

  // Format rating and review count for display
  const rating = contractor.rating || 0;
  const reviewCount = contractor.review_count || 0;

  useEffect(() => {
    if (!contractor) return;

    const loadImage = async () => {
      setIsImageLoading(true);
      
      try {
        // Get the best available image URL using our new selection logic
        const url = await selectImage(contractor);
        
        // Pre-load the image
        const img = new Image();
        
        img.onload = () => {
          setImageUrl(url);
          setIsImageLoading(false);
        };
        
        img.onerror = async () => {
          console.error('Image failed to load:', {
            business: displayName,
            url
          });
          
          // Mark this URL as broken in the database
          await markImageAsBroken(url, contractor.specialty);
          
          // Try to get a new image
          const newUrl = await selectImage(contractor);
          setImageUrl(newUrl);
          setIsImageLoading(false);
        };
        
        img.src = url;
      } catch (error) {
        console.error('Error loading image:', {
          business: displayName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        setImageUrl('/placeholder.svg');
        setIsImageLoading(false);
      }
    };

    loadImage();
  }, [contractor, displayName]);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link 
        to={`/london/${contractor.specialty?.toLowerCase()}/${contractor.slug}`}
        className="block h-full"
      >
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={`${displayName} - ${contractor.specialty} contractor in London`}
            className={`object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105 ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {displayName}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-400 mr-2">
              <Star className="fill-current w-4 h-4" />
              <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
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
            <span className="line-clamp-1">
              {contractor.google_formatted_address || contractor.location || 'London'}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ContractorCard;
