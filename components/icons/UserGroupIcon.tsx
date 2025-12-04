import React from 'react';

const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm-9 5.402a9.093 9.093 0 0 1 3.741-.479a3 3 0 0 1 4.682-2.72M12 18.72a3 3 0 0 1-4.682-2.72 9.093 9.093 0 0 1-3.741-.479m-.479 3.742a9.093 9.093 0 0 1-3.262-3.262m3.262 3.262a9.093 9.093 0 0 1 3.262-3.262m0 0a3 3 0 0 1 4.682 2.72m-4.682-2.72a3 3 0 0 1-4.682 2.72m0 0a3 3 0 0 1-4.682-2.72M12 6.72a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    </svg>
);

export default UserGroupIcon;
