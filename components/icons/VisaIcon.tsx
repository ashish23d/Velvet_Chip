import React from 'react';

const VisaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 12" fill="none" role="img" aria-label="Visa Card Logo">
        <path fill="#1A1F71" d="M11.97 11.53.53 0H4.5l3.93 8.35L12.02 0h3.58l-3.9 11.53h-3.66Z" />
        <path fill="#F9A600" d="M34.42 11.53 38 0h-3.4L32.1 8.87l-.09.3-1.8-6.9H26.5l3.91 11.53h3.42l.59-2.2ZM24.41 0l-3.9 11.53H17.1L21 0h3.41Z" />
        <path fill="#1A1F71" d="M15.07 1.83a2.1 2.1 0 0 0-1.8-.75c-1.4 0-2.3.69-2.3 1.7 0 .76.54 1.1 1.25 1.43l.88.4c1.1.49 1.7.94 1.7 1.9 0 1.29-1.2 1.95-2.6 1.95a2.76 2.76 0 0 1-2.45-1.04l-.5.9a3.3 3.3 0 0 0 2.95 1.45c1.64 0 2.72-.73 2.72-1.82 0-.82-.6-1.18-1.33-1.5l-.8-.36c-.95-.42-1.5-.82-1.5-1.74 0-.8.8-1.5 2-1.5.8 0 1.4.24 1.8.6l.51-.83Z" />
    </svg>
);

export default VisaIcon;
