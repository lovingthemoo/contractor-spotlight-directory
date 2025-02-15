
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, ArrowLeft, CheckCircle2, Ruler, PoundSterling, 
  Phone, Globe, Mail, Clock, Building2, Briefcase, Award, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformContractor } from "@/utils/contractor";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Contractor } from "@/types/contractor";
import { toast } from "sonner";

const ContractorDetail = () => {
  const { slug } = useParams();
  
  const { data: contractor, isLoading, error } = useQuery({
    queryKey: ['contractor', slug],
    queryFn: async () => {
      console.log('Fetching contractor by slug:', slug);
      const { data, error } = await supabase
        .from('contractors')
        .select(`
          *,
          google_reviews,
          google_photos,
          project_types,
          certifications,
          insurance_details
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching contractor:', error);
        toast.error('Failed to load contractor details');
        throw error;
      }
      
      if (!data) {
        throw new Error('Contractor not found');
      }
      
      console.log('Found contractor:', data);
      return transformContractor(data);
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
  const address = contractor.google_formatted_address || contractor.location || 'London';
  const phone = contractor.google_formatted_phone || contractor.phone;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6" aria-label="Back to listings">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Listings
          </Button>
        </Link>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              {contractor.google_photos && contractor.google_photos[0] ? (
                <img
                  src={contractor.google_photos[0].url}
                  alt={`Project by ${businessName}`}
                  className="w-full object-cover aspect-video"
                />
              ) : contractor.images?.[0] ? (
                <img
                  src={contractor.images[0]}
                  alt={`Project by ${businessName}`}
                  className="w-full object-cover aspect-video"
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

            {/* Company Overview */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {businessName}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {contractor.specialty}
                  </Badge>
                  {contractor.years_in_business && (
                    <Badge variant="outline" className="text-sm">
                      {contractor.years_in_business} Years in Business
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {(contractor.website_description || contractor.description) && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {contractor.website_description || contractor.description}
                  </p>
                </div>
              )}

              {/* Services & Expertise */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Project Types */}
                {contractor.project_types && contractor.project_types.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                      Project Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {contractor.project_types.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Certifications */}
                {contractor.certifications && contractor.certifications.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-purple-500" />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {contractor.certifications.map((cert) => (
                        <div key={cert} className="flex items-center text-gray-600">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Project Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-purple-500" />
                  Project Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {contractor.typical_project_size && (
                    <div>
                      <h4 className="font-medium text-gray-700">Typical Size</h4>
                      <div className="flex items-center mt-1 text-gray-600">
                        <Ruler className="w-4 h-4 mr-2" />
                        {contractor.typical_project_size}
                      </div>
                    </div>
                  )}
                  
                  {(contractor.minimum_project_value || contractor.maximum_project_value) && (
                    <div>
                      <h4 className="font-medium text-gray-700">Project Value Range</h4>
                      <div className="flex items-center mt-1 text-gray-600">
                        <PoundSterling className="w-4 h-4 mr-2" />
                        <span>
                          {contractor.minimum_project_value && `From £${contractor.minimum_project_value.toLocaleString()}`}
                          {contractor.minimum_project_value && contractor.maximum_project_value && ' - '}
                          {contractor.maximum_project_value && `Up to £${contractor.maximum_project_value.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Reviews Section */}
            {contractor.google_reviews && contractor.google_reviews.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Client Reviews</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {contractor.google_reviews.map((review, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{review.text}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{review.author_name}</span>
                        <time dateTime={review.time}>
                          {new Date(review.time).toLocaleDateString()}
                        </time>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card className="p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-purple-500" />
                    <span>{address}</span>
                  </div>
                  
                  {phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-purple-500" />
                      <a href={`tel:${phone}`} className="hover:text-purple-600 transition-colors">
                        {phone}
                      </a>
                    </div>
                  )}
                  
                  {contractor.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-3 text-purple-500" />
                      <a 
                        href={`mailto:${contractor.email}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {contractor.email}
                      </a>
                    </div>
                  )}
                  
                  {contractor.website_url && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-5 h-5 mr-3 text-purple-500" />
                      <a 
                        href={contractor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-600 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {contractor.founded_year && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                      <span>Founded in {contractor.founded_year}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    if (phone) {
                      window.location.href = `tel:${phone}`;
                    } else if (contractor.email) {
                      window.location.href = `mailto:${contractor.email}`;
                    }
                  }}
                >
                  Contact Now
                </Button>
              </Card>

              {/* Additional Photos */}
              {contractor.google_photos && contractor.google_photos.length > 1 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {contractor.google_photos.slice(1, 5).map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Project by ${businessName}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDetail;
