import React from 'react';

const BookmarkIcon: React.FC<{ className?: string; isFilled?: boolean }> = ({ className, isFilled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={isFilled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    className={className}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);

export default BookmarkIcon;
