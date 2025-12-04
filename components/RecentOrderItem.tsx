
import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem, Order, OrderStatus } from '../types.ts';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';

interface RecentOrderItemProps {
  item: CartItem;
  order: Order;
}

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const styles: Record<OrderStatus, string> = {
        Delivered: 'bg-green-100 text-green-800',
        Shipped: 'bg-blue-100 text-blue-800',
        'In Transit': 'bg-blue-100 text-blue-800',
        'Out for Delivery': 'bg-blue-100 text-blue-800',
        Processing: 'bg-yellow-100 text-yellow-800',
        Cancelled: 'bg-red-100 text-red-800',
        'Cancelled by User': 'bg-red-100 text-red-800',
        'Return Requested': 'bg-purple-100 text-purple-800',
        'Return Approved': 'bg-purple-100 text-purple-800',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
            {status}
        </span>
    );
};

const RecentOrderItem: React.FC<RecentOrderItemProps> = ({ item, order }) => {
  const { product } = item;

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-b-0 border-gray-200">
      <Link to={`/product/${product.id}`} className="flex-shrink-0">
        <SupabaseImage
          bucket={BUCKETS.PRODUCTS}
          imagePath={product.images[0]}
          alt={product.name}
          className="w-16 h-20 object-cover rounded-md"
        />
      </Link>
      <div className="flex-grow min-w-0">
        <Link to={`/product/${product.id}`} className="font-semibold text-gray-800 hover:text-primary text-sm line-clamp-2">{product.name}</Link>
        <div className="mt-1">
            <StatusBadge status={order.currentStatus} />
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <Link
          to={`/track-order/${order.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Track Order
        </Link>
         <Link
          to={`/product/${product.id}`}
          className="block text-xs text-gray-500 hover:underline mt-1"
        >
          View Product
        </Link>
      </div>
    </div>
  );
};

export default RecentOrderItem;
