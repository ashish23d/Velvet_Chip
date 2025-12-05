import React, { useRef, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { BUCKETS } from '../constants.ts';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';

const CategoryShowcase: React.FC = () => {
  const { categories } = useAppContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        // If we can't scroll more, reset to start
        if (scrollLeft + clientWidth >= scrollWidth - 5) { // 5px tolerance
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: clientWidth / 2, behavior: 'smooth' });
        }
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/container bg-white dark:bg-gray-900/50 rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100 dark:border-gray-800 w-full">
      {/* Navigation Arrows */}
      <button
        onClick={() => scroll('left')}
        className={`absolute top-1/2 -left-2 sm:-left-5 z-10 -translate-y-1/2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-primary border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-110 disabled:opacity-0 ${showLeftArrow ? 'opacity-0 group-hover/container:opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className={`absolute top-1/2 -right-2 sm:-right-5 z-10 -translate-y-1/2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-primary border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-110 ${showRightArrow ? 'opacity-0 group-hover/container:opacity-100 animate-pulse' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto pb-4 -mx-2 px-2 scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{
          display: 'grid',
          gridTemplateRows: 'repeat(2, 1fr)',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(140px, 1fr)', // Increased from 120px for better mobile view
          gap: '1rem', // Reduced gap slightly for better density
        }}
      >
        {/* Responsive column sizing */}
        <style>{`
            @media (min-width: 640px) { .category-grid { grid-auto-columns: minmax(160px, 1fr) !important; } }
            @media (min-width: 1024px) { .category-grid { grid-auto-columns: calc((100% - 4rem) / 5) !important; } } 
        `}</style>

        {categories.map((category) => (
          <div key={category.id} className="category-grid flex-shrink-0 snap-start">
            <EditableWrapper editUrl={`/admin/categories/edit/${category.id}`}>
              <ReactRouterDOM.Link
                to={`/category/${category.id}`}
                className="group relative block h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1"
              >
                {/* Image Wrapper */}
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <SupabaseImage
                    bucket={BUCKETS.CATEGORIES}
                    imagePath={category.heroImage}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    width={200}
                    height={250}
                  />
                </div>

                {/* Text */}
                <div className="p-3 text-center">
                  <h3 className="text-gray-800 dark:text-gray-200 text-sm font-semibold tracking-wide truncate">
                    {category.name}
                  </h3>
                </div>
              </ReactRouterDOM.Link>
            </EditableWrapper>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryShowcase;