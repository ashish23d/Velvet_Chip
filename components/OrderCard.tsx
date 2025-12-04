
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Order } from '../types.ts';
import OrderItem from './OrderItem.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import ChevronUpIcon from './icons/ChevronUpIcon.tsx';
import MapPinIcon from './icons/MapPinIcon.tsx';
import { useAppContext } from '../context/AppContext.tsx';

interface OrderCardProps {
    order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const { userCancelOrder } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) {
            userCancelOrder(order.id);
        }
    };

    const getStatusStyles = () => {
        switch (order.currentStatus) {
            case 'Delivered':
                return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
            case 'Shipped':
            case 'Out for Delivery':
                return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
            case 'Processing':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
            case 'Cancelled':
            case 'Cancelled by User':
                return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
            case 'Return Requested':
            case 'Return Approved':
                 return { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
        }
    };
    const statusStyles = getStatusStyles();

    return (
        <div className="border border-gray-200 rounded-lg bg-white">
            {/* Card Header */}
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                        <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></span>
                        {order.currentStatus}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        <span className="font-semibold text-gray-800">Order ID:</span> {order.id}
                    </div>
                </div>
                <div className="text-sm text-gray-500 text-left sm:text-right">
                    <p>Order Date: <span className="font-medium text-gray-800">{new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                    <p>Total: <span className="font-bold text-lg text-gray-900">₹{order.totalAmount.toLocaleString()}</span></p>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-200 self-start sm:self-center">
                    {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-600" /> : <ChevronDownIcon className="w-5 h-5 text-gray-600" />}
                </button>
            </div>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    <div className="divide-y divide-gray-200">
                        {order.items.map(item => <OrderItem key={item.id} item={item} orderStatus={order.currentStatus}/>)}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                             <h4 className="font-semibold text-gray-800">Shipping Address</h4>
                             <div className="flex items-center gap-2 flex-wrap">
                                {order.currentStatus === 'Processing' && (
                                     <button onClick={handleCancel} className="text-sm font-semibold text-red-600 border border-red-200 rounded-full px-4 py-1.5 hover:bg-red-50 transition-colors">
                                        Cancel Order
                                    </button>
                                )}
                                 {order.currentStatus === 'Delivered' && (
                                     <ReactRouterDOM.Link to={`/help-and-returns/${order.id}`} className="text-sm font-semibold text-blue-600 border border-blue-200 rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors">
                                        Request Return
                                    </ReactRouterDOM.Link>
                                )}
                                <ReactRouterDOM.Link to={`/track-order/${order.id}`} className="text-sm font-semibold text-primary border border-primary/50 rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors">
                                    Track Order
                                </ReactRouterDOM.Link>
                                <ReactRouterDOM.Link to={`/help-and-returns/${order.id}`} className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-100 transition-colors">
                                    Help
                                </ReactRouterDOM.Link>
                             </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 flex items-start gap-3">
                           <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                           <div>
                                <p className="font-semibold text-gray-800">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address}, {order.shippingAddress.locality}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                <p>Mobile: {order.shippingAddress.mobile}</p>
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
