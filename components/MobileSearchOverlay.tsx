import React, { useEffect } from 'react';
import SearchBar from './SearchBar.tsx';

interface MobileSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-white z-50 lg:hidden animate-slide-in-down" role="dialog" aria-modal="true">
            <div className="h-full flex flex-col">
                <div className="flex-shrink-0 flex items-center h-20 px-4 border-b border-gray-200">
                    <div className="flex-grow">
                        <SearchBar isMobileOverlay={true} onResultClick={onClose} autofocusOnOpen={true} />
                    </div>
                    <button onClick={onClose} className="ml-4 flex-shrink-0 text-primary font-medium text-sm">
                        Cancel
                    </button>
                </div>
                {/* The SearchBar's dropdown will now correctly fill the screen below this header */}
            </div>
        </div>
    );
};

export default MobileSearchOverlay;