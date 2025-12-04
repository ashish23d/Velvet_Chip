import React, { useMemo } from 'react';
import { Review } from '../types.ts';
import StarIcon from './icons/StarIcon.tsx';
import ReviewCard from './ReviewCard.tsx';

interface ReviewsListProps {
  reviews: Review[];
  productRating: number;
  totalReviews: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, productRating, totalReviews }) => {
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        counts[rating as keyof typeof counts]++;
      }
    });
    return counts;
  }, [reviews]);
  
  const totalRatings = reviews.length;

  if (totalRatings === 0) {
    return (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">This product has no reviews yet.</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b pb-6 mb-6">
        {/* Overall Rating */}
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-gray-800">{productRating.toFixed(1)}</p>
          <div className="flex my-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-6 h-6 ${i < Math.round(productRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500">{totalReviews} Ratings & {totalRatings} Reviews</p>
        </div>

        {/* Rating Breakdown */}
        <div className="md:col-span-2">
          {Object.entries(ratingCounts).reverse().map(([star, count]) => {
            const percentage = totalRatings > 0 ? ((count as number) / totalRatings) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-4 text-sm">
                <span className="font-medium text-gray-600">{star} ★</span>
                <div className="flex-grow bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="w-12 text-right text-gray-500">{count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Individual Reviews */}
      <div className="space-y-8">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
