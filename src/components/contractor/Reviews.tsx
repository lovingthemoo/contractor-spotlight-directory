
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { GoogleReview } from "@/types/contractor";

interface ReviewsProps {
  reviews: GoogleReview[];
}

export const Reviews = ({ reviews }: ReviewsProps) => {
  if (!reviews?.length) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Client Reviews</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {reviews.map((review, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600 mb-4">{review.text}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{review.author_name}</span>
              <time dateTime={review.time}>
                {new Date(review.time).toLocaleDateString()}
              </time>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
