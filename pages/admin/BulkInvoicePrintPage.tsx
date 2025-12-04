
import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import InvoiceTemplate from '../../components/InvoiceTemplate.tsx';
import ShippingLabel from '../../components/ShippingLabel.tsx';
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';

const BulkInvoicePrintPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { adminData, siteSettings, contactDetails } = useAppContext();
    
    const orderIds = useMemo(() => {
        const ids = searchParams.get('ids');
        return ids ? ids.split(',') : [];
    }, [searchParams]);

    const mode = searchParams.get('mode') === 'label' ? 'label' : 'invoice';

    const itemsToPrint = useMemo(() => {
        if (!adminData) return [];
        const orders = adminData.orders.filter(o => orderIds.includes(o.id));
        const invoices = adminData.invoices;
        const promotions = adminData.promotions;

        return orders.map(order => ({
            order,
            invoiceData: invoices.find(inv => inv.order_id === order.id),
            promotions
        }));
    }, [adminData, orderIds]);

    useEffect(() => {
        // Auto-print after a short delay to ensure rendering of images/barcodes
        const timer = setTimeout(() => {
            if (itemsToPrint.length > 0) {
                window.print();
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [itemsToPrint]);

    if (itemsToPrint.length === 0) {
        return <div className="p-8 text-center">No orders found for the selected IDs.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
             <style>{`
                @media print {
                  .no-print { display: none !important; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; }
                  
                  /* Invoice Styles */
                  .invoice-container { break-after: page; page-break-after: always; margin-bottom: 0; border: none; shadow: none; width: 100%; }
                  
                  /* Label Styles */
                  ${mode === 'label' ? `
                      @page { size: 4in 6in; margin: 0; }
                      .label-page-container { 
                        width: 4in; 
                        height: 6in; 
                        page-break-after: always; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        overflow: hidden;
                        border: none !important;
                        box-shadow: none !important;
                        margin: 0;
                      }
                  ` : ''}
                  
                  .last-item { break-after: auto; page-break-after: auto; }
                }
            `}</style>
            
            <div className="no-print p-4 bg-white shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <Link to="/admin/invoices" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Invoices
                </Link>
                <div className="flex items-center gap-4">
                     <span className="text-sm text-gray-500">{itemsToPrint.length} {mode === 'label' ? 'Labels' : 'Invoices'} selected</span>
                     <button onClick={() => window.print()} className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700">
                        <PrinterIcon className="w-5 h-5"/> Print All
                    </button>
                </div>
            </div>

            <div className={`mx-auto ${mode === 'label' ? 'max-w-md p-4' : 'max-w-4xl p-8'}`}>
                {itemsToPrint.map(({ order, invoiceData, promotions }, index) => {
                    const isLast = index === itemsToPrint.length - 1;
                    
                    if (mode === 'label') {
                        return (
                            <div key={order.id} className={`label-page-container mb-8 border border-gray-300 bg-white shadow-sm mx-auto ${isLast ? 'last-item' : ''}`}>
                                <ShippingLabel order={order} contactDetails={contactDetails} />
                            </div>
                        );
                    }

                    return (
                        <div key={order.id} className={`invoice-container mb-8 ${isLast ? 'last-item' : ''}`}>
                            <InvoiceTemplate 
                                order={order}
                                promotions={promotions}
                                siteSettings={siteSettings}
                                contactDetails={contactDetails}
                                invoiceData={invoiceData}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BulkInvoicePrintPage;
