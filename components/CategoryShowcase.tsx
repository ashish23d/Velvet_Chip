import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { BUCKETS } from '../constants.ts';

const CategoryShowcase: React.FC = () => {
  const { categories } = useAppContext();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {categories.map((category) => (
        <EditableWrapper key={category.id} editUrl={`/admin/categories/edit/${category.id}`}>
          <ReactRouterDOM.Link
            to={`/category/${category.id}`}
            className="group relative block aspect-[3/4] rounded-xl overflow-hidden shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5"
          >
            {/* Image */}
            <SupabaseImage
              bucket={BUCKETS.CATEGORIES}
              imagePath={category.heroImage}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              width={300}
              height={400}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 transform group-hover:-translate-y-1">
              <h3 className="text-white text-md lg:text-lg font-semibold tracking-wide text-center drop-shadow-md">
                {category.name}
              </h3>
            </div>
          </ReactRouterDOM.Link>
        </EditableWrapper>
      ))}
    </div>
  );
};

export default CategoryShowcase;