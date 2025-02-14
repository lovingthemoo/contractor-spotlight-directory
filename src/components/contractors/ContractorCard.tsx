
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, ChevronRight, Clock, Globe } from "lucide-react";
import { Contractor } from "@/types/contractor";

interface ContractorCardProps {
  contractor: Contractor;
  getDisplayImage: (contractor: Contractor) => string;
  getDisplayAddress: (contractor: Contractor) => string;
}

const ContractorCard = ({ contractor, getDisplayImage }: ContractorCardProps) => {
  const businessName = contractor.google_place_name || contractor.business_name;
  const displayImage = getDisplayImage(contractor);
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
        <div className="p-6">
          {/* Business Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {businessName}
          </h3>
          
          {/* Image */}
          {displayImage && (
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={displayImage}
                alt={`Business photo for ${businessName}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Specialty and Years */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{contractor.specialty}</Badge>
            {contractor.years_in_business && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {contractor.years_in_business} years
              </Badge>
            )}
          </div>

          {/* Phone */}
          {formattedPhone && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Phone 
                className="w-4 h-4 mr-1 shrink-0" 
                aria-hidden="true"
              />
              <span>{formattedPhone}</span>
            </div>
          )}

          {/* Website */}
          {contractor.website_url && (
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Globe 
                className="w-4 h-4 mr-1 shrink-0" 
                aria-hidden="true"
              />
              <span className="truncate">Visit Website</span>
            </div>
          )}

          {/* Rating and Reviews */}
          <div className="mt-auto flex items-center justify-between">
            {typeof contractor.rating === 'number' && contractor.rating > 0 && (
              <div className="flex items-center">
                <Star 
                  className="w-5 h-5 text-yellow-400" 
                  aria-hidden="true"
                />
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
            <ChevronRight 
              className="w-5 h-5 text-gray-400" 
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ContractorCard;
