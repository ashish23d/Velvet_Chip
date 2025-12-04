
import React, { useState } from 'react';
import SupabaseImage from './SupabaseImage.tsx';
import XIcon from './icons/XIcon.tsx';
import { BUCKETS } from '../constants.ts';

interface CustomerPhotosProps {
  photoPaths: string[];
}

const CustomerPhotos: React.FC<CustomerPhotosProps> = ({ photoPaths }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (photoPaths.length === 0) {
    return null;
  }

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNext = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % photoPaths.length);
  };

  const goToPrev = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + photoPaths.length) % photoPaths.length);
  };

  const latestPhotos = photoPaths.slice(0, 5);

  return (
    <div className="my-16 border-t pt-12">
      <h2 className="text-2xl lg:text-3xl font-serif text-center text-gray-800 mb-8">Photos from Customers</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {latestPhotos.map((path, index) => (
          <button
            key={index}
            onClick={() => openModal(index)}
            className="aspect-square relative group rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <SupabaseImage
              bucket={BUCKETS.REVIEW_IMAGES}
              imagePath={path}
              alt={`Customer review photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ))}
        {photoPaths.length > 5 && (
          <button
            onClick={() => openModal(5)}
            className="aspect-square flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-primary font-semibold"
          >
            +{photoPaths.length - 5} More
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-10">
              <XIcon className="w-6 h-6" />
            </button>
            
            {/* Main Image */}
            <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
                 <SupabaseImage
                    bucket={BUCKETS.REVIEW_IMAGES}
                    imagePath={photoPaths[selectedImageIndex]}
                    alt={`Customer review photo ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>
            
            {photoPaths.length > 1 && (
                <>
                {/* Prev Button */}
                <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* Next Button */}
                <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                </>
            )}

             {/* Counter */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 rounded-full px-3 py-1 text-sm">
                {selectedImageIndex + 1} / {photoPaths.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotos;
