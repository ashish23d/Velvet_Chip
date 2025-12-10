import React from 'react';
import { OrderStatus, StatusUpdate } from '../types.ts';
import {
    CheckIcon,
    TruckIcon,
    HomeModernIcon as OutForDeliveryIcon,
    MapPinIcon,
    ClipboardDocumentCheckIcon,
    ArchiveBoxIcon,
    XCircleIcon
} from '@heroicons/react/24/solid';

interface OrderTrackerProps {
    statusHistory: StatusUpdate[];
    currentStatus: OrderStatus;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ statusHistory, currentStatus }) => {
    const mainSteps: OrderStatus[] = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    // Determine active step index
    let activeStepIndex = mainSteps.indexOf(currentStatus as any);
    if (activeStepIndex === -1) {
        // Handle intermediate statuses
        if (currentStatus === 'In Transit') activeStepIndex = 1; // Between Shipped/Out
        if (currentStatus === 'Return Requested') activeStepIndex = 4;
        if (currentStatus === 'Return Approved') activeStepIndex = 4;
    }

    const isCancelled = currentStatus === 'Cancelled' || currentStatus === 'Cancelled by User';

    const getIcon = (status: OrderStatus) => {
        switch (status) {
            case 'Processing': return ClipboardDocumentCheckIcon;
            case 'Shipped': return ArchiveBoxIcon;
            case 'In Transit': return TruckIcon;
            case 'Out for Delivery': return TruckIcon;
            case 'Delivered': return OutForDeliveryIcon;
            case 'Cancelled':
            case 'Cancelled by User': return XCircleIcon;
            default: return MapPinIcon;
        }
    };

    if (isCancelled) {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <XCircleIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-700">Order Cancelled</h3>
                        <p className="text-red-600 mt-1 text-sm">This order has been cancelled.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Reverse history to show newest on top for the timeline
    const timelineEvents = [...statusHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Tracking Status</h3>

            {/* Desktop Horizontal Stepper */}
            <div className="hidden md:block mb-12 relative px-4">
                {/* Progress Bar Background */}
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 rounded-full -z-10" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-6 left-0 h-1 bg-gradient-to-r from-pink-500 to-primary rounded-full -z-10 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min((activeStepIndex / (mainSteps.length - 1)) * 100, 100)}%` }}
                />

                <div className="flex justify-between w-full">
                    {mainSteps.map((step, index) => {
                        const Icon = getIcon(step);
                        const isCompleted = index <= activeStepIndex;
                        const isCurrent = index === activeStepIndex;

                        return (
                            <div key={step} className="flex flex-col items-center group">
                                <div
                                    className={`
                                        w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10
                                        ${isCompleted
                                            ? 'bg-primary border-white shadow-lg shadow-pink-200 scale-110'
                                            : 'bg-white border-gray-200 text-gray-300'
                                        }
                                        ${isCurrent ? 'ring-4 ring-pink-100 animate-pulse' : ''}
                                    `}
                                >
                                    <Icon className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-gray-300'}`} />
                                </div>
                                <p className={`
                                    mt-4 text-sm font-semibold transition-colors duration-300
                                    ${isCompleted ? 'text-gray-900' : 'text-gray-400'}
                                `}>
                                    {step}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile / Vertical Timeline */}
            <div className={`md:mt-8 space-y-8 ${'block' /* Always show timeline for details */}`}>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 md:hidden">Details</h4>
                <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-2">
                    {timelineEvents.map((update, index) => {
                        const isLatest = index === 0;
                        const Icon = getIcon(update.status);

                        return (
                            <div key={index} className="relative pl-8 group">
                                {/* Dot on the line */}
                                <div className={`
                                    absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full border-4 transition-all duration-300
                                    ${isLatest
                                        ? 'bg-primary border-white shadow-md ring-2 ring-primary/20 scale-110'
                                        : 'bg-gray-200 border-white'
                                    }
                                 `}></div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors -mt-3 -ml-2">
                                    <div>
                                        <p className={`font-bold text-base flex items-center gap-2 ${isLatest ? 'text-primary' : 'text-gray-800'}`}>
                                            {update.status}
                                            {isLatest && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 animate-pulse">Live</span>}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">{update.description}</p>
                                        {update.location && (
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <MapPinIcon className="w-3 h-3" /> {update.location}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium sm:text-right whitespace-nowrap bg-gray-50 px-2 py-1 rounded self-start mt-2 sm:mt-0">
                                        {new Date(update.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        <span className="mx-1">•</span>
                                        {new Date(update.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderTracker;
