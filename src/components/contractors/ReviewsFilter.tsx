
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ReviewsFilterProps {
  selectedReviews: string;
  setSelectedReviews: (reviews: string) => void;
  reviewFilters: string[];
}

const ReviewsFilter = ({ selectedReviews, setSelectedReviews, reviewFilters }: ReviewsFilterProps) => {
  return (
    <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="animate-in">
        <h2 className="text-lg font-semibold text-gray-900" id="reviews-filter-heading">
          Filter by Reviews
        </h2>
        <RadioGroup 
          className="flex flex-wrap gap-4 mt-4"
          defaultValue={selectedReviews}
          onValueChange={setSelectedReviews}
          aria-label="Reviews filter"
          aria-labelledby="reviews-filter-heading"
        >
          {reviewFilters.map((reviews) => (
            <div key={reviews} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={reviews} 
                id={`reviews-${reviews.toLowerCase().replace('+', '-plus')}`}
                title={`Select ${reviews} reviews filter`}
              />
              <Label 
                htmlFor={`reviews-${reviews.toLowerCase().replace('+', '-plus')}`}
                className="cursor-pointer"
              >
                {reviews}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </section>
  );
};

export default ReviewsFilter;
