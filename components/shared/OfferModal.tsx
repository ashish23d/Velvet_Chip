import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import XIcon from '../icons/XIcon';
import TagIcon from '../icons/TagIcon';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose }) => {
  const { announcement } = useAppContext();

  if (!isOpen || !announcement) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <TagIcon className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-gray-800 mt-4">
            Special Offer!
        </h2>

        <p className="text-gray-600 mt-2 text-lg">
            {announcement.text}
        </p>
        
        {announcement.link && (
             <Link 
                to={announcement.link} 
                onClick={onClose}
                className="mt-6 inline-block bg-primary text-white py-2 px-8 rounded-full font-medium hover:bg-pink-700 transition-colors"
              >
                Shop Now
            </Link>
        )}
      </div>
    </div>
  );
};

export default OfferModal;