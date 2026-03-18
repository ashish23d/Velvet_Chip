import React, { useRef, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { SeasonalEditCard } from '../../types';
import SupabaseImage from '../shared/SupabaseImage';
import { useAppContext } from '../../context/AppContext';
import CartIcon from '../icons/CartIcon';
import EditableWrapper from '../shared/EditableWrapper';
import { BUCKETS } from '../../constants';

interface SeasonalCardProps {
  card: SeasonalEditCard;
}

const SeasonalCard: React.FC<SeasonalCardProps> = ({ card }) => {
  const { products, addToCart, triggerFlyToCartAnimation } = useAppContext();
  const imageRef = useRef<HTMLImageElement>(null);
  
  const product = useMemo(() => {
    if (card.card_type === 'product' && card.product_id) {
        return products.find(p => p.id === card.product_id);
    }
    return null;
  }, [card, products]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    const startElement = imageRef.current;

    if (product.sizes.length > 0 && product.colors.length > 0 && startElement) {
      triggerFlyToCartAnimation(product, startElement);
      addToCart(product, product.sizes[0], product.colors[0]);
    } else {
      console.warn("Product has no selectable size or color for quick add.");
    }
  };
  
  const { title, description, imagePath, buttonText, buttonLink } = useMemo(() => {
    if (card.card_type === 'product' && product) {
        return {
            title: product.category.replace('-', ' '),
            description: product.description,
            imagePath: product.images[0],
            buttonText: card.button_text || 'Explore Now',
            buttonLink: `/product/${product.id}`,
        };
    }
    // Custom card
    return {
        title: card.title,
        description: card.description,
        imagePath: card.image_path,
        buttonText: card.button_text,
        buttonLink: card.button_link,
    };
  }, [card, product]);
  
  const cardTitle = card.card_type === 'product' && product ? product.name : title;
  const imageBucket = card.card_type === 'product' ? BUCKETS.PRODUCTS : BUCKETS.SITE_ASSETS;

  if (!imagePath) return null; // Don't render if there's no image

  return (
    <EditableWrapper editUrl={`/admin/content`}>
      <div className="group bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-2 max-w-5xl mx-auto">
        <div className={`flex flex-col md:flex-row ${card.reverse_layout ? 'md:flex-row-reverse' : ''}`}>
          
          <div className="relative w-full md:w-1/2 overflow-hidden">
            <ReactRouterDOM.Link to={buttonLink || '#'} className="block aspect-[3/4] md:aspect-auto">
              <SupabaseImage
                ref={imageRef}
                bucket={imageBucket} 
                imagePath={imagePath} 
                alt={cardTitle || 'Seasonal promotion'} 
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
            </ReactRouterDOM.Link>
          </div>
          
          <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-center transition-colors duration-500 ease-in-out group-hover:bg-gray-50/50">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold">{title}</p>
            
            <h3 className="text-lg sm:text-2xl font-serif text-gray-900 mt-1 sm:mt-2 line-clamp-2 transition-colors duration-300 group-hover:text-primary">{cardTitle}</h3>
            
            <p className="text-gray-600 mt-2 sm:mt-3 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 transition-colors duration-300 group-hover:text-gray-800">{description}</p>
            
            <div className="mt-4 sm:mt-6 flex items-center space-x-4">
              <ReactRouterDOM.Link 
                to={buttonLink || '#'} 
                className="inline-flex items-center bg-primary text-white py-2 px-4 sm:px-6 rounded-full self-start text-xs sm:text-sm font-medium hover:bg-pink-700 transition-all duration-300"
              >
                <span>{buttonText}</span>
                <span className="ml-0 opacity-0 transform transition-all duration-300 group-hover:ml-2 group-hover:opacity-100">&rarr;</span>
              </ReactRouterDOM.Link>

              {card.card_type === 'product' && (
                  <button
                      onClick={handleAddToCart}
                      className="p-3 bg-white border border-primary/50 text-primary rounded-full opacity-0 transform scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:shadow-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      aria-label="Add to cart"
                  >
                      <CartIcon className="w-5 h-5"/>
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </EditableWrapper>
  );
};

export default SeasonalCard;