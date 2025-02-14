
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, ArrowLeft, CheckCircle2, Ruler, PoundSterling } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ContractorSpecialty = Database["public"]["Enums"]["contractor_specialty"];

interface Contractor {
  id: string;
  business_name: string;
  images: string[];
  rating: number;
  review_count: number;
  specialty: ContractorSpecialty;
  location: string;
  description: string;
  slug: string;
  certifications: string[];
  insurance_details: any;
  project_types: string[];
  typical_project_size: string;
  minimum_project_value: number;
  maximum_project_value: number;
}

const ContractorDetail = () => {
  const { region, service, companyName } = useParams();
  
  const { data: contractor, isLoading, error } = useQuery({
    queryKey: ['contractor', companyName],
    queryFn: async () => {
      if (!service) throw new Error("Service is required");
      
      // Convert service to proper enum value
      const specialty = service.charAt(0).toUpperCase() + service.slice(1).toLowerCase();
      if (!isValidSpecialty(specialty)) {
        throw new Error("Invalid specialty");
      }

      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('slug', companyName)
        .eq('specialty', specialty)
        .single();
      
      if (error) throw error;
      return data as Contractor;
    },
    enabled: !!companyName && !!service
  });

  // Helper function to validate specialty
  function isValidSpecialty(value: string): value is ContractorSpecialty {
    return ['Electrical', 'Plumbing', 'Roofing', 'Building', 'Home Repair', 'Gardening', 'Construction', 'Handyman'].includes(value);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Contractor not found</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </Link>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <img
              src={contractor.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e'}
              alt={contractor.business_name}
              className="object-cover w-full rounded-lg shadow-lg aspect-video"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {contractor.business_name}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge>{contractor.specialty}</Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="ml-1 font-medium">{contractor.rating}</span>
                  <span className="ml-1 text-gray-500">
                    ({contractor.review_count} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-4 text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                {contractor.location}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {contractor.description}
              </p>
            </div>

            {contractor.specialty === 'Building' && (
              <>
                {contractor.project_types && contractor.project_types.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {contractor.project_types.map((type) => (
                        <Badge key={type} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {contractor.certifications && contractor.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                    <div className="space-y-2">
                      {contractor.certifications.map((cert) => (
                        <div key={cert} className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contractor.typical_project_size && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Typical Project Size</h3>
                    <div className="flex items-center text-gray-600">
                      <Ruler className="w-4 h-4 mr-2" />
                      {contractor.typical_project_size}
                    </div>
                  </div>
                )}

                {(contractor.minimum_project_value || contractor.maximum_project_value) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Value Range</h3>
                    <div className="flex items-center text-gray-600">
                      <PoundSterling className="w-4 h-4 mr-2" />
                      {contractor.minimum_project_value && `From £${contractor.minimum_project_value.toLocaleString()}`}
                      {contractor.minimum_project_value && contractor.maximum_project_value && ' - '}
                      {contractor.maximum_project_value && `Up to £${contractor.maximum_project_value.toLocaleString()}`}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDetail;
