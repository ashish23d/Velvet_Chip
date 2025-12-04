
import React, { useState } from 'react';
import StarIcon from './icons/StarIcon.tsx';

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
}

const ratingLabels = [
  'Hate it',
  'Didn\'t like it',
  'Was okay',
  'Liked it',
  'Loved it!'
];

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col items-center sm:items-start">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform duration-150 transform hover:scale-125"
              aria-label={`Rate ${starValue} out of 5 stars`}
            >
              <StarIcon
                className={`w-10 h-10 cursor-pointer ${
                  (hoverRating || rating) >= starValue
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-gray-600 h-5">
        {(hoverRating > 0 && ratingLabels[hoverRating - 1]) || (rating > 0 && ratingLabels[rating - 1]) || 'Select a rating'}
      </p>
    </div>
  );
};

export default StarRatingInput;
