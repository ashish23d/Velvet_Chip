import React from 'react';

const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 4.512A13.14 13.14 0 0 1 12 15.75c-2.063 0-4.013-.536-5.625-1.488" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 4.512C14.025 3.534 12.55 3 10.875 3 6.937 3 4.125 6.136 4.125 10.08c0 2.248 1.058 4.28 2.69 5.66" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.875 10.082c0-3.944-2.813-7.08-6.75-7.08-1.676 0-3.15.534-4.375 1.512m15 5.568c0 3.944-2.812 7.08-6.75 7.08-1.675 0-3.15-.534-4.375-1.512m0-11.136C9.975 4.044 8.5 4.5 7.125 4.5 3.187 4.5.375 7.636.375 11.58c0 2.248 1.058 4.28 2.69 5.66m13.81-11.328a11.25 11.25 0 0 0-2.69-5.66m2.69 5.66a11.25 11.25 0 0 1-2.69 5.66" />
    </svg>
);

export default FireIcon;