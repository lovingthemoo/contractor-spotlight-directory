
import { Link } from "react-router-dom";
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
  const displayAddress = getDisplayAddress(contractor);
  
  // Create URL-friendly slug from location and specialty
  const locationSlug = (contractor.location || 'london').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const specialtySlug = contractor.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Format review text
  const reviewText = contractor.review_count === 1 
    ? "1 review" 
    : `${contractor.review_count} reviews`;
  
  return (
    <Link 
      to={`/${locationSlug}/${specialtySlug}/${contractor.slug}`}
      className="block focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`View details for ${businessName}`}
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative">
          <img
            src={getDisplayImage(contractor)}
            alt={`Project example by ${businessName}`}
            className="object-cover w-full h-48"
            loading="lazy"
          />
          <Badge className="absolute top-4 right-4">{contractor.specialty}</Badge>
        </div>
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{businessName}</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 shrink-0" aria-label="Location" />
              <span className="truncate">{displayAddress}</span>
            </div>
            
            {formattedPhone && (
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="w-4 h-4 mr-1 shrink-0" aria-label="Phone number" />
                <span>{formattedPhone}</span>
              </div>
            )}
            
            {contractor.years_in_business && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1 shrink-0" aria-label="Years in business" />
                <span>{contractor.years_in_business} years in business</span>
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {contractor.website_description || contractor.description}
          </p>

          {contractor.project_types && contractor.project_types.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1" role="list" aria-label="Project types">
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
            <div className="flex items-center" aria-label={`Rating: ${contractor.rating?.toFixed(1) || 'No'} out of 5 stars`}>
              <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              <span className="ml-1 text-sm font-medium">
                {contractor.rating?.toFixed(1) || 'No rating'}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                ({reviewText})
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" aria-label="View details" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ContractorCard;
