import React from 'react';
import FilterSidebar from './FilterSidebar.tsx';
import XIcon from './icons/XIcon.tsx';
import FireIcon from './icons/FireIcon.tsx';
import { SparklesIcon } from '@heroicons/react/24/outline';
import TagIcon from './icons/TagIcon.tsx';
import ArrowUpIcon from './icons/ArrowUpIcon.tsx';
import ArrowDownIcon from './icons/ArrowDownIcon.tsx';
import StarIcon from './icons/StarIcon.tsx';


interface MobileFilterSortSheetProps {
  isOpen: boolean;
  view: 'sort' | 'filter' | null;
  onClose: () => void;
  // Sort props
  currentSortBy: string;
  onSortChange: (newSort: string) => void;
  // Filter props
  // Filter props
  availableSizes: string[];
  priceRange: { min: number; max: number };
  selectedSizes: string[];
  onPriceChange: (newRange: { min: number; max: number }) => void;
  onSizeToggle: (size: string) => void;
  onClearFilters: () => void;
  selectedRating: number | null;
  onRatingChange: (rating: number | null) => void;
  minDiscount: number | null;
  onDiscountChange: (discount: number | null) => void;
  includeOutOfStock: boolean;
  onToggleOutOfStock: () => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  minPrice: number;
  maxPrice: number;
  availableTags?: string[];
  selectedTags?: string[];
  onTagToggle?: (tag: string) => void;
  // Dynamic Attributes
  availableAttributes?: Record<string, string[]>;
  selectedAttributes?: Record<string, string[]>;
  onAttributeToggle?: (key: string, value: string) => void;
}

const SortOption: React.FC<{
  label: string;
  sortKey: string;
  icon: React.ReactNode;
  currentSortBy: string;
  onSortChange: (key: string) => void;
}> = ({ label, sortKey, icon, currentSortBy, onSortChange }) => {
  const isSelected = currentSortBy === sortKey;
  return (
    <button
      onClick={() => onSortChange(sortKey)}
      className={`flex items-center w-full text-left p-4 text-gray-700 transition-colors duration-200 ${isSelected ? 'bg-pink-50 text-primary font-semibold' : 'hover:bg-gray-50'
        }`}
      role="menuitemradio"
      aria-checked={isSelected}
    >
      <span className="w-6 mr-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const MobileFilterSortSheet: React.FC<MobileFilterSortSheetProps> = ({
  isOpen,
  view,
  onClose,
  currentSortBy,
  onSortChange,
  onApplyFilters,
  ...filterProps
}) => {
  const sortOptions = [
    { sortKey: 'popular', label: 'Popular', icon: <FireIcon className="h-6 w-6" /> },
    { sortKey: 'latest', label: 'Latest', icon: <SparklesIcon className="h-6 w-6" /> },
    { sortKey: 'rating', label: 'Rating', icon: <StarIcon className="h-5 w-5" /> },
    { sortKey: 'discount', label: 'Discount', icon: <TagIcon className="h-6 w-6" /> },
    { sortKey: 'price-desc', label: 'Price: High to Low', icon: <ArrowUpIcon className="h-6 w-6" /> },
    { sortKey: 'price-asc', label: 'Price: Low to High', icon: <ArrowDownIcon className="h-6 w-6" /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{ maxHeight: '90vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <h2 id="sheet-title" className="text-lg font-semibold text-gray-800">
            {view === 'sort' ? 'Sort By' : 'Filter'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {view === 'sort' && (
            <div role="menu" aria-orientation="vertical">
              {sortOptions.map((option) => (
                <SortOption
                  key={option.sortKey}
                  {...option}
                  currentSortBy={currentSortBy}
                  onSortChange={onSortChange}
                />
              ))}
            </div>
          )}
          {view === 'filter' && (
            <div className="p-4">
              <FilterSidebar {...filterProps} />
            </div>
          )}
        </div>

        {/* Footer for Filter view */}
        {view === 'filter' && (
          <div className="flex-shrink-0 p-4 border-t grid grid-cols-2 gap-4 bg-white">
            <button
              onClick={onClose}
              className="py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onApplyFilters}
              className="py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileFilterSortSheet;