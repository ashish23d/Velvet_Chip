import React, { useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import Rating from './Rating.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';
import BookmarkIcon from './icons/BookmarkIcon.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { BUCKETS } from '../constants.ts';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { currentUser, addToCart, toggleWishlist, isProductInWishlist, toggleSavedItem, isProductSaved, triggerFlyToCartAnimation } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const imageRef = useRef<HTMLImageElement>(null);

  const inWishlist = isProductInWishlist(product.id);
  const isSaved = isProductSaved(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    toggleWishlist(product);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    toggleSavedItem(product);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    if (product.sizes.length > 0 && product.colors.length > 0 && imageRef.current) {
      triggerFlyToCartAnimation(product, imageRef.current);
      addToCart(product, product.sizes[0], product.colors[0]);
    } else {
      // Handle case with no options, maybe show a message
      console.warn("Product has no selectable size or color.");
    }
  };


  return (
    <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
      <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="block">
          <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
            <SupabaseImage
              ref={imageRef}
              bucket={BUCKETS.PRODUCTS}
              imagePath={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              width={400}
              height={533}
            />
          </div>
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 bg-white dark:bg-gray-700 rounded-full p-2 text-primary transition-colors duration-300 hover:bg-pink-50 dark:hover:bg-gray-600 shadow-md"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <WishlistIcon className="w-6 h-6" isFilled={inWishlist} />
          </button>
          <button
            onClick={handleSaveClick}
            className="absolute top-14 right-3 bg-white dark:bg-gray-700 rounded-full p-2 text-primary transition-all duration-300 hover:bg-pink-50 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 shadow-md"
            aria-label={isSaved ? 'Remove from saved items' : 'Save for later'}
          >
            <BookmarkIcon className="w-6 h-6" isFilled={isSaved} />
          </button>
          <div className="p-4 space-y-2">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">{product.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</p>
                {product.mrp > product.price && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-500 line-through">₹{product.mrp}</p>
                    <p className="text-xs font-bold text-green-600">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </p>
                  </>
                )}
              </div>
              <Rating rating={product.rating} />
            </div>
          </div>
        </ReactRouterDOM.Link>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div >
    </EditableWrapper >
  );
};

export default ProductCard;