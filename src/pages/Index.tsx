
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/contractors/SearchBar";
import SpecialtyFilter from "@/components/contractors/SpecialtyFilter";
import RatingFilter from "@/components/contractors/RatingFilter";
import ContractorsList from "@/components/contractors/ContractorsList";
import { useContractorFilters } from "@/hooks/useContractorFilters";
import { transformContractor } from "@/utils/contractor-transformer";
import { toast } from "sonner";

const specialties = ["All", "Building", "Electrical", "Plumbing", "Roofing", "Home Repair", "Gardening", "Construction", "Handyman"];
const ratingFilters = ["All", "4.5+", "4.0+", "3.5+", "3.0+"];

const Index = () => {
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        // First, get contractors with Google photos
        const withGooglePhotosQuery = supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .neq('google_photos', '[]')
          .order('rating', { ascending: false });

        const googlePhotosResponse = await withGooglePhotosQuery;
        
        if (googlePhotosResponse.error) {
          toast.error('Failed to fetch contractors');
          throw googlePhotosResponse.error;
        }

        let contractorsData = googlePhotosResponse.data || [];
        
        // If we don't have enough contractors with Google photos, get ones with uploaded images
        if (contractorsData.length < 10) {
          const withImagesQuery = supabase
            .from('contractors')
            .select('*')
            .not('rating', 'is', null)
            .gt('images', '{}')
            .order('rating', { ascending: false });

          const uploadedImagesResponse = await withImagesQuery;

          if (!uploadedImagesResponse.error && uploadedImagesResponse.data) {
            const newContractors = uploadedImagesResponse.data.filter(
              gc => !contractorsData.some(c => c.id === gc.id)
            );
            contractorsData = [...contractorsData, ...newContractors];
          }
        }

        // If we still need more contractors, get the rest with default specialty images
        if (contractorsData.length < 10) {
          const fallbackQuery = supabase
            .from('contractors')
            .select('*')
            .not('rating', 'is', null)
            .not('default_specialty_image', 'is', null)
            .order('rating', { ascending: false });
            
          const fallbackResponse = await fallbackQuery;

          if (!fallbackResponse.error && fallbackResponse.data) {
            const newContractors = fallbackResponse.data.filter(
              fb => !contractorsData.some(c => c.id === fb.id)
            );
            contractorsData = [...contractorsData, ...newContractors];
          }
        }

        // Transform and sort contractors
        const transformedContractors = await Promise.all(contractorsData.map(transformContractor));
        
        return transformedContractors.sort((a, b) => {
          // First, prioritize contractors with any kind of images
          const aHasGooglePhotos = (a.google_photos?.length > 0) ? 2 : 0;
          const bHasGooglePhotos = (b.google_photos?.length > 0) ? 2 : 0;
          
          const aHasUploadedImages = (a.images?.length > 0) ? 1 : 0;
          const bHasUploadedImages = (b.images?.length > 0) ? 1 : 0;
          
          const aImageScore = aHasGooglePhotos + aHasUploadedImages;
          const bImageScore = bHasGooglePhotos + bHasUploadedImages;
          
          if (aImageScore !== bImageScore) {
            return bImageScore - aImageScore;
          }
          
          // Then sort by rating
          return (b.rating || 0) - (a.rating || 0);
        });
      } catch (e) {
        console.error('Error fetching contractors:', e);
        throw e;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const {
    searchQuery,
    setSearchQuery,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedRating,
    setSelectedRating,
    filteredContractors
  } = useContractorFilters(contractors);

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

        <RatingFilter 
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          ratingFilters={ratingFilters}
        />

        <ContractorsList 
          contractors={filteredContractors}
          isLoading={isLoading}
          error={error as Error | null}
          searchQuery={searchQuery}
          selectedSpecialty={selectedSpecialty}
          selectedRating={selectedRating}
        />

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
