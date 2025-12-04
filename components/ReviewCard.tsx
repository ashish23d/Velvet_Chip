import React from 'react';
import { Review } from '../types.ts';
import Avatar from './Avatar.tsx';
import Rating from './Rating.tsx';
import CheckBadgeIcon from './icons/CheckBadgeIcon.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';

interface ReviewCardProps {
  review: Review;
}

const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border-b pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar user={{ name: review.author, avatar: review.userImage }} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{review.author}</p>
              <p className="text-xs text-gray-400">{formatReviewDate(review.date)}</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center gap-2">
                <Rating rating={review.rating} />
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckBadgeIcon className="w-4 h-4"/>
                    Verified Purchase
                </span>
            </div>
          </div>
          <p className="mt-3 text-gray-600 text-sm leading-relaxed">{review.comment}</p>
          
          {review.productImages && review.productImages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
                {review.productImages.map((imagePath, index) => (
                    <a key={index} href="#" className="block w-20 h-20 rounded-md overflow-hidden group">
                        <SupabaseImage
                          bucket={BUCKETS.REVIEW_IMAGES}
                          imagePath={imagePath}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
