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
      <div className="group relative block bg-white rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="block cursor-pointer">
          <div className="relative bg-gray-200 aspect-[3/4]">
            <SupabaseImage
              ref={imageRef}
              bucket={BUCKETS.PRODUCTS}
              imagePath={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              width={400}
              height={533}
            />
            {currentUser?.role === 'admin' && (
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-mono z-10 shadow">
                  PID: {product.uuid.substring(0, 8).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Gradient Overlay and Text */}
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-2 sm:p-3 md:p-4 flex flex-col justify-end">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-pink-200 transition-colors">{product.name}</h3>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-base sm:text-lg font-bold text-white">₹{product.price}</p>
              <p className="text-xs sm:text-sm text-gray-300 line-through">₹{product.mrp}</p>
            </div>
          </div>
        </ReactRouterDOM.Link>
        
        {/* Discount Tag */}
        {discount > 0 && (
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg z-10 pointer-events-none">
                {discount}% OFF
            </div>
        )}

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          className="absolute top-14 right-2 z-20 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Add to cart"
        >
          <CartIcon className="w-5 h-5" />
        </button>
      </div>
    </EditableWrapper>
  );
};

export default NewArrivalCard;