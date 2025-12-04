import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types.ts';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';

interface SimilarProductCardProps {
  product: Product;
  onNavigate: () => void;
}

const SimilarProductCard: React.FC<SimilarProductCardProps> = ({ product, onNavigate }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      onClick={onNavigate}
      className="group block bg-gray-50 rounded-lg overflow-hidden h-full flex flex-col transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[3/4] bg-gray-200">
        <SupabaseImage
          bucket={BUCKETS.PRODUCTS}
          imagePath={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          width={240}
          height={320}
        />
      </div>
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 h-8">{product.description}</p>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <p className="text-md font-bold text-gray-900">₹{product.price}</p>
          <p className="text-xs text-gray-500 line-through">₹{product.mrp}</p>
        </div>
      </div>
    </Link>
  );
};

export default SimilarProductCard;