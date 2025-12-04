import React from 'react';

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625a3.375 3.375 0 0 0-3.375 3.375v13.5A3.375 3.375 0 0 0 5.625 21h12.75c1.86 0 3.375-1.515 3.375-3.375V11.25a2.25 2.25 0 0 0-2.25-2.25h-2.25a2.25 2.25 0 0 0-2.25 2.25v6.75" />
    </svg>
);

export default DocumentTextIcon;