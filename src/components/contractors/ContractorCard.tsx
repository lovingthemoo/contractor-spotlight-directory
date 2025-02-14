
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Phone, ChevronRight } from "lucide-react";
import { Contractor } from "@/types/contractor";

interface ContractorCardProps {
  contractor: Contractor;
  getDisplayImage: (contractor: Contractor) => string;
  getDisplayAddress: (contractor: Contractor) => string;
}

const ContractorCard = ({ contractor, getDisplayImage, getDisplayAddress }: ContractorCardProps) => {
  const formattedLocation = contractor.google_formatted_address || contractor.location;
  const formattedPhone = contractor.google_formatted_phone || contractor.phone;
  const businessName = contractor.google_place_name || contractor.business_name;
  
  // Create URL-friendly slug from location and specialty
  const locationSlug = contractor.location.toLowerCase().replace(/\s+/g, '-');
  const specialtySlug = contractor.specialty.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <a 
      href={`/${locationSlug}/${specialtySlug}/${contractor.slug}`}
      className="block"
      aria-label={`View details for ${businessName}`}
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <img
          src={getDisplayImage(contractor)}
          alt={`${businessName} project example`}
          className="object-cover w-full h-48"
          loading="lazy"
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{businessName}</h3>
            <Badge>{contractor.specialty}</Badge>
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
              {formattedLocation}
            </div>
            
            {formattedPhone && (
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="w-4 h-4 mr-1" aria-hidden="true" />
                {formattedPhone}
              </div>
            )}
            
            {contractor.years_in_business && contractor.years_in_business > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                {contractor.years_in_business} years in business
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {contractor.website_description || contractor.description}
          </p>

          {contractor.project_types && contractor.project_types.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {contractor.project_types.slice(0, 3).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {contractor.project_types.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{contractor.project_types.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              <span className="ml-1 text-sm font-medium">{contractor.rating}</span>
              <span className="ml-1 text-sm text-gray-500">
                ({contractor.review_count || 0} {contractor.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </Card>
    </a>
  );
};

export default ContractorCard;
