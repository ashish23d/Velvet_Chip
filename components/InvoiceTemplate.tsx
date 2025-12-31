
import React, { useMemo } from 'react';
import { Order, Promotion, SiteSettings, ContactDetails } from '../types.ts';
import Logo from './icons/Logo.tsx';
import SupabaseMedia from './SupabaseMedia.tsx';
import { BUCKETS } from '../constants.ts';

interface InvoiceTemplateProps {
    order: Order;
    promotions: Promotion[];
    siteSettings: SiteSettings | null;
    contactDetails: ContactDetails;
    invoiceData?: any; // Optional data from invoices table
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, promotions, siteSettings, contactDetails, invoiceData }) => {

    const appliedPromotion = promotions.find(p => p.code === order.promotionCode);
    const subtotal = order.items.reduce((acc, item) => {
        const price = item.product?.price || item.price || 0;
        return acc + (price * item.quantity);
    }, 0);
    const shipping = subtotal > 499 ? 0 : 50;
    const promoDiscount = useMemo(() => {
        if (!appliedPromotion) return 0;
        if (appliedPromotion.type === 'percentage') {
            return subtotal * (appliedPromotion.value / 100);
        }
        return appliedPromotion.value;
    }, [appliedPromotion, subtotal]);

    const invoiceNumber = invoiceData?.invoice_number || order.invoice_number || `INV-${order.id.split('-')[1]}`;
    const invoiceDate = invoiceData?.invoice_date || order.orderDate;

    return (
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg border print:shadow-none print:border-none print:p-0 mb-8 last:mb-0 page-break-inside-avoid">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-6 border-b">
                <div className="flex-shrink-0">
                    {/* Use Image if available in settings, else fallback to component */}
                    {siteSettings?.activeLogoPath ? (
                        <SupabaseMedia bucket={BUCKETS.SITE_ASSETS} imagePath={siteSettings.activeLogoPath} alt="Logo" className="h-14 w-auto object-contain" />
                    ) : (
                        <Logo className="h-14 sm:h-16 w-auto text-primary" />
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                        <p>{contactDetails.address}</p>
                        <p>{contactDetails.email}</p>
                        <p>{contactDetails.phone}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">Invoice</h1>
                    <p className="text-sm text-gray-500 mt-2">Invoice #: {invoiceNumber}</p>
                    <p className="text-sm text-gray-500">Order ID: #{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">Invoice Date: {new Date(invoiceDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500 font-medium">Purchase Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Bill To */}
            <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase text-gray-500">Bill To:</h2>
                <address className="not-italic text-gray-700 mt-2 text-sm">
                    <p className="font-bold">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}, {order.shippingAddress.locality}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    <p>Mobile: {order.shippingAddress.mobile}</p>
                </address>
            </div>

            {/* Items Table */}
            <div className="mt-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-sm text-gray-600 uppercase">
                            <th className="p-3 font-semibold border-b">#</th>
                            <th className="p-3 font-semibold border-b">Item</th>
                            <th className="p-3 font-semibold text-center border-b">HSN</th>
                            <th className="p-3 font-semibold text-center border-b">Qty</th>
                            <th className="p-3 font-semibold text-right border-b">Rate</th>
                            <th className="p-3 font-semibold text-right border-b">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {order.items.map((item, index) => {
                            const productName = item.product?.name || item.name;
                            const size = item.selectedSize;
                            const colorName = item.selectedColor?.name || (typeof item.color === 'object' ? item.color?.name : item.color) || 'N/A';
                            const hsnCode = item.product?.hsnCode || 'N/A';
                            const price = item.product?.price || item.price || 0;

                            return (
                                <tr key={item.id} className="border-b">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">
                                        <p className="font-medium text-gray-800">{productName}</p>
                                        <p className="text-xs text-gray-500">Size: {size}, Color: {colorName}</p>
                                    </td>
                                    <td className="p-3 text-center">{hsnCode}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">₹{price.toFixed(2)}</td>
                                    <td className="p-3 text-right">₹{(price * item.quantity).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-8 flex justify-end">
                <div className="w-full max-w-xs text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {promoDiscount > 0 && (
                        <div className="flex justify-between py-2 border-b text-green-600">
                            <span>Discount ({order.promotionCode})</span>
                            <span className="font-medium">- ₹{promoDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">₹{shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-gray-100 px-3 rounded-md mt-2 print:bg-transparent print:px-0">
                        <span className="font-bold text-base">Grand Total</span>
                        <span className="font-bold text-base">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Notes */}
            <div className="mt-12 border-t pt-6 text-xs text-gray-500">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Return Policy & Notes</h3>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                        <p>Returns are accepted within 10 days of delivery for unworn items with tags attached.</p>
                    </div>
                    {invoiceData?.qr_code_url && (
                        <div className="text-center ml-4">
                            <SupabaseMedia bucket={BUCKETS.SITE_ASSETS} imagePath={invoiceData.qr_code_url} alt="QR Code" className="h-20 w-20" />
                            <p className="text-[8px] mt-1">Scan to verify</p>
                        </div>
                    )}
                </div>
                <p className="mt-4 font-semibold text-center text-gray-800">Thank you for shopping with Awaany!</p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
