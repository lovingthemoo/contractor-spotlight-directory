
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RatingFilterProps {
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  ratingFilters: string[];
}

const RatingFilter = ({ selectedRating, setSelectedRating, ratingFilters }: RatingFilterProps) => {
  return (
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
  );
};

export default RatingFilter;
