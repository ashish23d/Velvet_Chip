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

  // Calculate reviews for this product
  const { reviews } = useAppContext();
  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'approved');
  const reviewCount = productReviews.length;
  // Use dynamic rating if available, otherwise fallback to product.rating for safety (though it should be dynamic ideally)
  const displayRating = reviewCount > 0
    ? Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
    : product.rating;


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
      console.warn("Product has no selectable size or color.");
    }
  };

  // Modern, cleaner, and "wider" feel card
  return (
    <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
      <div className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="block flex-grow">
          {/* Image Container - Aspect Ratio adjusted for a wider feel */}
          <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700 overflow-hidden">

            {/* Discount Badge */}
            {product.mrp > product.price && (
              <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
              </div>
            )}

            <SupabaseImage
              ref={imageRef}
              bucket={BUCKETS.PRODUCTS}
              imagePath={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              width={400}
              height={500}
            />

            {/* Action Buttons Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={handleWishlistClick}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 text-primary hover:text-pink-600 hover:bg-white transition-all duration-300 shadow-sm"
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <WishlistIcon className="w-5 h-5" isFilled={inWishlist} />
              </button>
              <button
                onClick={handleSaveClick}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 text-primary hover:text-pink-600 hover:bg-white transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                aria-label={isSaved ? 'Remove from saved items' : 'Save for later'}
              >
                <BookmarkIcon className="w-5 h-5" isFilled={isSaved} />
              </button>
            </div>

          </div>

          <div className="p-4 flex flex-col gap-1">
            {/* Category - Optional, if product has category name available, otherwise Brand or nothing */}
            {/* <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Category</p> */}

            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate" title={product.name}>
              {product.name}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Rating rating={displayRating} maxRating={1} /> {/* Show 1 star with number */}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayRating}</span>
                <span className="text-xs text-gray-400">({reviewCount})</span>
              </div>
            </div>
          </div>
        </ReactRouterDOM.Link>

        <div className="px-4 pb-4 pt-0 mt-auto">
          <button
            onClick={handleAddToCart}
            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div >
    </EditableWrapper >
  );
};

export default ProductCard;