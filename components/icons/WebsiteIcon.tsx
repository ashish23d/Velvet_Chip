
import React from 'react';

const WebsiteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.504 0 1.002-.02 1.49-.06M12 3c.504 0 1.002.02 1.49.06M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3c-5.186 0-9.44 4.015-9.44 9s4.254 9 9.44 9m0-18c5.186 0 9.44 4.015 9.44 9s-4.254 9-9.44 9M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
);

export default WebsiteIcon;
