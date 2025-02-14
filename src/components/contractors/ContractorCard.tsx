
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, ChevronRight } from "lucide-react";
import { Contractor } from "@/types/contractor";

interface ContractorCardProps {
  contractor: Contractor;
  getDisplayImage: (contractor: Contractor) => string;
  getDisplayAddress: (contractor: Contractor) => string;
}

const ContractorCard = ({ contractor, getDisplayImage, getDisplayAddress }: ContractorCardProps) => {
  const businessName = contractor.google_place_name || contractor.business_name;
  const displayImage = getDisplayImage(contractor);
  const displayAddress = getDisplayAddress(contractor);
  const formattedPhone = contractor.google_formatted_phone || contractor.phone;
  
  const locationSlug = contractor.location?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  const specialtySlug = contractor.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return (
    <Link 
      to={`/${locationSlug}/${specialtySlug}/${contractor.slug}`}
      className="block h-full focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`View details for ${businessName}`}
    >
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
        <div className="p-4 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{businessName}</h3>
          
          {displayAddress && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-1 shrink-0" aria-label="Location" />
              <span className="truncate">{displayAddress}</span>
            </div>
          )}

          {displayImage && (
            <div className="relative mb-3">
              <img
                src={displayImage}
                alt={`Project example by ${businessName}`}
                className="w-full h-48 object-cover rounded-md"
                loading="lazy"
              />
            </div>
          )}

          {formattedPhone && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Phone className="w-4 h-4 mr-1 shrink-0" aria-label="Phone number" />
              <span>{formattedPhone}</span>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            {typeof contractor.rating === 'number' && contractor.rating > 0 && (
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                <span className="ml-1 text-lg font-semibold">
                  {contractor.rating.toFixed(1)}
                </span>
                {contractor.review_count > 0 && (
                  <span className="ml-1 text-sm text-gray-500">
                    ({contractor.review_count} {contractor.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400" aria-label="View details" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ContractorCard;
