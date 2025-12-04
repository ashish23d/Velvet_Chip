
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import OrderTracker from '../components/OrderTracker.tsx';
import SupabaseImage from '../components/SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';
import { ArrowDownTrayIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../services/supabaseClient.ts';
import { CartItem } from '../types.ts';

const UserOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, getAllPromotions, openReviewModal, products, userCancelOrder, showConfirmationModal } = useAppContext();
    
    const order = useMemo(() => currentUser?.orders?.find(o => o.id === id), [currentUser, id]);
    const promotions = getAllPromotions();
    
    const [isDownloading, setIsDownloading] = useState(false);

    const suggestedProducts = useMemo(() => {
        if (!order) return [];
        const orderProductIds = new Set(order.items.map(item => item.product.id));
        return products.filter(p => !orderProductIds.has(p.id)).slice(0, 4);
    }, [products, order]);
    
    const handleCancel = async () => {
        if (!order) return;
        showConfirmationModal({
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? This cannot be undone.',
            onConfirm: async () => {
                try {
                    await userCancelOrder(order.id);
                } catch (error) {
                    console.error("Failed to cancel order:", error);
                    alert("Failed to cancel the order. Please try again.");
                    throw error;
                }
            },
            confirmText: 'Yes, Cancel Order',
            isDestructive: true,
        });
    };
    
    const handleDownloadInvoice = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!order || !order.downloadable_invoice_url) return;

        setIsDownloading(true);
        try {
            const { data, error } = await supabase.storage
                .from(BUCKETS.SITE_ASSETS)
                .download(order.downloadable_invoice_url);
            
            if (error || !data) {
                throw new Error('Could not download invoice file.');
            }

            // Create a blob url and force download
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const invoiceNum = order.invoice_number || order.id;
            link.setAttribute('download', `Invoice-${invoiceNum}.pdf`); // Force download attribute
            document.body.appendChild(link);
            link.click();
            
            // Cleanup with delay to ensure download starts
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (err) {
            console.error("Invoice download failed:", err);
            alert("Failed to download invoice. Please try again later.");
        } finally {
            setIsDownloading(false);
        }
    };

    const isReturnable = (item: CartItem): boolean => {
      if (!order || order.currentStatus !== 'Delivered') return false;
      const deliveredStatus = order.statusHistory.find(s => s.status === 'Delivered');
      if (!deliveredStatus) return false;
      
      const deliveryDate = new Date(deliveredStatus.timestamp);
      const sevenDaysAfterDelivery = new Date(deliveryDate);
      sevenDaysAfterDelivery.setDate(deliveryDate.getDate() + 7);
      
      // Check if item is already returned
      const hasReturnRequest = currentUser?.returns?.some(r => r.order_id === order.id && r.item_id === item.id);

      return new Date() < sevenDaysAfterDelivery && !hasReturnRequest;
    };

    if (!order) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
                <p className="text-gray-600 mt-2">We couldn't find the order you're looking for in your account.</p>
                <Link to="/profile" className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700">Go to My Orders</Link>
            </div>
        );
    }

    const appliedPromotion = promotions.find(p => p.code === order.promotionCode);
    
    const subtotal = order.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = subtotal > 499 ? 0 : 50;
    const promoDiscount = useMemo(() => {
        if (!appliedPromotion) return 0;
        if (appliedPromotion.type === 'percentage') {
            return subtotal * (appliedPromotion.value / 100);
        }
        return appliedPromotion.value;
    }, [appliedPromotion, subtotal]);
    

    const showInvoiceButton = order.currentStatus !== 'Processing' && order.currentStatus !== 'Cancelled' && order.currentStatus !== 'Cancelled by User';

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                        Order Details
                    </h1>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-primary">#{order.id}</span> &middot; Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <Link to="/profile" className="text-sm font-medium text-primary hover:underline">&larr; Back to My Orders</Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
                {/* Main tracking info */}
                <div className="lg:col-span-2 space-y-6">
                    <OrderTracker statusHistory={order.statusHistory} currentStatus={order.currentStatus} />

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Items</h3>
                        <div className="divide-y divide-gray-200">
                            {order.items.map(item => (
                                <div key={item.id} className="py-4">
                                    <div className="flex items-start gap-4">
                                        <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={item.product.images[0]} alt={item.product.name} className="w-20 h-28 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">₹{item.product.price * item.quantity}</p>
                                    </div>
                                    <div className="mt-4 pl-24 flex gap-4">
                                        {order.currentStatus === 'Delivered' && (
                                            <button onClick={() => openReviewModal(item.product)} className="text-sm font-semibold text-primary border border-primary/50 rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors">
                                                Write a Review
                                            </button>
                                        )}
                                        {isReturnable(item) && (
                                            <Link to={`/help-and-returns/${order.id}/${item.id}`} className="text-sm font-semibold text-blue-600 border border-blue-200 rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors">
                                                Request Return
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                     <div className="flex items-center gap-4">
                        {showInvoiceButton && (
                             <button 
                                onClick={handleDownloadInvoice}
                                disabled={isDownloading || !order.downloadable_invoice_url}
                                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                title={!order.downloadable_invoice_url ? "Invoice not generated yet" : "Download Invoice"}
                            >
                                <ArrowDownTrayIcon className="w-5 h-5"/>
                                {isDownloading ? 'Downloading...' : 'Invoice'}
                            </button>
                        )}
                        
                         <Link to={`/help-and-returns/${order.id}`} className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50">
                            <QuestionMarkCircleIcon className="w-5 h-5"/>
                            Need Help?
                        </Link>
                    </div>

                    {order.currentStatus === 'Processing' && (
                         <button onClick={handleCancel} className="w-full bg-red-50 text-red-700 border border-red-200 py-2.5 px-4 rounded-lg font-semibold hover:bg-red-100">
                            Cancel Order
                        </button>
                    )}
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
                           Delivery Details
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p className="font-semibold text-gray-800">{order.shippingAddress.name}</p>
                            <p className="mt-1">{order.shippingAddress.address}, {order.shippingAddress.locality}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            <p className="font-semibold text-gray-800 mt-2">Mobile: {order.shippingAddress.mobile}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
                           Price Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                            {promoDiscount > 0 && (
                                <div className="flex justify-between"><span className="text-green-600">Discount ({order.promotionCode})</span><span className="text-green-600">- ₹{promoDiscount.toLocaleString()}</span></div>
                            )}
                            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>₹{shipping.toLocaleString()}</span></div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between font-bold text-base text-gray-900">
                                <span>Total Amount</span>
                                <span>₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                         <div className="mt-4 pt-4 border-t border-dashed">
                             <Link to="/coupons" className="text-sm font-semibold text-primary hover:underline">See other available coupons &rarr;</Link>
                         </div>
                    </div>
                    
                     {suggestedProducts.length > 0 && (
                        <div className="bg-pink-50 rounded-lg p-6">
                            <h3 className="text-lg font-serif text-center text-primary mb-4">You Might Also Like</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {suggestedProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                                        <Link to={`/product/${product.id}`} className="group">
                                            <div className="aspect-square overflow-hidden">
                                                <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                            </div>
                                            <div className="p-2 text-center">
                                                <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-primary">{product.name}</p>
                                                <p className="text-xs text-gray-600">₹{product.price}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailsPage;
