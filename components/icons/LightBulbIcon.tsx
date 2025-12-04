
import React from 'react';

const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311V21m-3.75-2.311V21m-3.75-7.478a12.057 12.057 0 0 1-4.5 0m3.75-4.811V8.25a3.75 3.75 0 0 1 7.5 0v2.69" />
    </svg>
);

export default LightBulbIcon;
