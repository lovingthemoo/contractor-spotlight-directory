
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
import { migrateSpecialtyImages } from "@/utils/migration-utils";
import { Button } from "@/components/ui/button";

const specialties = ["All", "Building", "Electrical", "Plumbing", "Roofing", "Home Repair", "Gardening", "Construction", "Handyman"];
const ratingFilters = ["All", "4.5+", "4.0+", "3.5+", "3.0+"];

const Index = () => {
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      try {
        // Get all contractors that have any kind of images
        const withImagesQuery = supabase
          .from('contractors')
          .select('*')
          .not('rating', 'is', null)
          .or('google_photos.neq.[],(default_specialty_image.neq.null,images.neq.{})')
          .order('rating', { ascending: false });

        const withImagesResponse = await withImagesQuery;
        
        if (withImagesResponse.error) {
          toast.error('Failed to fetch contractors');
          throw withImagesResponse.error;
        }

        let contractorsData = withImagesResponse.data || [];
        
        // If we need more contractors, get the rest
        if (contractorsData.length < 10) {
          const remainingQuery = supabase
            .from('contractors')
            .select('*')
            .not('rating', 'is', null)
            .not('id', 'in', `(${contractorsData.map(c => `'${c.id}'`).join(',')})`)
            .order('rating', { ascending: false });

          const remainingResponse = await remainingQuery;

          if (!remainingResponse.error && remainingResponse.data) {
            contractorsData = [...contractorsData, ...remainingResponse.data];
          }
        }

        // Transform and sort contractors
        const transformedContractors = await Promise.all(contractorsData.map(transformContractor));
        
        return transformedContractors.sort((a, b) => {
          // First, prioritize contractors with Google photos (fastest to load)
          const aHasGooglePhotos = (a.google_photos?.length > 0) ? 3 : 0;
          const bHasGooglePhotos = (b.google_photos?.length > 0) ? 3 : 0;
          
          // Then those with uploaded images
          const aHasUploadedImages = (a.images?.length > 0) ? 2 : 0;
          const bHasUploadedImages = (b.images?.length > 0) ? 2 : 0;
          
          // Finally those with default specialty images
          const aHasDefaultImage = a.default_specialty_image ? 1 : 0;
          const bHasDefaultImage = b.default_specialty_image ? 1 : 0;
          
          const aImageScore = aHasGooglePhotos + aHasUploadedImages + aHasDefaultImage;
          const bImageScore = bHasGooglePhotos + bHasUploadedImages + bHasDefaultImage;
          
          if (aImageScore !== bImageScore) {
            return bImageScore - aImageScore;
          }
          
          // If image scores are equal, sort by rating
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

  const handleMigration = async () => {
    try {
      toast.loading('Starting image migration...');
      await migrateSpecialtyImages();
      toast.success('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Failed to migrate images');
    }
  };

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
              
              {/* Admin only migration button */}
              <div className="mt-4">
                <Button 
                  onClick={handleMigration}
                  variant="outline"
                >
                  Migrate Specialty Images
                </Button>
              </div>
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
