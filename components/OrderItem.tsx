import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CartItem, OrderStatus } from '../types.ts';
import SupabaseImage from './SupabaseImage.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { BUCKETS } from '../constants.ts';

interface OrderItemProps {
  item: CartItem;
  orderStatus: OrderStatus;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, orderStatus }) => {
  const { product, selectedSize, selectedColor, quantity } = item;
  const { currentUser, reviews, openReviewModal } = useAppContext();

  const hasReviewed = useMemo(() => {
    if (!currentUser) return false;
    return reviews.some(
      review => review.productId === item.product.id && review.userId === currentUser.id
    );
  }, [reviews, item.product.id, currentUser]);
  
  return (
    <div className="flex items-start gap-4 py-4">
      <ReactRouterDOM.Link to={`/product/${product.id}`} className="flex-shrink-0 w-20 h-28">
        <SupabaseImage
          bucket={BUCKETS.PRODUCTS}
          imagePath={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover rounded-md"
          width={80}
          height={112}
        />
      </ReactRouterDOM.Link>
      <div className="flex-grow">
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="font-semibold text-gray-800 hover:text-primary text-sm">{product.name}</ReactRouterDOM.Link>
        <p className="text-xs text-gray-500 mt-1">
            Size: {selectedSize} &middot; Color: {selectedColor.name}
        </p>
        <p className="text-xs text-gray-500">
            Qty: {quantity}
        </p>
        <p className="text-sm font-semibold text-gray-800 mt-2">₹{product.price * quantity}</p>

        {orderStatus === 'Delivered' && (
            <button 
              onClick={() => openReviewModal(product)}
              disabled={hasReviewed}
              className="mt-3 text-xs font-semibold text-primary border border-primary/50 rounded-full px-3 py-1 hover:bg-primary/5 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
            >
                {hasReviewed ? 'Reviewed' : 'Rate & Review Product'}
            </button>
        )}
      </div>
    </div>
  );
};

export default OrderItem;