
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import OrderTracker from '../components/OrderTracker.tsx';
import SupabaseImage from '../components/SupabaseImage.tsx';
import MapPinIcon from '../components/icons/MapPinIcon.tsx';
import { BUCKETS } from '../constants.ts';

const TrackOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getOrderById } = useAppContext();
    const order = getOrderById(id);

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
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                        Track Order
                    </h1>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-primary">#{order.id}</span></p>
                </div>
                <Link to="/profile" className="text-sm font-medium text-primary hover:underline">&larr; Back to My Orders</Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
                {/* Main tracking info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Courier Info Card */}
                    {order.trackingId && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Shipped via</p>
                                <p className="text-lg font-bold text-gray-800">{order.courierName || 'Courier Partner'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Tracking ID (AWB)</p>
                                <p className="text-lg font-mono font-medium text-gray-800">{order.trackingId}</p>
                            </div>
                        </div>
                    )}

                    <OrderTracker statusHistory={order.statusHistory} currentStatus={order.currentStatus} />
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
                           Shipping To
                        </h3>
                        <div className="text-sm text-gray-600 flex items-start gap-3">
                           <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                           <div>
                                <p className="font-semibold text-gray-800">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address}, {order.shippingAddress.locality}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                           </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
                           Order Items ({order.items.length})
                        </h3>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <SupabaseImage
                                        bucket={BUCKETS.PRODUCTS}
                                        imagePath={item.product.images[0]} 
                                        alt={item.product.name} 
                                        className="w-16 h-20 object-cover rounded-md flex-shrink-0"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm text-gray-800 line-clamp-2">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">₹{item.product.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                         <div className="mt-4 border-t pt-4 flex justify-between font-bold text-base text-gray-900">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrderPage;
