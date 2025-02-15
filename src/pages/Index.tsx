
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContractorsList from "@/components/contractors/ContractorsList";
import { useContractorFilters } from "@/hooks/useContractorFilters";
import { useContractorsQuery } from "@/hooks/useContractorsQuery";
import HeroSection from "@/components/home/HeroSection";
import FiltersSection from "@/components/home/FiltersSection";
import AdvertSection from "@/components/home/AdvertSection";

const specialties = ["All", "Building", "Electrical", "Plumbing", "Roofing", "Home Repair", "Gardening", "Gas Engineer"];
const ratingFilters = ["All", "4.5+", "4.0+", "3.5+", "3.0+"];
const reviewFilters = ["All", "0-5", "5-10", "10+"];

const Index = () => {
  const { data: contractors = [], isLoading, error } = useContractorsQuery();

  const {
    searchQuery,
    setSearchQuery,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedRating,
    setSelectedRating,
    selectedReviews,
    setSelectedReviews,
    filteredContractors
  } = useContractorFilters(contractors);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow" role="main">
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <FiltersSection 
          specialties={specialties}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          ratingFilters={ratingFilters}
          selectedReviews={selectedReviews}
          setSelectedReviews={setSelectedReviews}
          reviewFilters={reviewFilters}
        />

        <ContractorsList 
          contractors={filteredContractors}
          isLoading={isLoading}
          error={error as Error | null}
          searchQuery={searchQuery}
          selectedSpecialty={selectedSpecialty}
          selectedRating={selectedRating}
          selectedReviews={selectedReviews}
        />

        <AdvertSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
