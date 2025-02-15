
import SpecialtyFilter from "@/components/contractors/SpecialtyFilter";
import RatingFilter from "@/components/contractors/RatingFilter";

interface FiltersSectionProps {
  specialties: string[];
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  ratingFilters: string[];
}

const FiltersSection = ({
  specialties,
  selectedSpecialty,
  setSelectedSpecialty,
  selectedRating,
  setSelectedRating,
  ratingFilters
}: FiltersSectionProps) => {
  return (
    <>
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
    </>
  );
};

export default FiltersSection;
