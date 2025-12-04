import React from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';

interface ThankYouModalProps {
  isOpen: boolean;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-8 transform transition-all animate-jiggle">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Thank You!</h2>
        <p className="text-gray-600 mt-2">Your review has been submitted successfully.</p>
      </div>
    </div>
  );
};

export default ThankYouModal;
