
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { CartItem, OrderStatus } from '../../types.ts';
import SupabaseImage from '../../components/shared/SupabaseImage';
import { BUCKETS } from '../../constants.ts';
import { EyeIcon, TruckIcon } from '@heroicons/react/24/outline';
import DocumentPreviewModal from '../../components/admin/DocumentPreviewModal.tsx';
import { supabase } from '../../services/supabaseClient.ts';
import { useAdminOrderById, useAdminInvoiceByOrderId } from '../../services/api/admin.api';
import { usePromotions } from '../../services/api/promotions.api';

const possibleNextStatuses: Record<OrderStatus, OrderStatus[]> = {
    'Processing': ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    'Shipped': ['Out for Delivery', 'Delivered', 'Cancelled', 'In Transit'],
    'In Transit': ['Out for Delivery', 'Delivered'],
    'Out for Delivery': ['Delivered'],
    'Delivered': [],
    'Cancelled': [],
    'Cancelled by User': [],
    'Return Requested': ['Return Approved'],
    'Return Approved': [],
};

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { updateOrderStatus, siteSettings, contactDetails } = useAppContext();

    const { data: order, isLoading: isOrderLoading } = useAdminOrderById(id);
    const { data: invoiceData, isLoading: isInvoiceLoading } = useAdminInvoiceByOrderId(id);
    const { data: promotionsData } = usePromotions();
    const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Logistics state
    const [courierName, setCourierName] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [isSavingLogistics, setIsSavingLogistics] = useState(false);

    // Get related data for preview
    const promotions = promotionsData || [];

    useEffect(() => {
        if (order) {
            setStatus(order.currentStatus);
            setCourierName(order.courierName || '');
            setTrackingId(order.trackingId || '');
        }
    }, [order]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value as OrderStatus);
    };

    const handleSaveStatus = async () => {
        if (order && status) {
            // If marking as Shipped, save tracking info too
            if (status === 'Shipped') {
                await handleSaveLogistics();
            }
            await updateOrderStatus(order.id, status);
        }
    };

    const handleSaveLogistics = async () => {
        if (!order) return;
        setIsSavingLogistics(true);
        try {
            await supabase
                .from('orders')
                .update({
                    courier_name: courierName,
                    tracking_id: trackingId
                })
                .eq('id', order.id);
            // Optimistically update local state if needed, or rely on reload
        } catch (error) {
            console.error("Error saving logistics:", error);
            alert("Failed to save logistics details.");
        } finally {
            setIsSavingLogistics(false);
        }
    };

    const handleShipWithPartner = async () => {
        if (!order) return;
        if (!confirm("Are you sure you want to generate a shipment with the Active Delivery Partner?")) return;

        setIsSavingLogistics(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-shipment', {
                body: { orderId: order.id }
            });

            if (error) {
                // If function invocation fails
                throw new Error(error.message);
            }

            if (data?.error) {
                // If function returns logical error
                throw new Error(data.error);
            }

            alert(`Shipment Created! Tracking ID: ${data.trackingId}`);
            setTrackingId(data.trackingId || '');
            window.location.reload(); // Reload to get updated status and history
        } catch (error: any) {
            console.error("Shipping Error:", error);
            alert(`Failed to create shipment: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSavingLogistics(false);
        }
    };

    if (isOrderLoading || isInvoiceLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return <div className="text-center p-10">Order not found.</div>;
    }

    const availableStatuses = possibleNextStatuses[order.currentStatus] || [];
    const isStatusLocked = availableStatuses.length === 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        <EyeIcon className="w-5 h-5" />
                        Preview Documents
                    </button>
                    <Link to="/admin/orders" className="text-sm font-medium text-primary hover:underline">&larr; Back to Orders</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items in this Order ({order.items.length})</h3>
                        <div className="divide-y divide-gray-200">
                            {order.items.map((item: any) => {
                                // Handle both nested 'product' (CartItem) and flat structure (Saved Order Item)
                                const productId = item.product?.id || item.productId;
                                const productName = item.product?.name || item.name;
                                const productImage = item.product?.images?.[0] || item.image;
                                const productPrice = item.product?.price || item.price;
                                const colorName = item.selectedColor?.name || (typeof item.color === 'object' ? item.color?.name : item.color) || 'N/A';

                                return (
                                    <div key={item.id} className="py-4 flex items-center space-x-4">
                                        <SupabaseImage
                                            bucket={BUCKETS.PRODUCTS}
                                            imagePath={productImage}
                                            alt={productName}
                                            className="w-16 h-16 rounded-md object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{productName}</p>
                                            <p className="text-sm text-gray-500">Size: {item.selectedSize} | Color: {colorName}</p>
                                            {item.customization && (
                                                <div className="mt-1 text-xs bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200 whitespace-pre-wrap">
                                                    <span className="font-bold">Customization:</span> {item.customization}
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-500">SKU: {productId}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₹{productPrice} x {item.quantity}</p>
                                            <p className="font-bold">₹{productPrice * item.quantity}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium">{order.payment.method}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Payment Status</span><span className="font-medium text-green-600">{order.payment.status}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-medium">{order.payment.transactionId}</span></div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Status */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                        {isStatusLocked ? (
                            <div>
                                <p className="font-semibold">{order.currentStatus}</p>
                                <p className="text-sm text-gray-500 mt-1">This order's status is final and cannot be changed.</p>
                            </div>
                        ) : (
                            <>
                                <select value={status} onChange={handleStatusChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                    <option value={order.currentStatus}>{order.currentStatus}</option>
                                    {availableStatuses.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <button onClick={handleSaveStatus} className="mt-4 w-full bg-primary text-white py-2 rounded-md font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Update Status
                                </button>
                            </>
                        )}
                    </div>

                    {/* Logistics Details */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TruckIcon className="w-5 h-5" /> Delivery & Shipment
                        </h3>

                        {/* Status Checks */}
                        {order.delivery_type === 'pickup' ? (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                                <h4 className="font-semibold text-blue-800 mb-2">Store Pickup Order</h4>
                                <p className="text-sm text-blue-600 mb-3">Customer will pick up from store.</p>

                                {order.currentStatus === 'Ready for Pickup' ? (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter User's Code"
                                                className="border p-2 rounded w-full"
                                                id="pickupCodeInput"
                                            />
                                            <button
                                                onClick={() => {
                                                    const code = (document.getElementById('pickupCodeInput') as HTMLInputElement).value;
                                                    // verifyOrderPickup(order.id, code); // Need to expose this from context or call raw
                                                    // Since context not fully refreshed in this file snippet, using window or prop if available. 
                                                    // Actually we need to add verifyOrderPickup to destructuring at top.
                                                }}
                                                className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                                    >
                                        Mark Ready for Pickup
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">Delivery Mode:</span>
                                    <select
                                        className="border-none bg-transparent font-bold text-primary focus:ring-0"
                                        value={order.delivery_type || 'partner'}
                                        onChange={async (e) => {
                                            const type = e.target.value;
                                            await supabase.from('orders').update({ delivery_type: type }).eq('id', order.id);
                                            window.location.reload();
                                        }}
                                    >
                                        <option value="partner">Partner Delivery</option>
                                        <option value="shop">Shop Delivery</option>
                                    </select>
                                </div>

                                {order.delivery_type === 'shop' ? (
                                    <div className="space-y-3 border-t pt-3">
                                        <h4 className="font-medium text-sm">Shop Delivery Details</h4>
                                        <input
                                            type="text"
                                            placeholder="Delivery Person Name"
                                            className="w-full p-2 border rounded text-sm"
                                            value={courierName}
                                            onChange={(e) => setCourierName(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Phone Number"
                                            className="w-full p-2 border rounded text-sm"
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                        />
                                        <button 
                                            onClick={async () => {
                                                setIsSavingLogistics(true);
                                                try {
                                                    await supabase.from('orders').update({
                                                        shop_delivery_details: {
                                                            boy_name: courierName,
                                                            boy_phone: trackingId
                                                        }
                                                    }).eq('id', order.id);
                                                    alert("Shop delivery details updated.");
                                                } catch (e) {
                                                    console.error("Error updating shop delivery details:", e);
                                                    alert("Failed to update details.");
                                                } finally {
                                                    setIsSavingLogistics(false);
                                                }
                                            }}
                                            disabled={isSavingLogistics}
                                            className="w-full bg-green-600 text-white py-2 rounded text-sm disabled:bg-gray-400"
                                        >
                                            {isSavingLogistics ? 'Saving...' : 'Assign & notify'}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Courier Partner</label>
                                            <input
                                                type="text"
                                                value={courierName}
                                                onChange={(e) => setCourierName(e.target.value)}
                                                placeholder="e.g. FedEx, Delhivery"
                                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Tracking ID / AWB</label>
                                            <input
                                                type="text"
                                                value={trackingId}
                                                onChange={(e) => setTrackingId(e.target.value)}
                                                placeholder="e.g. 1234567890"
                                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                            />
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                Entering this ID enables the <code>courier-webhook</code> to receive updates from your shipping partner.
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveLogistics}
                                                disabled={isSavingLogistics}
                                                className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-md font-semibold hover:bg-gray-200 text-xs"
                                            >
                                                {isSavingLogistics ? 'Saving...' : 'Save Logistics Info'}
                                            </button>

                                            {order.currentStatus === 'Processing' && (
                                                <button
                                                    onClick={handleShipWithPartner}
                                                    disabled={isSavingLogistics}
                                                    className="flex-1 bg-purple-600 text-white py-2 rounded-md font-semibold hover:bg-purple-700 text-xs flex items-center justify-center gap-1"
                                                >
                                                    <TruckIcon className="w-4 h-4" />
                                                    Auto-Ship
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                        <div className="space-y-2 text-sm">
                            <p className="font-bold text-gray-800">{order.customerName}</p>
                            <p className="text-gray-600">{order.customerEmail}</p>
                            <p className="text-gray-600">{order.shippingAddress?.mobile || 'N/A'}</p>
                            <hr className="my-2" />
                            <h4 className="font-semibold text-gray-700 pt-1">Shipping Address</h4>
                            <address className="not-italic text-gray-600">
                                {order.shippingAddress?.address || ''}<br />
                                {order.shippingAddress?.locality || ''}<br />
                                {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} {order.shippingAddress?.pincode || ''}
                            </address>
                        </div>
                    </div>
                </div>
            </div>

            <DocumentPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                order={order}
                promotions={promotions}
                siteSettings={siteSettings}
                contactDetails={contactDetails}
                invoiceData={invoiceData}
            />
        </div >
    );
};

export default OrderDetailsPage;
