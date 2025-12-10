
import React, { useMemo, useState, useEffect } from 'react';
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
    const { currentUser, getAllPromotions, openReviewModal, products, userCancelOrder, showConfirmationModal, getOrderById } = useAppContext();

    const order = getOrderById(id);
    const [liveOrder, setLiveOrder] = useState(order);

    useEffect(() => {
        setLiveOrder(order);
    }, [order]);

    useEffect(() => {
        if (!id) return;

        const channel = supabase
            .channel(`order-${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${id}`,
                },
                (payload) => {
                    console.log('Order update received:', payload);
                    setLiveOrder(prev => ({ ...prev, ...payload.new } as any));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const suggestedProducts = useMemo(() => {
        if (!liveOrder) return [];
        const orderProductIds = new Set(liveOrder.items.map((item: any) => item.product?.id || item.productId));
        return products.filter(p => !orderProductIds.has(p.id)).slice(0, 4);
    }, [products, liveOrder]);

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

    const appliedPromotion = getAllPromotions().find(p => p.code === order.promotionCode);

    const subtotal = order.items.reduce((acc, item) => {
        const price = item.product?.price || (item as any).price || 0;
        return acc + price * item.quantity;
    }, 0);
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
                            {order.items.map(item => {
                                // Handle both nested 'product' (CartItem) and flat structure (Saved Order Item)
                                const productId = item.product?.id || (item as any).productId;
                                const productName = item.product?.name || (item as any).name;
                                const productImage = item.product?.images?.[0] || (item as any).image;
                                const productPrice = item.product?.price || (item as any).price;

                                return (
                                    <div key={item.id} className="py-4">
                                        <div className="flex items-start gap-4">
                                            <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={productImage} alt={productName} className="w-20 h-28 object-cover rounded-md flex-shrink-0" />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-800">{productName}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800">₹{productPrice * item.quantity}</p>
                                        </div>
                                        <div className="mt-4 pl-24 flex gap-4">
                                            {/* Only show review button if product object is reconstructable or present */}
                                            {order.currentStatus === 'Delivered' && (
                                                <button
                                                    onClick={() => {
                                                        const productForReview = item.product || {
                                                            id: productId,
                                                            name: productName,
                                                            images: [productImage],
                                                            price: productPrice
                                                        } as any;
                                                        openReviewModal(productForReview);
                                                    }}
                                                    className="text-sm font-semibold text-primary border border-primary/50 rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors"
                                                >
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
                                );
                            })}
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
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                {isDownloading ? 'Downloading...' : 'Invoice'}
                            </button>
                        )}

                        <Link to={`/help-and-returns/${order.id}`} className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50">
                            <QuestionMarkCircleIcon className="w-5 h-5" />
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
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
                                <Link to="/products" className="text-sm font-medium text-primary hover:text-pink-700 transition-colors">
                                    View All
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {suggestedProducts.map(product => (
                                    <Link key={product.id} to={`/product/${product.id}`} className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                                        <div className="aspect-[4/5] overflow-hidden relative bg-gray-50">
                                            <SupabaseImage
                                                bucket={BUCKETS.PRODUCTS}
                                                imagePath={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-white text-xs font-medium text-center">View Details</p>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
                                                {product.compareAtPrice && (
                                                    <p className="text-xs text-gray-400 line-through">₹{product.compareAtPrice}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
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
