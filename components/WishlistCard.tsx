import React, { useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import XIcon from './icons/XIcon.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { BUCKETS } from '../constants.ts';

interface WishlistCardProps {
  product: Product;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ product }) => {
  const { currentUser, toggleWishlist, addToCart, triggerFlyToCartAnimation } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const imageRef = useRef<HTMLImageElement>(null);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleMoveToBag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    if (product.sizes.length > 0 && product.colors.length > 0 && imageRef.current) {
      triggerFlyToCartAnimation(product, imageRef.current);
      addToCart(product, product.sizes[0], product.colors[0]);
      toggleWishlist(product); // Also remove from wishlist
    } else {
      console.warn("Product has no selectable size or color for moving to bag.");
    }
  };

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
      <div className="flex bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Image */}
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="relative w-1/3 flex-shrink-0">
          <SupabaseImage
            ref={imageRef}
            bucket={BUCKETS.PRODUCTS}
            imagePath={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
            width={200}
            height={266}
          />
          <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono z-10 shadow">
            PID: {product.uuid.substring(0, 8).toUpperCase()}
          </div>
        </ReactRouterDOM.Link>
        
        {/* Details */}
        <div className="w-2/3 p-3 flex flex-col justify-between relative">
          <div>
            <ReactRouterDOM.Link to={`/product/${product.id}`} className="block pr-6">
              <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">{product.name}</h3>
            </ReactRouterDOM.Link>
            <div className="flex items-baseline flex-wrap gap-x-2 mt-2">
              <p className="font-bold text-md text-gray-900">₹{product.price}</p>
              <p className="text-xs text-gray-400 line-through">₹{product.mrp}</p>
              {discount > 0 && (
                  <p className="text-xs font-semibold text-green-600">({discount}% OFF)</p>
              )}
            </div>
          </div>
      
          <button 
            onClick={handleRemove} 
            className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"
            aria-label="Remove from wishlist"
          >
            <XIcon className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleMoveToBag} 
            className="mt-3 w-full bg-white text-primary border border-primary/80 text-sm font-semibold py-2 rounded-md hover:bg-primary hover:text-white transition-all duration-300"
          >
            Move to Bag
          </button>
        </div>
      </div>
    </EditableWrapper>
  );
};

export default WishlistCard;