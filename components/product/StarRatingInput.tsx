
import React, { useState } from 'react';
import StarIcon from '../icons/StarIcon';

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  readOnly?: boolean;
}

const ratingLabels = [
  'Hate it',
  'Didn\'t like it',
  'Was okay',
  'Liked it',
  'Loved it!'
];

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, setRating, readOnly = false }) => {
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
              disabled={readOnly}
              onClick={() => !readOnly && setRating(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`focus:outline-none transition-transform duration-150 transform ${!readOnly ? 'hover:scale-125' : ''}`}
              aria-label={`Rate ${starValue} out of 5 stars`}
            >
              <StarIcon
                className={`w-10 h-10 ${!readOnly ? 'cursor-pointer' : 'cursor-default'} ${(hoverRating || rating) >= starValue
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                  }`}
              />
            </button>
          );
        })}
      </div>
      {!readOnly && (
        <p className="mt-2 text-sm text-gray-600 h-5">
          {(hoverRating > 0 && ratingLabels[hoverRating - 1]) || (rating > 0 && ratingLabels[rating - 1]) || 'Select a rating'}
        </p>
      )}
    </div>
  );
};

export default StarRatingInput;
