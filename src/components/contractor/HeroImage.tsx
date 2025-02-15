
import { Star } from "lucide-react";
import type { Contractor } from "@/types/contractor";

interface HeroImageProps {
  contractor: Contractor;
  businessName: string;
}

export const HeroImage = ({ contractor, businessName }: HeroImageProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      {contractor.google_photos && contractor.google_photos[0] ? (
        <img
          src={contractor.google_photos[0].url}
          alt={`Project by ${businessName}`}
          className="w-full object-cover aspect-video"
          onError={(e) => {
            e.currentTarget.src = contractor.default_specialty_image || '/placeholder.svg';
          }}
        />
      ) : contractor.images?.[0] ? (
        <img
          src={contractor.images[0]}
          alt={`Project by ${businessName}`}
          className="w-full object-cover aspect-video"
          onError={(e) => {
            e.currentTarget.src = contractor.default_specialty_image || '/placeholder.svg';
          }}
        />
      ) : (
        <img
          src={contractor.default_specialty_image || "/placeholder.svg"}
          alt={`Project by ${businessName}`}
          className="w-full object-cover aspect-video"
        />
      )}
      
      {/* Overlay Rating Badge */}
      {contractor.rating && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{contractor.rating}</span>
          <span className="text-gray-600">({contractor.review_count || 0})</span>
        </div>
      )}
    </div>
  );
};
