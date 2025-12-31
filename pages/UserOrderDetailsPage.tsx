
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import OrderTracker from '../components/OrderTracker.tsx';
import SupabaseImage from '../components/SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';
import {
    ArrowDownTrayIcon,
    QuestionMarkCircleIcon,
    MapPinIcon,
    CreditCardIcon,
    ChevronLeftIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import HelpModal from '../components/HelpModal.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { CartItem } from '../types.ts';

const UserOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const {
        currentUser,
        getAllPromotions,
        openReviewModal,
        products,
        userCancelOrder,
        showConfirmationModal,
        getOrderById,
        isLoading,
        contactDetails
    } = useAppContext();

    const order = getOrderById(id);
    const [liveOrder, setLiveOrder] = useState(order);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        setLiveOrder(order);
    }, [order]);

    useEffect(() => {
        if (!id) return;

        // Fallback: If order is not found in context (e.g. direct link or refresh), fetch it directly
        const fetchOrderDirectly = async () => {
            if (!order && !isLoading) {
                setIsLoadingDetails(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, items(*, product:products(*))') // Fetch nested items and products
                    .eq('id', id)
                    .single();

                if (data) {
                    setLiveOrder(data);
                }
                setIsLoadingDetails(false);
            }
        };

        fetchOrderDirectly();

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
    }, [id, order, isLoading]);

    const suggestedProducts = useMemo(() => {
        if (!liveOrder) return [];
        const orderProductIds = new Set(liveOrder.items.map((item: any) => item.product?.id || item.productId));
        return products.filter(p => !orderProductIds.has(p.id)).slice(0, 4);
    }, [products, liveOrder]);

    const handleCancel = async () => {
        if (!liveOrder) return;
        showConfirmationModal({
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? This cannot be undone.',
            onConfirm: async () => {
                try {
                    await userCancelOrder(liveOrder.id);
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
        if (!liveOrder || !liveOrder.downloadable_invoice_url) return;

        setIsDownloading(true);
        try {
            const { data, error } = await supabase.storage
                .from(BUCKETS.SITE_ASSETS)
                .download(liveOrder.downloadable_invoice_url);

            if (error || !data) {
                throw new Error('Could not download invoice file.');
            }

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const invoiceNum = liveOrder.invoice_number || liveOrder.id;
            link.setAttribute('download', `Invoice-${invoiceNum}.pdf`);
            document.body.appendChild(link);
            link.click();

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
        if (!liveOrder || liveOrder.currentStatus !== 'Delivered') return false;
        const deliveredStatus = liveOrder.statusHistory.find((s: any) => s.status === 'Delivered');
        if (!deliveredStatus) return false;

        const deliveryDate = new Date(deliveredStatus.timestamp);
        const sevenDaysAfterDelivery = new Date(deliveryDate);
        sevenDaysAfterDelivery.setDate(deliveryDate.getDate() + 7);

        const hasReturnRequest = currentUser?.returns?.some(r => r.order_id === liveOrder.id && r.item_id === item.id);

        return new Date() < sevenDaysAfterDelivery && !hasReturnRequest;
    };

    if (isLoading || isLoadingDetails) {
        return (
            <div className="container mx-auto px-4 py-20 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-32 bg-gray-200 rounded-xl"></div>
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="h-48 bg-gray-200 rounded-xl"></div>
                        <div className="h-48 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!liveOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-md text-center">
                    We couldn't locate this order. Please check the ID or return to your orders list.
                </p>
                <Link to="/profile" className="bg-primary text-white py-3 px-8 rounded-full font-medium hover:bg-pink-700 transition-colors shadow-lg shadow-primary/20">
                    Go to My Orders
                </Link>
            </div>
        );
    }

    const appliedPromotion = getAllPromotions().find(p => p.code === liveOrder.promotionCode);

    const subtotal = liveOrder.items.reduce((acc: any, item: any) => {
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

    const statusColors = {
        'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
        'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
        'Delivered': 'bg-green-100 text-green-800 border-green-200',
        'Cancelled': 'bg-red-100 text-red-800 border-red-200',
        'Cancelled by User': 'bg-red-100 text-red-800 border-red-200',
        'Refunded': 'bg-gray-100 text-gray-800 border-gray-200',
        'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/profile" className="flex items-center text-gray-600 hover:text-primary transition-colors font-medium">
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Orders
                        </Link>
                        <div className="text-sm text-gray-500">
                            Order ID: <span className="font-mono font-medium text-gray-900">#{liveOrder.id.split('-')[0]}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
                                Order Details
                            </h1>
                            <p className="text-gray-500">
                                Placed on {new Date(liveOrder.orderDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[liveOrder.currentStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                                {liveOrder.currentStatus}
                            </div>
                            {liveOrder.currentStatus === 'Delivered' && liveOrder.downloadable_invoice_url && (
                                <button
                                    onClick={handleDownloadInvoice}
                                    disabled={isDownloading}
                                    className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    {isDownloading ? 'Downloading...' : 'Invoice'}
                                </button>
                            )}
                            {['Processing', 'Pending'].includes(liveOrder.currentStatus) && (
                                <button onClick={handleCancel} className="flex items-center gap-2 bg-white text-red-600 border border-red-200 py-2 px-4 rounded-full text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all shadow-sm">
                                    Cancel Order
                                </button>
                            )}
                            <button
                                onClick={() => setIsHelpOpen(true)}
                                className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <QuestionMarkCircleIcon className="w-4 h-4" />
                                Help
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-8">
                        <OrderTracker statusHistory={liveOrder.statusHistory || []} currentStatus={liveOrder.currentStatus} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">Items inside this order</h3>
                                <span className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-500 border border-gray-200">{liveOrder.items.length} items</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {liveOrder.items.map((item: any) => {
                                    const productName = item.product?.name || (item as any).name || 'Unknown Product';
                                    const productImage = item.product?.images?.[0] || (item as any).image;
                                    const productPrice = item.product?.price || (item as any).price || 0;

                                    return (
                                        <div key={item.id} className="p-6 hover:bg-blue-50/10 transition-colors">
                                            <div className="flex gap-4 sm:gap-6">
                                                <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                    {productImage ? (
                                                        <SupabaseImage
                                                            bucket={BUCKETS.PRODUCTS}
                                                            imagePath={productImage}
                                                            alt={productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 text-lg leading-tight mb-1">
                                                                <Link to={`/product/${item.product?.id || (item as any).productId}`} className="hover:text-primary transition-colors">
                                                                    {productName}
                                                                </Link>
                                                            </h4>
                                                            <div className="text-sm text-gray-500 space-y-1">
                                                                {item.selectedSize && <p>Size: <span className="font-medium text-gray-700">{item.selectedSize}</span></p>}
                                                                {item.selectedColor && (
                                                                    <p className="flex items-center gap-2">
                                                                        Color:
                                                                        <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor.hex }}></span>
                                                                        <span className="font-medium text-gray-700">{item.selectedColor.name}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {item.customization && (
                                                                <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-3 rounded-md border border-yellow-100 max-w-md">
                                                                    <span className="font-semibold text-yellow-800 block mb-1">Customization:</span>
                                                                    {item.customization}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right mt-2 sm:mt-0">
                                                            <p className="font-bold text-gray-900 text-lg">₹{(productPrice * item.quantity).toLocaleString()}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity} &times; ₹{productPrice}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-50">
                                                        {liveOrder.currentStatus === 'Delivered' && (
                                                            <button
                                                                onClick={() => {
                                                                    const productForReview = item.product || {
                                                                        id: item.product?.id || (item as any).productId,
                                                                        name: productName,
                                                                        images: [productImage],
                                                                        price: productPrice,
                                                                        category: 'Uncategorized'
                                                                    } as any;
                                                                    openReviewModal(productForReview);
                                                                }}
                                                                className="text-xs font-semibold text-primary bg-primary/5 hover:bg-primary hover:text-white border border-primary/20 px-4 py-2 rounded-lg transition-all"
                                                            >
                                                                Write a Review
                                                            </button>
                                                        )}
                                                        {isReturnable(item) && (
                                                            <Link to={`/help-and-returns/${liveOrder.id}/${item.id}`} className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all">
                                                                Return Item
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-green-700 bg-green-50 px-2 py-1 rounded">
                                        <span>Discount ({liveOrder.promotionCode})</span>
                                        <span>- ₹{promoDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-2">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-900 text-base">Total Amount</span>
                                        <span className="font-bold text-gray-900 text-xl">₹{liveOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 text-right mt-1">Inclusive of all taxes</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-400" />
                                Shipping Address
                            </h3>
                            <div className="text-sm text-gray-600">
                                <p className="font-bold text-gray-900 mb-1">{liveOrder.shippingAddress?.name || currentUser?.name}</p>
                                <p className="leading-relaxed">
                                    {liveOrder.shippingAddress?.address}
                                    <br />
                                    {liveOrder.shippingAddress?.city}, {liveOrder.shippingAddress?.state} {liveOrder.shippingAddress?.pincode}
                                </p>
                                <p className="mt-3 pt-3 border-t border-gray-50 text-gray-500">
                                    Phone: <span className="font-medium text-gray-700">{liveOrder.shippingAddress?.mobile || currentUser?.mobile}</span>
                                </p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <CreditCardIcon className="w-4 h-4 text-gray-400" />
                                Payment Method
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded text-gray-600">
                                        {liveOrder.payment?.method === 'COD' ? <span className="font-bold font-mono">COD</span> : <CreditCardIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{liveOrder.payment?.method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                        <p className="text-xs text-gray-500">{liveOrder.payment?.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {suggestedProducts.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">You Might Also Like</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {suggestedProducts.map(product => (
                                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                                        <SupabaseImage
                                            bucket={BUCKETS.PRODUCTS}
                                            imagePath={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-base font-bold text-gray-900 mt-1">₹{product.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                contactDetails={contactDetails}
            />
        </div>
    );
};

export default UserOrderDetailsPage;
