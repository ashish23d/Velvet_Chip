
import React from 'react';
import { OrderStatus, StatusUpdate } from '../types.ts';
import { CheckIcon, TruckIcon, HomeModernIcon as OutForDeliveryIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { ArchiveBoxIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface OrderTrackerProps {
    statusHistory: StatusUpdate[];
    currentStatus: OrderStatus;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ statusHistory, currentStatus }) => {
    // Define the ideal logical flow for display
    const mainSteps: OrderStatus[] = ['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
    
    const getIcon = (status: OrderStatus) => {
        switch(status) {
            case 'Processing': return ClipboardDocumentCheckIcon;
            case 'Shipped': return ArchiveBoxIcon;
            case 'In Transit': return TruckIcon;
            case 'Out for Delivery': return TruckIcon;
            case 'Delivered': return OutForDeliveryIcon;
            default: return MapPinIcon;
        }
    };

    if (currentStatus === 'Cancelled' || currentStatus === 'Cancelled by User') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Order Cancelled</h3>
                <p className="text-gray-600">This order has been cancelled. For more details, please contact customer support.</p>
            </div>
        );
    }
    
    // Reverse history to show newest on top
    const timelineEvents = [...statusHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Tracking History</h3>
            
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-2">
                {timelineEvents.map((update, index) => {
                    const isLatest = index === 0;
                    const Icon = getIcon(update.status);
                    
                    return (
                        <div key={index} className="relative pl-8">
                             {/* Dot on the line */}
                             <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isLatest ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-white border-gray-400'}`}></div>
                             
                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <p className={`font-bold text-base ${isLatest ? 'text-primary' : 'text-gray-800'}`}>
                                        {update.status}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-0.5">{update.description}</p>
                                    {update.location && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPinIcon className="w-3 h-3" /> {update.location}
                                        </p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 sm:text-right whitespace-nowrap">
                                    {new Date(update.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    <br/>
                                    {new Date(update.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                        </div>
                    );
                })}
                
                {/* Initial State Placeholder if empty history */}
                {timelineEvents.length === 0 && (
                    <div className="relative pl-8">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20"></div>
                        <p className="font-bold text-gray-800">Order Placed</p>
                        <p className="text-sm text-gray-500">We have received your order.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracker;
