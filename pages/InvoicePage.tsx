
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';
import InvoiceTemplate from '../components/checkout/InvoiceTemplate';
import { useUserOrders } from '../services/api/user.api.ts';
import { useAdminOrderById, useAdminAllInvoices } from '../services/api/admin.api';
import { usePromotions } from '../services/api/promotions.api';

const InvoicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser, siteSettings, contactDetails, deliverySettings } = useAppContext();
    const { data: userOrders = [], isLoading: isUserOrdersLoading } = useUserOrders(currentUser?.id);
    const { data: adminOrder, isLoading: isAdminOrderLoading } = useAdminOrderById(currentUser?.role === 'admin' ? id : undefined);
    const { data: promotionsData } = usePromotions();
    const { data: invoicesData } = useAdminAllInvoices();

    // Try to find order in current user's orders, or admin order if available
    const order = useMemo(() => {
        return userOrders.find(o => o.id === id) || adminOrder;
    }, [id, userOrders, adminOrder]);

    const promotions = promotionsData || [];

    // Try to find invoice data if it exists in admin data (for QR codes etc)
    const invoiceData = useMemo(() => {
        const invoices = invoicesData || [];
        return invoices.find(inv => inv.order_id === id);
    }, [id, invoicesData]);

    const handlePrint = () => {
        window.print();
    };

    if (isUserOrdersLoading || isAdminOrderLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-500">Loading invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
                    <p className="text-gray-600 mt-2">Could not find order details.</p>
                    <Link to="/" className="mt-6 text-primary hover:underline">Go to Homepage</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                  .no-print {
                    display: none;
                  }
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
            `}</style>
            <div className="max-w-4xl mx-auto p-4 sm:p-8 font-sans">
                {/* Header with actions */}
                <div className="no-print flex justify-between items-center mb-6">
                    <Link to={`/order/${order.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Order Details
                    </Link>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700">
                        <PrinterIcon className="w-5 h-5" />
                        Print / Save as PDF
                    </button>
                </div>

                <InvoiceTemplate
                    order={order}
                    promotions={promotions}
                    siteSettings={siteSettings}
                    contactDetails={contactDetails}
                    deliverySettings={deliverySettings}
                    invoiceData={invoiceData}
                />
            </div>
        </>
    );
};

export default InvoicePage;
