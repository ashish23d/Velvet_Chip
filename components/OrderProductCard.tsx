import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem, Order } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';
import StarRatingInput from './StarRatingInput.tsx';

interface OrderProductCardProps {
    item: CartItem;
    order: Order;
}

const OrderProductCard: React.FC<OrderProductCardProps> = ({ item, order }) => {
    const { product } = item;
    const { openReviewModal } = useAppContext();
    const [rating, setRating] = React.useState(0);

    const getStatusStyles = () => {
        switch (order.currentStatus) {
            case 'Delivered':
                return { text: 'Delivered on', color: 'text-green-600' };
            case 'Shipped':
            case 'Out for Delivery':
                return { text: 'Expected by', color: 'text-blue-600' };
            case 'Processing':
                return { text: 'Order Placed', color: 'text-yellow-600' };
            case 'Cancelled':
            case 'Cancelled by User':
                return { text: 'Cancelled on', color: 'text-red-600' };
            default:
                return { text: 'Status Updated', color: 'text-gray-600' };
        }
    };

    const statusStyle = getStatusStyles();
    const latestStatusUpdate = order.statusHistory[order.statusHistory.length - 1];
    const displayDate = new Date(latestStatusUpdate.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to={`/order/${order.id}`} className="sm:w-28 flex-shrink-0">
                    <SupabaseImage
                        bucket={BUCKETS.PRODUCTS}
                        imagePath={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 sm:h-36 object-cover rounded-md"
                    />
                </Link>
                <div className="flex-grow">
                    <Link to={`/order/${order.id}`}>
                        <p className={`text-sm font-bold ${statusStyle.color}`}>
                            {statusStyle.text} {displayDate}
                        </p>
                        <h3 className="font-semibold text-gray-800 mt-1 hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Qty: {item.quantity} | Size: {item.selectedSize}
                        </p>
                    </Link>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0">
                     <Link to={`/order/${order.id}`} className="text-sm font-semibold text-primary border border-primary/50 rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors">
                        View Order
                    </Link>
                </div>
            </div>
            {order.currentStatus === 'Delivered' && (
                <div className="mt-4 pt-4 border-t border-dashed">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Rate this product</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <StarRatingInput rating={rating} setRating={setRating} />
                        <button
                            onClick={() => openReviewModal(product)}
                            className="w-full sm:w-auto text-sm font-semibold text-primary hover:underline"
                        >
                            Write a Review
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderProductCard;
