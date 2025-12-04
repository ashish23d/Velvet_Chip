import React from 'react';

const UpiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={className}
        aria-hidden="true"
        strokeWidth={1.5} 
        stroke="currentColor" 
        fill="none"
    >
        <path d="M3 6.51a2.5 2.5 0 0 1 2.5-2.5h13a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-13a2.5 2.5 0 0 1-2.5-2.5v-11Z" strokeMiterlimit="10"/>
        <path d="M3 10.01h18" strokeMiterlimit="10"/>
        <path d="M7 15.01h4" strokeMiterlimit="10" strokeLinecap="round"/>
        <style>{`
            .upi-text { font-size: 5px; font-family: sans-serif; fill: currentColor; }
        `}</style>
        <text x="14" y="16.5" className="upi-text">UPI</text>
    </svg>
);

export default UpiIcon;
