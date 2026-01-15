
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';

interface FilterSidebarProps {
  availableSizes: string[];
  priceRange: { min: number; max: number };
  selectedSizes: string[];
  onPriceChange: (newRange: { min: number; max: number }) => void;
  onSizeToggle: (size: string) => void;
  onClearFilters: () => void;
  // New props
  selectedRating: number | null;
  onRatingChange: (rating: number | null) => void;
  minDiscount: number | null;
  onDiscountChange: (discount: number | null) => void;
  includeOutOfStock: boolean;
  onToggleOutOfStock: () => void;

  minPrice: number;
  maxPrice: number;
  availableTags?: string[];
  selectedTags?: string[];
  onTagToggle?: (tag: string) => void;
  categories?: Category[]; // Add categories prop
  currentCategoryId?: string;

  // Dynamic Attributes
  availableAttributes?: Record<string, string[]>;
  selectedAttributes?: Record<string, string[]>;
  onAttributeToggle?: (key: string, value: string) => void;
}


const FilterSidebar: React.FC<FilterSidebarProps> = ({
  availableSizes,
  priceRange,
  selectedSizes,
  onPriceChange,
  onSizeToggle,
  onClearFilters,
  minPrice,
  maxPrice,
  availableTags = [],
  selectedTags = [],
  onTagToggle = (tag) => { },
  categories = [],
  currentCategoryId,
  // New props
  selectedRating,
  onRatingChange,
  minDiscount,
  onDiscountChange,
  includeOutOfStock,
  onToggleOutOfStock,

  availableAttributes = {},
  selectedAttributes = {},
  onAttributeToggle = () => { }
}) => {
  const minRangeRef = useRef<HTMLInputElement>(null);
  const maxRangeRef = useRef<HTMLInputElement>(null);
  const rangeBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ... (keep getPercent and effects) ...
  const getPercent = useCallback((value: number) => {
    if (maxPrice - minPrice === 0) return 0;
    return Math.round(((value - minPrice) / (maxPrice - minPrice)) * 100);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const minPercent = getPercent(priceRange.min);
    const maxPercent = getPercent(priceRange.max);

    if (rangeBarRef.current) {
      rangeBarRef.current.style.left = `${minPercent}%`;
      rangeBarRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [priceRange, getPercent]);


  const handleMinRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange.max - 1);
    onPriceChange({ ...priceRange, min: value });
  };

  const handleMaxRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange.min + 1);
    onPriceChange({ ...priceRange, max: value });
  };

  const hasActiveFilters = selectedSizes.length > 0 || priceRange.min > minPrice || priceRange.max < maxPrice || selectedRating !== null || minDiscount !== null || includeOutOfStock || Object.values(selectedAttributes).some(arr => arr.length > 0);

  const rangeInputBaseClasses = [
    "absolute w-full h-1 bg-transparent appearance-none pointer-events-none -top-2 focus:outline-none focus:z-10",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-2",
    "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none",
  ].join(' ');


  // Helper to determine accurate Size label (e.g. Weight for cakes)
  const sizeLabel = React.useMemo(() => {
    const isWeight = availableSizes.some(s => s.toLowerCase().includes('kg') || s.toLowerCase().includes('g') || s.toLowerCase().includes('lb'));
    return isWeight ? 'Weight' : 'Size';
  }, [availableSizes]);

  return (
    <aside className="w-full lg:w-64 xl:w-72 space-y-8 pr-4">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-gray-900 font-serif">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-primary hover:text-pink-700 uppercase tracking-wide transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories List */}
      {categories.length > 0 && (
        <div className="space-y-4 border-b border-gray-200 pb-8">
          <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">Categories</h4>
          <div className="flex flex-col space-y-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className={`text-left text-sm transition-colors duration-200 hover:text-primary ${currentCategoryId === cat.id
                  ? 'font-bold text-primary pl-2 border-l-2 border-primary'
                  : 'text-gray-600 pl-2 border-l-2 border-transparent hover:border-gray-300'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Attribute filters */}
      {Object.entries(availableAttributes).map(([attrKey, values]) => (
        <div key={attrKey} className="space-y-4 border-b border-gray-200 pb-8">
          <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">{attrKey}</h4>
          <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {values.map(val => (
              <label key={val} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedAttributes[attrKey]?.includes(val) || false}
                  onChange={() => onAttributeToggle(attrKey, val)}
                  className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary transition duration-150 ease-in-out"
                />
                <span className={`text-sm group-hover:text-primary transition-colors ${selectedAttributes[attrKey]?.includes(val) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{val}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Price Filter */}
      <div className="space-y-4 border-b border-gray-200 pb-8">
        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">Price</h4>
        <div className="relative h-5 w-full mx-auto">
          <div className="relative w-full h-1 rounded-full bg-gray-200 top-1/2 -translate-y-1/2">
            <div ref={rangeBarRef} className="absolute h-1 rounded-full bg-primary" />
          </div>
          <input
            ref={minRangeRef}
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange.min}
            onChange={handleMinRangeChange}
            className={rangeInputBaseClasses}
            aria-label="Minimum price"
          />
          <input
            ref={maxRangeRef}
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange.max}
            onChange={handleMaxRangeChange}
            className={rangeInputBaseClasses}
            aria-label="Maximum price"
          />
        </div>
        <div className="flex justify-between items-center text-sm pt-2">
          <span className="text-gray-500 text-xs">Range:</span>
          <span className="text-gray-900 font-bold">
            ₹{priceRange.min.toLocaleString()} — ₹{priceRange.max.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Discount Filter - Chip Style */}
      <div className="space-y-4 border-b border-gray-200 pb-8">
        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">Discount</h4>
        <div className="flex flex-wrap gap-2">
          {[10, 20, 30, 40, 50].map(disc => (
            <button
              key={disc}
              onClick={() => onDiscountChange(minDiscount === disc ? null : disc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${minDiscount === disc
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {disc}%+ Off
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter - Chip Style */}
      <div className="space-y-4 border-b border-gray-200 pb-8">
        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">Customer Ratings</h4>
        <div className="flex flex-wrap gap-2">
          {[4, 3].map(star => (
            <button
              key={star}
              onClick={() => onRatingChange(selectedRating === star ? null : star)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 flex items-center gap-1 ${selectedRating === star
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <span>{star}★ & above</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="space-y-4 border-b border-gray-200 pb-8">
        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">Availability</h4>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={includeOutOfStock}
            onChange={onToggleOutOfStock}
            className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary transition duration-150 ease-in-out"
          />
          <span className={`text-sm group-hover:text-primary transition-colors ${includeOutOfStock ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Include Out of Stock</span>
        </label>
      </div>

      {/* Size / Weight Filter */}
      {availableSizes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">{sizeLabel}</h4>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onSizeToggle(size)}
                  className={`px-3 py-1.5 border rounded text-xs font-semibold transition-all duration-200 ${isSelected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </aside>
  );
};

export default FilterSidebar;
