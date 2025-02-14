
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContractorCard from "@/components/contractors/ContractorCard";
import SearchBar from "@/components/contractors/SearchBar";
import SpecialtyFilter from "@/components/contractors/SpecialtyFilter";
import { transformContractor, getDisplayImage, getDisplayAddress } from "@/utils/contractor";
import type { Contractor } from "@/types/contractor";

const specialties = ["All", "Building", "Electrical", "Plumbing", "Roofing", "Home Repair", "Gardening", "Construction", "Handyman"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        const response = await supabase
          .from('contractors')
          .select('*')
          .order('rating', { ascending: false });
        
        if (response.error) throw response.error;
        if (!response.data?.length) return [];

        // Debug log to check raw data
        console.log('Raw contractors data with ratings:', response.data.map(c => ({
          id: c.id,
          name: c.business_name,
          rating: c.rating,
          review_count: c.review_count
        })));

        const transformedContractors = await Promise.all(response.data.map(transformContractor));
        
        // Debug log to check transformed data
        console.log('Transformed contractors with ratings:', transformedContractors.map(c => ({
          id: c.id,
          name: c.business_name,
          rating: c.rating,
          review_count: c.review_count
        })));

        return transformedContractors;
      } catch (e) {
        console.error('Error fetching contractors:', e);
        throw e;
      }
    }
  });

  const filteredContractors = contractors
    .filter(contractor => 
      selectedSpecialty === "All" || contractor.specialty === selectedSpecialty
    )
    .filter(contractor => 
      contractor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

        {/* Featured Contractors */}
        <section 
          className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8"
          aria-labelledby="featured-contractors-title"
        >
          <div>
            <h2 id="featured-contractors-title" className="text-2xl font-bold tracking-tight text-gray-900">
              {selectedSpecialty === "All" ? "Featured Contractors" : `${selectedSpecialty} Contractors`}
            </h2>
            <p className="mt-2 text-gray-500">Top rated professionals in London</p>
            
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
                No contractors found matching your criteria.
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

