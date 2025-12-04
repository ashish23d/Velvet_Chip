
import React from 'react';
import StarIcon from './icons/StarIcon.tsx';

interface RatingProps {
  rating: number;
  maxRating?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={index}
            className={`w-4 h-4 ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        );
      })}
    </div>
  );
};

export default Rating;