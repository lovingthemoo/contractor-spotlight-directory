
import { useState } from "react";
import { Search, MapPin, ChevronRight, Star, Clock, Phone, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Constants
const MIN_RATING = 0;
const specialties = ["All", "Building", "Electrical", "Plumbing", "Roofing", "Home Repair", "Gardening", "Construction", "Handyman"];

interface GoogleReview {
  rating: number;
  text: string;
  time: string;
  author_name: string;
}

interface Contractor {
  id: string;
  business_name: string;
  images: string[];
  rating: number;
  review_count: number;
  specialty: string;
  location: string;
  description: string;
  slug: string;
  project_types?: string[];
  typical_project_size?: string;
  minimum_project_value?: number;
  maximum_project_value?: number;
  google_place_name?: string;
  google_formatted_address?: string;
  google_formatted_phone?: string;
  website_description?: string;
  founded_year?: number;
  years_in_business?: number;
  google_reviews?: GoogleReview[];
}

interface DatabaseContractor extends Omit<Contractor, 'google_reviews'> {
  google_reviews?: any;
}

const transformContractor = (dbContractor: DatabaseContractor): Contractor => {
  let google_reviews: GoogleReview[] | undefined;
  
  if (dbContractor.google_reviews) {
    try {
      // If it's a string, parse it, if it's already an object, use it
      const reviewsData = typeof dbContractor.google_reviews === 'string' 
        ? JSON.parse(dbContractor.google_reviews) 
        : dbContractor.google_reviews;
        
      // Ensure the reviews match our expected format
      google_reviews = Array.isArray(reviewsData) 
        ? reviewsData.map(review => ({
            rating: Number(review.rating) || 0,
            text: String(review.text || ''),
            time: String(review.time || ''),
            author_name: String(review.author_name || '')
          }))
        : undefined;
    } catch (e) {
      console.error('Error parsing google_reviews:', e);
      google_reviews = undefined;
    }
  }

  return {
    ...dbContractor,
    google_reviews,
    // Ensure other required fields have default values
    rating: dbContractor.rating || 0,
    review_count: dbContractor.review_count || 0,
    images: dbContractor.images || []
  };
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      console.log('Fetching contractors...');
      try {
        const response = await supabase
          .from('contractors')
          .select('*');
        
        console.log('Full Supabase response:', response);

        if (response.error) {
          console.error('Supabase error:', response.error);
          throw response.error;
        }

        const { data } = response;
        
        if (!data || data.length === 0) {
          console.log('No contractors found in database');
          return [];
        }

        // Transform the data to match our Contractor interface
        const transformedData = data.map(transformContractor);
        console.log(`Found ${transformedData.length} contractors:`, transformedData);
        return transformedData;
      } catch (e) {
        console.error('Query execution error:', e);
        throw e;
      }
    }
  });

  const filteredContractors = contractors
    .filter(contractor => 
      selectedSpecialty === "All" || contractor.specialty === selectedSpecialty
    )
    .filter(contractor => 
      contractor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
  console.log('Filtered contractors:', filteredContractors);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center animate-in">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Find Trusted London
                <span className="block text-primary">Contractors</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
                Connect with verified contractors in London. Quality service, guaranteed satisfaction.
              </p>
              
              {/* Search Bar */}
              <div className="flex items-center max-w-md mx-auto mt-8 overflow-hidden bg-white border rounded-full">
                <Search className="w-5 h-5 mx-3 text-gray-400" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="Search contractors..."
                  className="flex-1 border-0 focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search contractors"
                />
                <Badge variant="secondary" className="mr-2">
                  <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                  London
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Specialty Filter */}
        <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-in">
            <h2 className="text-lg font-semibold text-gray-900">Filter by Service Type</h2>
            <RadioGroup 
              className="flex flex-wrap gap-4 mt-4"
              defaultValue="All"
              onValueChange={setSelectedSpecialty}
              aria-label="Service type filter"
            >
              {specialties.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <RadioGroupItem value={specialty} id={specialty} />
                  <Label htmlFor={specialty}>{specialty}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </section>

        {/* Featured Contractors */}
        <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-in">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Contractors</h2>
            <p className="mt-2 text-gray-500">Top professionals in London</p>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500" role="alert">
                <p>Failed to load contractors. Please try again later.</p>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            )}

            {!isLoading && !error && filteredContractors.length === 0 && (
              <div className="text-center py-12 text-gray-500" role="status">
                No contractors found matching your criteria.
              </div>
            )}
            
            <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredContractors.map((contractor) => (
                <a 
                  key={contractor.id} 
                  href={`/${contractor.location.toLowerCase().replace(' ', '-')}/${contractor.specialty.toLowerCase()}/${contractor.slug}`}
                  className="block"
                  aria-label={`View details for ${contractor.business_name}`}
                >
                  <Card className="overflow-hidden transition-all hover:shadow-lg">
                    <img
                      src={contractor.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e'}
                      alt={`${contractor.business_name} project example`}
                      className="object-cover w-full h-48"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{contractor.business_name}</h3>
                        <Badge>{contractor.specialty}</Badge>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                          {contractor.google_formatted_address || contractor.location}
                        </div>
                        
                        {contractor.google_formatted_phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" aria-hidden="true" />
                            {contractor.google_formatted_phone}
                          </div>
                        )}
                        
                        {contractor.years_in_business && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                            {contractor.years_in_business} years in business
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {contractor.website_description || contractor.description}
                      </p>

                      {contractor.specialty === 'Building' && contractor.project_types && (
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
                            ({contractor.review_count} reviews)
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* AdSense Section */}
        <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div id="contractor-list-ads" className="min-h-[250px] bg-gray-100 flex items-center justify-center" role="complementary">
              <span className="text-gray-400">Advertisement Space</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
