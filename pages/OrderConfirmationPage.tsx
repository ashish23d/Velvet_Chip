
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import CheckCircleIcon from '../components/icons/CheckCircleIcon.tsx';
import SupabaseImage from '../components/shared/SupabaseImage';
import { BUCKETS } from '../constants.ts';
import { useUserOrders } from '../services/api/user.api.ts';

const OrderConfirmationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAppContext();
    const { data: userOrders = [] } = useUserOrders(currentUser?.id);
    const navigate = useNavigate();
    const [countdown, setCountdown] = React.useState(5);

    React.useEffect(() => {
        if (!id) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate(`/order/${id}`);
        }
    }, [countdown, navigate, id]);

    const order = userOrders.find(o => o.id === id);

    if (!order) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
                <p className="text-gray-600 mt-2">We couldn't find the order you're looking for.</p>
                <Link to="/" className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700">Go to Homepage</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center border-t-4 border-primary">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-4">Thank you for your order!</h1>
                    <p className="text-gray-600 mt-2">
                        Your order <span className="font-semibold text-primary">#{order.id}</span> has been placed successfully.
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        An email confirmation has been sent to {currentUser?.email}.
                    </p>
                    <p className="text-primary font-medium text-sm mt-4 animate-pulse">
                        Redirecting to order details in {countdown}s...
                    </p>

                    <div className="text-left mt-8 border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            {order.items.map(item => {
                                // Handle both nested 'product' (CartItem) and flat structure (Saved Order Item)
                                const productName = item.product?.name || (item as any).name;
                                const productImage = item.product?.images?.[0] || (item as any).image;
                                const productPrice = item.product?.price || (item as any).price;

                                return (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <SupabaseImage
                                            bucket={BUCKETS.PRODUCTS}
                                            imagePath={productImage}
                                            alt={productName}
                                            className="w-16 h-20 object-cover rounded-md flex-shrink-0"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-gray-800">{productName}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">₹{productPrice * item.quantity}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base text-gray-900">
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link to={`/order/${order.id}`} className="bg-gray-100 text-gray-800 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors">
                            View Order Details Now
                        </Link>
                        <Link to="/" className="bg-primary text-white py-3 px-6 rounded-full font-medium hover:bg-pink-700 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
