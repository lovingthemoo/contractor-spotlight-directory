import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContractorCard from "@/components/contractors/ContractorCard";
import SearchBar from "@/components/contractors/SearchBar";
import SpecialtyFilter from "@/components/contractors/SpecialtyFilter";
import { transformContractor, getDisplayImage, getDisplayAddress } from "@/utils/contractor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Contractor } from "@/types/contractor";

const specialties = ["All", "Building", "Electrical", "Plumbing", "Roofing", "Home Repair", "Gardening", "Construction", "Handyman"];
const ratingFilters = ["All", "4.5+", "4.0+", "3.5+", "3.0+"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        // First, get contractors with uploaded images
        const withImagesQuery = supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .gt('images', '{}') // Filter for non-empty arrays using greater than empty array
          .order('rating', { ascending: false });
        
        const response = await withImagesQuery;
        
        if (response.error) {
          toast.error('Failed to fetch contractors');
          throw response.error;
        }

        let contractorsData = response.data || [];
        console.log('Contractors with images:', contractorsData.length);

        // If we don't have enough contractors with uploaded images, get ones with Google photos
        if (contractorsData.length < 10) {
          const withGooglePhotosQuery = supabase
            .from('contractors')
            .select('*')
            .not('rating', 'is', null)
            .neq('google_photos', '[]') // Filter for non-empty JSONB array
            .order('rating', { ascending: false });

          const googlePhotosResponse = await withGooglePhotosQuery;

          if (!googlePhotosResponse.error && googlePhotosResponse.data) {
            // Filter out duplicates
            const newContractors = googlePhotosResponse.data.filter(
              gc => !contractorsData.some(c => c.id === gc.id)
            );
            contractorsData = [...contractorsData, ...newContractors];
            console.log('Added contractors with Google photos:', newContractors.length);
          }
        }

        // If we still need more contractors, get the rest
        if (contractorsData.length < 10) {
          const fallbackQuery = supabase
            .from('contractors')
            .select('*')
            .not('rating', 'is', null)
            .order('rating', { ascending: false });
            
          const fallbackResponse = await fallbackQuery;

          if (!fallbackResponse.error && fallbackResponse.data) {
            // Filter out contractors we already have
            const newContractors = fallbackResponse.data.filter(
              fb => !contractorsData.some(c => c.id === fb.id)
            );
            contractorsData = [...contractorsData, ...newContractors];
            console.log('Added additional contractors:', newContractors.length);
          }
        }

        const transformedContractors = await Promise.all(contractorsData.map(transformContractor));
        
        // Log specialty distribution
        const specialtyCounts = transformedContractors.reduce((acc, contractor) => {
          acc[contractor.specialty || 'Unknown'] = (acc[contractor.specialty || 'Unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Specialty distribution:', specialtyCounts);
        
        // Sort contractors: those with images first, then by rating
        const sortedContractors = transformedContractors.sort((a, b) => {
          const aHasImages = (a.images?.length > 0 || a.google_photos?.length > 0) ? 1 : 0;
          const bHasImages = (b.images?.length > 0 || b.google_photos?.length > 0) ? 1 : 0;
          
          if (aHasImages !== bHasImages) {
            return bHasImages - aHasImages; // Contractors with images come first
          }
          
          // If both have or don't have images, sort by rating
          return (b.rating || 0) - (a.rating || 0);
        });
        
        return sortedContractors;
      } catch (e) {
        console.error('Error fetching contractors:', e);
        throw e;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const getRatingThreshold = (filter: string): number => {
    switch (filter) {
      case "4.5+": return 4.5;
      case "4.0+": return 4.0;
      case "3.5+": return 3.5;
      case "3.0+": return 3.0;
      default: return 0;
    }
  };

  const filteredContractors = contractors
    .filter(contractor => {
      if (selectedSpecialty === "All") return true;
      // Log the specialty comparison for debugging
      console.log(`Comparing contractor specialty: "${contractor.specialty}" with selected: "${selectedSpecialty}"`);
      return contractor.specialty?.toLowerCase() === selectedSpecialty.toLowerCase();
    })
    .filter(contractor => 
      selectedRating === "All" || (contractor.rating && contractor.rating >= getRatingThreshold(selectedRating))
    )
    .filter(contractor => 
      contractor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Log filtered results
  console.log('Total contractors:', contractors.length);
  console.log('Filtered contractors:', filteredContractors.length);
  console.log('Selected specialty:', selectedSpecialty);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden bg-white"
          aria-labelledby="hero-title"
        >
          <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 id="hero-title" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Find Trusted London
                <span className="block text-primary">Contractors</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
                Connect with verified contractors in London. Quality service, guaranteed satisfaction.
              </p>
              
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                aria-label="Search contractors"
              />
            </div>
          </div>
        </section>

        <SpecialtyFilter 
          specialties={specialties}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
          aria-label="Filter by specialty"
        />

        {/* Rating Filter */}
        <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-in">
            <h2 className="text-lg font-semibold text-gray-900" id="rating-filter-heading">
              Filter by Rating
            </h2>
            <RadioGroup 
              className="flex flex-wrap gap-4 mt-4"
              defaultValue={selectedRating}
              onValueChange={setSelectedRating}
              aria-label="Rating filter"
              aria-labelledby="rating-filter-heading"
            >
              {ratingFilters.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={rating} 
                    id={`rating-${rating.toLowerCase().replace('+', '-plus')}`}
                    title={`Select ${rating} rating filter`}
                  />
                  <Label 
                    htmlFor={`rating-${rating.toLowerCase().replace('+', '-plus')}`}
                    className="cursor-pointer"
                  >
                    {rating}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </section>

        {/* Featured Contractors */}
        <section 
          className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8"
          aria-labelledby="featured-contractors-title"
        >
          <div>
            <h2 id="featured-contractors-title" className="text-2xl font-bold tracking-tight text-gray-900">
              {selectedSpecialty === "All" ? "Featured Contractors" : `${selectedSpecialty} Contractors`}
            </h2>
            <p className="mt-2 text-gray-500">
              {isLoading ? 'Loading top rated professionals...' : 'Top rated professionals in London'}
            </p>
            
            {isLoading && (
              <div className="text-center py-12" role="status">
                <div 
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  aria-label="Loading contractors"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500" role="alert">
                <p>Failed to load contractors. Please try again later.</p>
                <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !error && filteredContractors.length === 0 && (
              <div className="text-center py-12 text-gray-500" role="status">
                {searchQuery || selectedSpecialty !== "All" || selectedRating !== "All"
                  ? "No contractors found matching your criteria."
                  : "No contractors available at the moment."}
              </div>
            )}
            
            <div 
              className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3"
              aria-label="Contractors list"
            >
              {filteredContractors.map((contractor) => (
                <ContractorCard
                  key={contractor.id}
                  contractor={contractor}
                  getDisplayImage={getDisplayImage}
                  getDisplayAddress={getDisplayAddress}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Advertisement Section */}
        <section 
          className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8"
          aria-label="Advertisement section"
        >
          <div className="text-center">
            <div className="min-h-[250px] bg-gray-100 flex items-center justify-center">
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
