import React from 'react';

const MastercardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" fill="none" role="img" aria-label="Mastercard Logo">
        <circle cx="15" cy="12" r="7" fill="#EA001B"></circle>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"></circle>
        <path fill="#FF5F00" d="M20 12c0-3.87-3.13-7-7-7v14c3.87 0 7-3.13 7-7Z"></path>
    </svg>
);

export default MastercardIcon;
