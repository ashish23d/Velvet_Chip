import React, { useRef } from 'react';
import { Product } from '../types.ts';
import XIcon from './icons/XIcon.tsx';
import SimilarProductCard from './SimilarProductCard.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';

interface SimilarProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const SimilarProductsModal: React.FC<SimilarProductsModalProps> = ({ isOpen, onClose, products }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  const hasMultipleProducts = products.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`relative bg-white w-full ${hasMultipleProducts ? 'max-w-6xl' : 'max-w-md'} mx-4 rounded-xl shadow-2xl p-6 flex flex-col max-h-[85vh] transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-serif text-gray-800">
            {hasMultipleProducts ? 'Similar Products' : 'Similar Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="relative flex-grow min-h-0">
          {hasMultipleProducts ? (
            <>
              {/* Slider for multiple products */}
              <div
                ref={scrollContainerRef}
                className="flex items-center space-x-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar p-2 -m-2 h-full"
              >
                {products.map((product) => (
                  <div key={product.id} className="snap-start flex-shrink-0 w-[240px]">
                    <SimilarProductCard product={product} onNavigate={onClose} />
                  </div>
                ))}
              </div>
              {products.length > 4 && (
                <>
                  <button
                    onClick={() => scroll('left')}
                    className="absolute top-1/2 -left-5 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="absolute top-1/2 -right-5 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                  </button>
                </>
              )}
            </>
          ) : (
            // Single, centered, larger product view
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-sm">
                {products[0] && <SimilarProductCard product={products[0]} onNavigate={onClose} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarProductsModal;