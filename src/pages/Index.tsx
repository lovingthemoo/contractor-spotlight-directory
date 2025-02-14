import { useState } from "react";
import { Search, MapPin, ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

const MIN_RATING = 4.0;
const specialties = ["All", "Electrical", "Plumbing", "Roofing", "Gardening", "Home Repair", "Building"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .gte('rating', MIN_RATING);
      
      if (error) throw error;
      return data as Contractor[];
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

  return (
    <>
      <Header />
      <div className="min-h-screen">
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
                <Search className="w-5 h-5 mx-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search contractors..."
                  className="flex-1 border-0 focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Badge variant="secondary" className="mr-2">
                  <MapPin className="w-4 h-4 mr-1" />
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
            <p className="mt-2 text-gray-500">Top-rated professionals in London (4★ and above)</p>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500">
                Failed to load contractors. Please try again later.
              </div>
            )}
            
            <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredContractors.map((contractor) => (
                <a 
                  key={contractor.id} 
                  href={`/${contractor.location.toLowerCase().replace(' ', '-')}/${contractor.specialty.toLowerCase()}/${contractor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer">
                    <img
                      src={contractor.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e'}
                      alt={contractor.business_name}
                      className="object-cover w-full h-48"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{contractor.business_name}</h3>
                        <Badge>{contractor.specialty}</Badge>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {contractor.location}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">{contractor.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({contractor.review_count} reviews)
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
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
            {/* AdSense placeholder - Replace with actual AdSense code */}
            <div id="contractor-list-ads" className="min-h-[250px] bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Advertisement Space</span>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Index;
