
import React, { useCallback, useEffect, useRef } from 'react';

interface FilterSidebarProps {
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  priceRange: { min: number; max: number };
  selectedSizes: string[];
  selectedColors: string[];
  onPriceChange: (newRange: { min: number; max: number }) => void;
  onSizeToggle: (size: string) => void;
  onColorToggle: (colorName: string) => void;
  onClearFilters: () => void;

  minPrice: number;
  maxPrice: number;
  availableTags?: string[];
  selectedTags?: string[];
  onTagToggle?: (tag: string) => void;
}


const FilterSidebar: React.FC<FilterSidebarProps> = ({
  availableSizes,
  availableColors,
  priceRange,
  selectedSizes,
  selectedColors,
  onPriceChange,
  onSizeToggle,
  onColorToggle,
  onClearFilters,

  minPrice,
  maxPrice,
  availableTags = [],
  selectedTags = [],
  onTagToggle = (tag) => { },
}) => {
  const minRangeRef = useRef<HTMLInputElement>(null);
  const maxRangeRef = useRef<HTMLInputElement>(null);
  const rangeBarRef = useRef<HTMLDivElement>(null);

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

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || priceRange.min > minPrice || priceRange.max < maxPrice || selectedTags.length > 0;

  const rangeInputBaseClasses = [
    "absolute w-full h-1 bg-transparent appearance-none pointer-events-none -top-2 focus:outline-none focus:z-10",
    // Thumb styles for Webkit (Chrome, Safari)
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-2",
    // Thumb styles for Firefox
    "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none",
  ].join(' ');


  return (
    <aside className="w-full lg:w-64 xl:w-72 space-y-8">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Filter */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 tracking-wide">PRICE</h4>

        {/* Two-point slider container */}
        <div className="relative h-5 w-full">
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

        <div className="flex justify-center items-center text-sm pt-2">
          <span className="text-gray-800 font-medium">
            ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Color</h4>
          <div className="flex flex-wrap gap-3">
            {availableColors.map(color => {
              const isSelected = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => onColorToggle(color.name)}
                  className={`w-8 h-8 rounded-full border border-gray-300 transition-transform transform hover:scale-110 flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Filter by color ${color.name}`}
                  aria-pressed={isSelected}
                >
                  {(color.hex.toUpperCase() === '#FFFFFF' || color.hex.toUpperCase() === '#FFFFF0') && isSelected && (
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isSelected && color.hex.toUpperCase() !== '#FFFFFF' && color.hex.toUpperCase() !== '#FFFFF0' && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Size</h4>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onSizeToggle(size)}
                  className={`px-4 py-1 border rounded-md text-sm font-medium transition-colors ${isSelected ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary hover:text-primary'}`}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={`px-3 py-1 text-xs border rounded-full transition-colors ${isSelected ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                  aria-pressed={isSelected}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </aside>
  );
};

export default FilterSidebar;
