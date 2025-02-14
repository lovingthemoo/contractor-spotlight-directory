
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
      console.log('Fetching contractors...');
      try {
        const response = await supabase
          .from('contractors')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (response.error) {
          console.error('Supabase error:', response.error);
          throw response.error;
        }

        if (!response.data || response.data.length === 0) {
          console.log('No contractors found in database');
          return [];
        }

        const transformedData = response.data.map(contractor => transformContractor(contractor));
        console.log('Transformed contractors:', transformedData);
        return transformedData;
      } catch (e) {
        console.error('Query execution error:', e);
        throw e;
      }
    },
    meta: {
      headers: {
        'Cache-Control': 'max-age=3600',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white" aria-labelledby="hero-heading">
          <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center animate-in">
              <h1 id="hero-heading" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
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
        <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8" aria-labelledby="featured-heading">
          <div className="animate-in">
            <h2 id="featured-heading" className="text-2xl font-bold tracking-tight text-gray-900">Featured Contractors</h2>
            <p className="mt-2 text-gray-500">Top professionals in London</p>
            
            {isLoading && (
              <div className="text-center py-12" role="status" aria-live="polite">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
                  <span className="sr-only">Loading contractors...</span>
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
              <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">
                No contractors found matching your criteria.
              </div>
            )}
            
            <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3" role="list">
              {filteredContractors.map((contractor) => (
                <div key={contractor.id} role="listitem">
                  <ContractorCard
                    contractor={contractor}
                    getDisplayImage={getDisplayImage}
                    getDisplayAddress={getDisplayAddress}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AdSense Section */}
        <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div 
              id="contractor-list-ads" 
              className="min-h-[250px] bg-gray-100 flex items-center justify-center" 
              role="complementary"
              aria-label="Advertisement"
            >
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
