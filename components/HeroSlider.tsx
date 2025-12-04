import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SupabaseMedia from './SupabaseMedia.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { Slide, MediaItem } from '../types.ts';

interface HeroSliderProps {
  slides: Slide[];
  bucket: string;
}

interface FlattenedMediaItem extends MediaItem {
  id: string;
  text: string;
  showText: boolean;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, bucket }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allMedia: FlattenedMediaItem[] = useMemo(() => {
    if (!slides || slides.length === 0) return [];
    return slides.flatMap(slide =>
      (slide.media && slide.media.length > 0 ? slide.media : [{ path: 'awaany_placeholders/hero/default', type: 'image' as const }]).map(mediaItem => ({
        ...mediaItem,
        id: `${slide.id}-${mediaItem.path}`,
        text: slide.text,
        showText: slide.showText,
      }))
    );
  }, [slides]);

  const nextSlide = useCallback(() => {
    if (allMedia.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allMedia.length);
  }, [allMedia.length]);

  const prevSlide = () => {
    if (allMedia.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allMedia.length) % allMedia.length);
  };
  
  const goToSlide = (slideIndex: number) => {
      setCurrentIndex(slideIndex);
  }

  useEffect(() => {
    if (allMedia.length <= 1) return;
    const timer = setInterval(nextSlide, 8000); // Change slide every 8 seconds
    return () => clearInterval(timer);
  }, [allMedia.length, nextSlide]);

  if (allMedia.length === 0) {
    return null;
  }

  return (
    <EditableWrapper editUrl="/admin/appearance">
      <div className="relative group">
        <div 
          className="absolute -inset-2 bg-primary/25 blur-2xl rounded-xl transition-opacity duration-500 ease-in-out group-hover:opacity-70"
          aria-hidden="true"
        ></div>
        
        <div className="relative w-full h-[60vh] overflow-hidden rounded-xl bg-gray-100">
          
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {allMedia.map((item) => (
              <div key={item.id} className="w-full h-full flex-shrink-0 relative">
                <SupabaseMedia
                  bucket={bucket}
                  imagePath={item.path} 
                  alt="Hero image" 
                  className="w-full h-full object-cover" 
                  width={1600}
                  height={900}
                />
                {item.showText && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
                    <h2 className="text-white text-4xl md:text-6xl font-serif text-center max-w-4xl">
                      {item.text}
                    </h2>
                  </div>
                )}
              </div>
            ))}
          </div>

          {allMedia.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-50 focus:outline-none z-10"
                aria-label="Previous slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button 
                onClick={nextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-50 focus:outline-none z-10"
                aria-label="Next slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                {allMedia.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50 hover:bg-white'}`}
                        aria-label={`Go to slide ${slideIndex + 1}`}
                    />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </EditableWrapper>
  );
};

export default HeroSlider;