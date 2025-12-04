import React, { useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types.ts';
import SupabaseImage from './SupabaseImage.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import CartIcon from './icons/CartIcon.tsx';
import EditableWrapper from './EditableWrapper.tsx';
import { BUCKETS } from '../constants.ts';

interface SpecialProductCardProps {
  product: Product;
  reverseLayout?: boolean;
}

const SpecialProductCard: React.FC<SpecialProductCardProps> = ({ product, reverseLayout = false }) => {
  const { currentUser, addToCart, triggerFlyToCartAnimation } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const imageRef = useRef<HTMLImageElement>(null);

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
      console.warn("Product has no selectable size or color for quick add.");
    }
  };

  return (
    <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
      {/* Added max-w-5xl and mx-auto to constrain width on larger screens and center the card. */}
      <div className="group bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-2 max-w-5xl mx-auto">
        <div className={`flex flex-col md:flex-row ${reverseLayout ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Image container with overflow hidden to clip the scaled image properly */}
          <div className="relative w-full md:w-1/2 overflow-hidden">
            <ReactRouterDOM.Link to={`/product/${product.id}`} className="block aspect-[3/4] md:aspect-auto">
              <SupabaseImage
                ref={imageRef}
                bucket={BUCKETS.PRODUCTS}
                imagePath={product.images[0]} 
                alt={product.name} 
                // Smoother and more pronounced image scaling on hover
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
            </ReactRouterDOM.Link>
            {currentUser?.role === 'admin' && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-mono z-10 shadow">
                PID: {product.uuid.substring(0, 8).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Text container with its own transitions and hover effects */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-center transition-colors duration-500 ease-in-out group-hover:bg-gray-50/50">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold">{product.category.replace('-', ' ')}</p>
            
            {/* Product name now changes color to primary on hover */}
            <h3 className="text-lg sm:text-2xl font-serif text-gray-900 mt-1 sm:mt-2 line-clamp-2 transition-colors duration-300 group-hover:text-primary">{product.name}</h3>
            
            {/* Description text becomes darker for better readability on hover */}
            <p className="text-gray-600 mt-2 sm:mt-3 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 transition-colors duration-300 group-hover:text-gray-800">{product.description}</p>
            
            {/* Action buttons container */}
            <div className="mt-4 sm:mt-6 flex items-center space-x-4">
              <ReactRouterDOM.Link 
                to={`/product/${product.id}`} 
                className="inline-flex items-center bg-primary text-white py-2 px-4 sm:px-6 rounded-full self-start text-xs sm:text-sm font-medium hover:bg-pink-700 transition-all duration-300"
              >
                <span>Explore Now</span>
                <span className="ml-0 opacity-0 transform transition-all duration-300 group-hover:ml-2 group-hover:opacity-100">&rarr;</span>
              </ReactRouterDOM.Link>

              <button
                  onClick={handleAddToCart}
                  className="p-3 bg-white border border-primary/50 text-primary rounded-full opacity-0 transform scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:shadow-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Add to cart"
              >
                  <CartIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </EditableWrapper>
  );
};

export default SpecialProductCard;