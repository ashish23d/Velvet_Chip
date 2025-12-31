
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
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

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

  const openGridModal = () => {
    setIsGridModalOpen(true);
  }

  const closeGridModal = () => {
    setIsGridModalOpen(false);
  }

  const goToNext = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % photoPaths.length);
  };

  const goToPrev = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + photoPaths.length) % photoPaths.length);
  };

  // Show up to 6 items. If we have > 6, the 6th item (index 5) becomes the trigger.
  const displayLimit = 6;
  const hasMore = photoPaths.length > displayLimit;
  const visiblePhotos = hasMore ? photoPaths.slice(0, displayLimit - 1) : photoPaths.slice(0, displayLimit);

  return (
    <div className="my-8 border-t pt-8">
      <h2 className="text-xl lg:text-2xl font-serif text-gray-800 mb-6">Photos from Customers</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {visiblePhotos.map((path, index) => (
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
        {hasMore && (
          <button
            onClick={openGridModal}
            className="aspect-square relative rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary group"
          >
            <SupabaseImage
              bucket={BUCKETS.REVIEW_IMAGES}
              imagePath={photoPaths[displayLimit - 1]} // Show the 6th image as background or just gray? User said "after 6", usually 6th is overlay.
              // Let's use the next image as background but blurred/darkened
              alt="More photos"
              className="w-full h-full object-cover blur-[2px] transition-transform duration-300 group-hover:scale-110" // blur effect
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
              <span className="text-white font-semibold text-lg">+{photoPaths.length - (displayLimit - 1)}</span>
            </div>
          </button>
        )}
      </div>

      {/* Single View Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button onClick={closeModal} className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 z-10 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>

            <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center px-12">
              <SupabaseImage
                bucket={BUCKETS.REVIEW_IMAGES}
                imagePath={photoPaths[selectedImageIndex]}
                alt={`Customer review photo ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {photoPaths.length > 1 && (
              <>
                <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/40 px-4 py-1 rounded-full text-sm font-medium backdrop-blur-md">
              {selectedImageIndex + 1} / {photoPaths.length}
            </div>
          </div>
        </div>
      )}

      {/* Grid View Modal ("More" popup) */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
            <h3 className="text-xl font-semibold text-gray-800">Customer Photos ({photoPaths.length})</h3>
            <button onClick={closeGridModal} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {photoPaths.map((path, index) => (
                <button
                  key={index}
                  onClick={() => { closeGridModal(); openModal(index); }} // Switch to single view
                  className="aspect-square relative group rounded-lg overflow-hidden bg-gray-200"
                >
                  <SupabaseImage
                    bucket={BUCKETS.REVIEW_IMAGES}
                    imagePath={path}
                    alt={`Customer photo ${index}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotos;
