import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import SupabaseImage from '../shared/SupabaseImage';
import { BUCKETS } from '../../constants';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface SimilarProductCardProps {
  product: Product;
  onNavigate: () => void;
}

const SimilarProductCard: React.FC<SimilarProductCardProps> = ({ product, onNavigate }) => {
  const discountPercentage = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={onNavigate}
      className="group relative block bg-white border border-gray-100 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-200"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <SupabaseImage
          bucket={BUCKETS.PRODUCTS}
          imagePath={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          width={280}
          height={373}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
            {discountPercentage}% OFF
          </div>
        )}

        {/* View Action Button */}
        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="bg-white text-primary p-2.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
            <ArrowRightIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          {/* Optional category or short styling could go here */}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
            )}
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SimilarProductCard;