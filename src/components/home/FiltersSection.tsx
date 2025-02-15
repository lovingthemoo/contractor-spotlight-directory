
import SpecialtyFilter from "@/components/contractors/SpecialtyFilter";
import RatingFilter from "@/components/contractors/RatingFilter";
import ReviewsFilter from "@/components/contractors/ReviewsFilter";

interface FiltersSectionProps {
  specialties: string[];
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  ratingFilters: string[];
  selectedReviews: string;
  setSelectedReviews: (reviews: string) => void;
  reviewFilters: string[];
}

const FiltersSection = ({
  specialties,
  selectedSpecialty,
  setSelectedSpecialty,
  selectedRating,
  setSelectedRating,
  ratingFilters,
  selectedReviews,
  setSelectedReviews,
  reviewFilters
}: FiltersSectionProps) => {
  return (
    <>
      <SpecialtyFilter 
        specialties={specialties}
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        aria-label="Filter by specialty"
      />

      <div className="flex flex-col md:flex-row md:gap-8">
        <RatingFilter 
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          ratingFilters={ratingFilters}
        />

        <ReviewsFilter
          selectedReviews={selectedReviews}
          setSelectedReviews={setSelectedReviews}
          reviewFilters={reviewFilters}
        />
      </div>
    </>
  );
};

export default FiltersSection;
