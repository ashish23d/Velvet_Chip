import React from 'react';

const ArrowTrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 9-9 4.5 4.5L21.75 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 18H14.25a.75.75 0 0 1-.75-.75V10.5" />
    </svg>
);

export default ArrowTrendingUpIcon;
