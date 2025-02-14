
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

        // Transform each contractor data
        const transformedData = response.data.map(contractor => transformContractor(contractor));
        console.log('Transformed contractors:', transformedData);
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
              
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
          </div>
        </section>

        <SpecialtyFilter 
          specialties={specialties}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
        />

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
