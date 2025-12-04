
import React from 'react';

const ShoppingBagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.559c-.656 0-1.189-.585-1.119-1.243l1.263-12a1.125 1.125 0 0 1 1.12-1.007h8.898c.498 0 .95.334 1.096.807Z" />
  </svg>
);

export default ShoppingBagIcon;
