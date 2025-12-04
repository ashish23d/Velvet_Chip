
import React from 'react';

const FlipkartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path d="M12.913 2.545H4.09l4.418 4.419-4.418 4.418h8.823L17.33 6.964l-4.418-4.419Z" fill="#F0C14B"/>
        <path d="M12.913 12.727H4.09l4.418 4.418-4.418 4.419h8.823l4.418-4.419-4.418-4.418Z" fill="#3B74F3"/>
    </svg>
);

export default FlipkartIcon;
