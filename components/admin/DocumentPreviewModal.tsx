import React, { useState } from 'react';
import { Order, Promotion, SiteSettings, ContactDetails, Invoice } from '../../types.ts';
import InvoiceTemplate from '../InvoiceTemplate.tsx';
import ShippingLabel from '../ShippingLabel.tsx';
import XIcon from '../icons/XIcon.tsx';
import { PrinterIcon, DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    promotions: Promotion[];
    siteSettings: SiteSettings | null;
    contactDetails: ContactDetails;
    invoiceData?: Invoice;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    isOpen, onClose, order, promotions, siteSettings, contactDetails, invoiceData
}) => {
    const [activeTab, setActiveTab] = useState<'invoice' | 'label'>('invoice');

    if (!isOpen) return null;

    const handlePrint = () => {
        // Open the standalone print pages in a new tab which triggers auto-print
        const url = activeTab === 'invoice' 
            ? `/#/invoice/${order.id}` 
            : `/#/print/label/${order.id}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-gray-100 w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-white border-b p-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-gray-800">Document Preview</h2>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('invoice')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'invoice' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <DocumentTextIcon className="w-4 h-4" /> Invoice
                            </button>
                            <button
                                onClick={() => setActiveTab('label')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'label' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <TagIcon className="w-4 h-4" /> Shipping Label
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors"
                        >
                            <PrinterIcon className="w-4 h-4" /> Print {activeTab === 'invoice' ? 'Invoice' : 'Label'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-8 bg-gray-50/50 flex justify-center">
                    <div className={`bg-white shadow-lg transition-all duration-300 ${activeTab === 'invoice' ? 'w-full max-w-4xl min-h-[1000px]' : 'w-auto'}`}>
                        {activeTab === 'invoice' ? (
                            <InvoiceTemplate
                                order={order}
                                promotions={promotions}
                                siteSettings={siteSettings}
                                contactDetails={contactDetails}
                                invoiceData={invoiceData}
                            />
                        ) : (
                            <ShippingLabel 
                                order={order} 
                                contactDetails={contactDetails} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;