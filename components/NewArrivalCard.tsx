import React, { useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types.ts';
import SupabaseImage from './SupabaseImage.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import CartIcon from './icons/CartIcon.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { BUCKETS } from '../constants.ts';

interface NewArrivalCardProps {
  product: Product;
}

const NewArrivalCard: React.FC<NewArrivalCardProps> = ({ product }) => {
  const { currentUser, addToCart, triggerFlyToCartAnimation } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const imageRef = useRef<HTMLImageElement>(null);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }

    const startElement = imageRef.current;

    if (product.sizes.length > 0 && product.colors.length > 0 && startElement) {
      triggerFlyToCartAnimation(product, startElement);
      addToCart(product, product.sizes[0], product.colors[0]);
    } else {
      console.warn("Product has no selectable size or color.");
    }
  };

  return (
    <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
      <div className="group relative block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="block cursor-pointer">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
            <SupabaseImage
              ref={imageRef}
              bucket={BUCKETS.PRODUCTS}
              imagePath={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
              width={400}
              height={533}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {/* New Badge - assuming products created within last 7 days are new, or just hardcode for now as it's "New Arrivals" section */}
              <span className="bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm uppercase tracking-wider">
                New
              </span>
              {currentUser?.role === 'admin' && (
                <span className="bg-blue-600/80 text-white text-[10px] font-mono px-2 py-1 rounded-full backdrop-blur-sm shadow-sm">
                  {product.uuid.substring(0, 6)}
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                -{discount}%
              </div>
            )}

            {/* Quick Add Button - Appears on Hover */}
            <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
              <button
                onClick={handleAddToCart}
                className="p-3 bg-white text-primary rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="Add to cart"
                title="Add to Cart"
              >
                <CartIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
              )}
            </div>
          </div>
        </ReactRouterDOM.Link>
      </div>
    </EditableWrapper>
  );
};

export default NewArrivalCard;