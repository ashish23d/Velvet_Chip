import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem, Order } from '../../types';
import { useAppContext } from '../../context/AppContext';
import SupabaseImage from '../shared/SupabaseImage';
import { BUCKETS } from '../../constants';
import StarRatingInput from './StarRatingInput';

interface OrderProductCardProps {
    item: CartItem;
    order: Order;
}

const OrderProductCard: React.FC<OrderProductCardProps> = ({ item, order }) => {
    // Handle both nested 'product' (CartItem) and flat structure (Saved Order Item)
    const productId = item.product?.id || (item as any).productId;
    const productName = item.product?.name || (item as any).name;
    const productImage = item.product?.images?.[0] || (item as any).image;

    const { openReviewModal, reviews, currentUser, deleteReview } = useAppContext();
    const [rating, setRating] = React.useState(0);

    const existingReview = React.useMemo(() => {
        if (!currentUser || !productId) return null;
        return reviews.find(r => r.productId === Number(productId) && r.userId === currentUser.id);
    }, [reviews, currentUser, productId]);

    React.useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
        }
    }, [existingReview]);

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
    // Default to a safe date if statusHistory is empty or undefined
    const latestStatusUpdate = order.statusHistory?.length > 0
        ? order.statusHistory[order.statusHistory.length - 1]
        : { timestamp: new Date().toISOString() };

    const displayDate = new Date(latestStatusUpdate.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!productId) return null; // Safety check

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to={`/order/${order.id}`} className="sm:w-28 flex-shrink-0">
                    <SupabaseImage
                        bucket={BUCKETS.PRODUCTS}
                        imagePath={productImage}
                        alt={productName}
                        className="w-full h-40 sm:h-36 object-cover rounded-md"
                    />
                </Link>
                <div className="flex-grow">
                    <Link to={`/order/${order.id}`}>
                        <p className={`text-sm font-bold ${statusStyle.color}`}>
                            {statusStyle.text} {displayDate}
                        </p>
                        <h3 className="font-semibold text-gray-800 mt-1 hover:text-primary transition-colors">{productName}</h3>
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
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {existingReview ? 'Your Review' : 'Rate this product'}
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <StarRatingInput rating={rating} setRating={setRating} readOnly={!!existingReview} />

                        {existingReview ? (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        const productForReview = item.product || {
                                            id: (item as any).productId,
                                            name: (item as any).name,
                                            images: [(item as any).image],
                                            price: (item as any).price,
                                            category: 'Uncategorized'
                                        } as any;
                                        // Pass existing review data via the product object or separate logic
                                        // We attach it to the product object for now as a quick context pass
                                        const productWithReview = { ...productForReview, currentUserReview: existingReview };
                                        openReviewModal(productWithReview);
                                    }}
                                    className="text-sm font-semibold text-indigo-600 hover:underline"
                                >
                                    Edit Review
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete your review?')) {
                                            try {
                                                await deleteReview(existingReview.id);
                                                setRating(0); // Reset local state
                                            } catch (e) {
                                                console.error("Delete failed", e);
                                                alert("Failed to delete review");
                                            }
                                        }
                                    }}
                                    className="text-sm font-semibold text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    const productForReview = item.product || {
                                        id: (item as any).productId,
                                        name: (item as any).name,
                                        images: [(item as any).image],
                                        price: (item as any).price,
                                        category: 'Uncategorized'
                                    } as any;
                                    openReviewModal(productForReview);
                                }}
                                className="w-full sm:w-auto text-sm font-semibold text-primary hover:underline"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderProductCard;
