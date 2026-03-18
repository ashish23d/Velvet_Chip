import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';
import ShippingLabel from '../components/checkout/ShippingLabel';

const LabelPrintPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { getOrderById, contactDetails } = useAppContext();
    
    const order = useMemo(() => getOrderById(orderId), [orderId, getOrderById]);

    useEffect(() => {
        if (order) {
            // Auto-print after generation
            const timer = setTimeout(() => window.print(), 1000);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (!order) {
        return <div className="p-8">Order not found.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center py-8">
            <style>{`
                @media print {
                  .no-print { display: none !important; }
                  @page { size: 4in 6in; margin: 0; }
                  body { margin: 0; background: white; }
                  .label-wrapper { 
                    width: 4in; 
                    height: 6in; 
                    page-break-after: always; 
                    border: none !important; 
                    box-shadow: none !important;
                    margin: 0;
                    padding: 0;
                  }
                }
            `}</style>

            <div className="no-print w-full max-w-md mb-4 flex justify-between items-center px-4">
                <Link to={`/admin/orders/${order.id}`} className="text-sm text-gray-600 hover:underline flex items-center gap-1">
                    <ArrowLeftIcon className="w-4 h-4"/> Back to Order
                </Link>
                <button onClick={() => window.print()} className="bg-primary text-white py-2 px-4 rounded-md font-medium flex items-center gap-2 hover:bg-pink-700">
                    <PrinterIcon className="w-5 h-5"/> Print Label
                </button>
            </div>

            {/* 4x6 Inch Standard Shipping Label Wrapper */}
            <div className="label-wrapper">
                <ShippingLabel order={order} contactDetails={contactDetails} />
            </div>
        </div>
    );
};

export default LabelPrintPage;