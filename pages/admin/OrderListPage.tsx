
import React, { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Order, OrderStatus } from '../../types.ts';
import EyeIcon from '../../components/icons/EyeIcon.tsx';
import Pagination from '../../components/shared/Pagination';
import { useAdminPaginatedOrders } from '../../services/api/admin.api.ts';
import { supabase } from '../../services/supabaseClient.ts';

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

const OrderListPage: React.FC = () => {
    const { adminBulkUpdateOrderStatus, generateInvoice, deliverySettings } = useAppContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // View Mode for Tabs
    const [viewMode, setViewMode] = useState<'all' | 'local' | 'pickup'>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State for bulk actions
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [bulkNewStatus, setBulkNewStatus] = useState<OrderStatus | ''>('');
    const [isApplyingStatus, setIsApplyingStatus] = useState(false);

    // State for single invoice generation
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- API Hook ---
    const { data: ordersResponse, isLoading } = useAdminPaginatedOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        viewMode: viewMode,
        storeCity: deliverySettings?.store_city || '',
        statusFilter: statusFilter,
    });

    const orders = ordersResponse?.data || [];
    const totalOrders = ordersResponse?.count || 0;
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    // --- Filter logic for Date (client-side) ---
    const filteredAndSortedOrders = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let filtered = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            orderDate.setHours(0, 0, 0, 0);

            let dateMatch = true;
            switch (dateFilter) {
                case 'today':
                    dateMatch = orderDate.getTime() === today.getTime();
                    break;
                case 'yesterday':
                    dateMatch = orderDate.getTime() === yesterday.getTime();
                    break;
                case 'custom': {
                    const start = customStartDate ? new Date(customStartDate) : null;
                    const end = customEndDate ? new Date(customEndDate) : null;
                    if (start) start.setHours(0, 0, 0, 0);
                    if (end) end.setHours(23, 59, 59, 999);

                    if (start && end) {
                        dateMatch = new Date(order.orderDate) >= start && new Date(order.orderDate) <= end;
                    } else if (start) {
                        dateMatch = new Date(order.orderDate) >= start;
                    } else if (end) {
                        dateMatch = new Date(order.orderDate) <= end;
                    } else {
                        dateMatch = true;
                    }
                    break;
                }
                case 'all':
                default:
                    dateMatch = true;
                    break;
            }

            return dateMatch;
        });

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                case 'total-desc':
                    return b.totalAmount - a.totalAmount;
                case 'total-asc':
                    return a.totalAmount - b.totalAmount;
                case 'date-desc':
                default:
                    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
            }
        });

        return sorted;

    }, [orders, sortBy, dateFilter, customStartDate, customEndDate]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortBy, dateFilter, customStartDate, customEndDate, viewMode]);

    const availableBulkStatuses = useMemo(() => {
        if (selectedOrders.length === 0) {
            return [];
        }
        const selectedOrderObjects = selectedOrders.map(id => orders.find(o => o.id === id)).filter(Boolean) as Order[];
        if (selectedOrderObjects.length === 0) {
            return [];
        }

        let commonStatuses = new Set(possibleNextStatuses[selectedOrderObjects[0].currentStatus]);
        for (let i = 1; i < selectedOrderObjects.length; i++) {
            const nextPossible = new Set(possibleNextStatuses[selectedOrderObjects[i].currentStatus]);
            commonStatuses = new Set([...commonStatuses].filter(status => nextPossible.has(status)));
        }
        return Array.from(commonStatuses);
    }, [selectedOrders, orders]);

    useEffect(() => {
        if (bulkNewStatus && !availableBulkStatuses.includes(bulkNewStatus)) {
            setBulkNewStatus('');
        }
    }, [availableBulkStatuses, bulkNewStatus]);

    const handleGenerateInvoice = async (orderId: string) => {
        setIsGenerating(orderId);
        setError(null);
        try {
            await generateInvoice(orderId);
        } catch (err: any) {
            setError(err.message || 'Failed to generate invoice.');
        } finally {
            setIsGenerating(null);
        }
    };

    const handleSelectOne = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrders(filteredAndSortedOrders.map(o => o.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleBulkApply = async () => {
        if (!bulkNewStatus || selectedOrders.length === 0) return;
        setIsApplyingStatus(true);
        try {
            await adminBulkUpdateOrderStatus(selectedOrders, bulkNewStatus);
            setSelectedOrders([]);
            setBulkNewStatus('');
        } catch (error) {
            console.error("Failed to apply bulk status:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsApplyingStatus(false);
        }
    };

    const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
        const styles: Partial<Record<OrderStatus, string>> = {
            Delivered: 'bg-green-100 text-green-800',
            Shipped: 'bg-blue-100 text-blue-800',
            'Out for Delivery': 'bg-blue-100 text-blue-800',
            Processing: 'bg-yellow-100 text-yellow-800',
            Cancelled: 'bg-red-100 text-red-800',
            'Cancelled by User': 'bg-red-100 text-red-800',
            'Return Requested': 'bg-purple-100 text-purple-800',
            'Return Approved': 'bg-purple-100 text-purple-800',
            'In Transit': 'bg-blue-100 text-blue-800',
        };
        const style = styles[status] || 'bg-gray-100 text-gray-800';
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
                {status}
            </span>
        );
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">

                {/* View Mode Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setViewMode('local')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'local' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📍 Local Orders ({deliverySettings?.store_city || 'City Not Set'})
                    </button>
                    <button
                        onClick={() => setViewMode('pickup')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'pickup' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🏪 Store Pickups
                    </button>
                </div>

                <div className="flex flex-col mb-6 gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {viewMode === 'all' && 'Order Management'}
                            {viewMode === 'local' && 'Local City Orders'}
                            {viewMode === 'pickup' && 'Store Pickup Orders'}
                        </h1>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            >
                                <option value="all">All Statuses</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="outfordelivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="cancelledbyuser">Cancelled by User</option>
                                <option value="returnrequested">Return Requested</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            >
                                <option value="date-desc">Date: Newest First</option>
                                <option value="date-asc">Date: Oldest First</option>
                                <option value="total-desc">Total: High to Low</option>
                                <option value="total-asc">Total: Low to High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                        <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                            {(['all', 'today', 'yesterday', 'custom'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setDateFilter(f)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${dateFilter === f ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {f === 'all' ? 'All Time' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={e => setCustomStartDate(e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={e => setCustomEndDate(e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedOrders.length > 0 && selectedOrders.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                                        onChange={handleSelectAll}
                                        aria-label="Select all orders"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">Loading orders...</td>
                                </tr>
                            ) : filteredAndSortedOrders.map((order) => (
                                <tr key={order.id} className={selectedOrders.includes(order.id) ? 'bg-primary/5' : ''}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={() => handleSelectOne(order.id)}
                                            aria-label={`Select order ${order.id}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <p className="font-medium text-primary">#{order.id}</p>
                                        <p className="text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={order.currentStatus} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {order.invoice_number ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 font-semibold text-xs uppercase tracking-wider">Generated</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <a 
                                                        href={supabase.storage.from('site-assets').getPublicUrl(order.downloadable_invoice_url).data.publicUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-[10px] text-primary hover:underline font-medium"
                                                    >
                                                        View Invoice
                                                    </a>
                                                    <Link to={`/print/label/${order.id}`} target="_blank" className="text-[10px] text-gray-500 hover:underline">(Label)</Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleGenerateInvoice(order.id)}
                                                disabled={isGenerating === order.id}
                                                className="bg-primary/10 text-primary text-xs py-1.5 px-3 rounded-md font-bold hover:bg-primary/20 disabled:bg-gray-100 disabled:text-gray-400 border border-primary/20 transition-all uppercase tracking-tighter"
                                            >
                                                {isGenerating === order.id ? 'Generating...' : 'Generate'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1">
                                            <EyeIcon className="h-5 w-5" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAndSortedOrders.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No orders match the current filters.
                        </div>
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
            {selectedOrders.length > 0 && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white shadow-lg p-4 border-t flex items-center justify-between gap-4 z-20 animate-slide-in-down">
                    <p className="text-sm font-medium">{selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected</p>
                    <div className="flex items-center gap-3">
                        <select
                            value={bulkNewStatus}
                            onChange={e => setBulkNewStatus(e.target.value as OrderStatus | '')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                        >
                            <option value="">-- Change status to --</option>
                            {availableBulkStatuses.length > 0 ? (
                                availableBulkStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))
                            ) : (
                                <option value="" disabled>No common status available</option>
                            )}
                        </select>
                        <button
                            onClick={handleBulkApply}
                            disabled={!bulkNewStatus || isApplyingStatus}
                            className="bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isApplyingStatus ? 'Applying...' : 'Apply'}
                        </button>
                        <button onClick={() => setSelectedOrders([])} className="text-sm text-gray-600 hover:underline">
                            Deselect
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderListPage;
