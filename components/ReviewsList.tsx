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

    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Ratings & Reviews</h3>
      <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-gray-100 pb-8">
        {/* Overall Rating */}
        <div className="md:w-1/3 flex flex-col items-center justify-center text-center border-r-0 md:border-r border-gray-100 pr-0 md:pr-8">
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">{productRating.toFixed(1)}</p>
            <span className="text-sm text-gray-400">/ 5</span>
          </div>
          <div className="flex my-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(productRating) ? 'text-green-500' : 'text-gray-200'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500 font-medium">{totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}</p>
        </div>

        {/* Rating Breakdown */}
        <div className="md:w-2/3 pl-0 md:pl-4">
          <div className="space-y-2">
            {Object.entries(ratingCounts).reverse().map(([star, count]) => {
              const percentage = totalRatings > 0 ? ((count as number) / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs sm:text-sm">
                  <span className="font-semibold w-6 text-gray-600 flex items-center gap-0.5">{star} <span className="text-xs">★</span></span>
                  <div className="flex-grow bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${['bg-green-500', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500'][5 - parseInt(star)]}`} // Color coding
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-10 text-right text-gray-400 text-xs">{count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-8">
        {reviews.slice(0, 10).map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
        {reviews.length > 10 && (
          <details className="group">
            <summary className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-primary cursor-pointer hover:bg-gray-50 rounded-lg transition-colors list-none select-none">
              <span>View All {reviews.length} Reviews</span>
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="space-y-8 mt-8 pt-8 border-t border-gray-100 animate-fade-in">
              {reviews.slice(10).map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
