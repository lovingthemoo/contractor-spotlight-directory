
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, ArrowLeft, CheckCircle2, Ruler, PoundSterling, Phone, Globe, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";

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
  google_place_name?: string;
  google_formatted_address?: string;
  google_formatted_phone?: string;
  google_reviews?: any[];
  google_photos?: any[];
  website_url?: string;
  email?: string;
  phone?: string;
}

const ContractorDetail = () => {
  const { slug } = useParams();
  
  const { data: contractor, isLoading, error } = useQuery({
    queryKey: ['contractor', slug],
    queryFn: async () => {
      console.log('Fetching contractor by slug:', slug);
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error('Error fetching contractor:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Contractor not found');
      }
      
      console.log('Found contractor:', data);
      return data as Contractor;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" role="alert">
        <h1 className="text-2xl font-bold">Contractor not found</h1>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const businessName = contractor.google_place_name || contractor.business_name;
  const address = contractor.google_formatted_address || contractor.location;
  const phone = contractor.google_formatted_phone || contractor.phone;

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6" aria-label="Back to listings">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Listings
          </Button>
        </Link>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {contractor.google_photos && contractor.google_photos[0] ? (
              <img
                src={contractor.google_photos[0].url}
                alt={`Project by ${businessName}`}
                className="object-cover w-full rounded-lg shadow-lg aspect-video"
              />
            ) : (
              <img
                src={contractor.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e'}
                alt={`Project by ${businessName}`}
                className="object-cover w-full rounded-lg shadow-lg aspect-video"
              />
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {businessName}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge>{contractor.specialty}</Badge>
                <div className="flex items-center" aria-label={`Rating: ${contractor.rating} out of 5 stars`}>
                  <Star className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                  <span className="ml-1 font-medium">{contractor.rating}</span>
                  <span className="ml-1 text-gray-500">
                    ({contractor.review_count} reviews)
                  </span>
                </div>
              </div>
            </div>

            <Card className="p-4 space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" aria-label="Address" />
                <span>{address}</span>
              </div>
              
              {phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" aria-label="Phone number" />
                  <span>{phone}</span>
                </div>
              )}
              
              {contractor.website_url && (
                <div className="flex items-center text-gray-600">
                  <Globe className="w-4 h-4 mr-2" aria-label="Website" />
                  <a 
                    href={contractor.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                    aria-label={`Visit ${businessName}'s website`}
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              {contractor.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" aria-label="Email" />
                  <a 
                    href={`mailto:${contractor.email}`} 
                    className="text-primary hover:underline"
                    aria-label={`Email ${businessName}`}
                  >
                    {contractor.email}
                  </a>
                </div>
              )}
            </Card>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {contractor.description}
              </p>
            </div>

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
          </div>
        </div>

        {contractor.google_reviews && contractor.google_reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contractor.google_reviews.map((review: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.text}</p>
                  <p className="mt-2 text-sm text-gray-500">- {review.author_name}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDetail;
