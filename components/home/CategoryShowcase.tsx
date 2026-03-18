import React, { useRef, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import SupabaseImage from '../shared/SupabaseImage';
import EditableWrapper from '../shared/EditableWrapper';
import { BUCKETS } from '../../constants';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';

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
    <div className="relative group/container w-full py-8">
      {/* Navigation Arrows */}
      <button
        onClick={() => scroll('left')}
        className={`absolute top-1/2 -left-2 sm:-left-5 z-10 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-full shadow-xl text-primary border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-110 disabled:opacity-0 ${showLeftArrow ? 'opacity-0 group-hover/container:opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className={`absolute top-1/2 -right-2 sm:-right-5 z-10 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-full shadow-xl text-primary border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-110 ${showRightArrow ? 'opacity-0 group-hover/container:opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="category-showcase-grid overflow-x-auto pb-6 -mx-4 px-4 scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{
          display: 'grid',
          gridTemplateRows: 'repeat(1, 1fr)', // Changed to 1 row for larger cards to look cleaner
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(200px, 1fr)', // Wider cards
          gap: '1.5rem',
        }}
      >
        <style>{`
            /* Responsive Grid adjustments */
            @media (max-width: 640px) {
                .category-showcase-grid {
                    grid-template-rows: repeat(2, 1fr) !important; /* 2 rows on mobile */
                    grid-auto-columns: minmax(140px, 1fr) !important;
                    gap: 1rem !important;
                }
            }
        `}</style>

        {categories.map((category) => (
          <div key={category.id} className="flex-shrink-0 snap-start h-full">
            <EditableWrapper editUrl={`/admin/categories/edit/${category.id}`}>
              <ReactRouterDOM.Link
                to={`/category/${category.id}`}
                className="group relative block w-full aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Full Background Image */}
                <SupabaseImage
                  bucket={BUCKETS.CATEGORIES}
                  imagePath={category.heroImage}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width={400}
                  height={533}
                />

                {/* Modern Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-75" />

                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end items-center text-center">
                  <h3 className="text-white text-lg sm:text-xl font-bold tracking-wide transform transition-transform duration-300 group-hover:-translate-y-2 drop-shadow-md">
                    {category.name}
                  </h3>
                  <span className="opacity-0 group-hover:opacity-100 text-white/90 text-xs font-medium uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Explore
                  </span>
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