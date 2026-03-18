import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { ReturnRequest, ReturnRequestStatus } from '../../types.ts';
import { Link } from 'react-router-dom';
import SupabaseImage from '../../components/shared/SupabaseImage';
import { BUCKETS } from '../../constants.ts';
import { useAdminPaginatedReturns } from '../../services/api/admin.api';
import Pagination from '../../components/shared/Pagination';

const ReturnsListPage: React.FC = () => {
    const { adminUpdateReturnStatus, showConfirmationModal } = useAppContext();
    const [statusFilter, setStatusFilter] = useState<ReturnRequestStatus | 'all'>('Pending');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const { data: returnsResponse, isLoading } = useAdminPaginatedReturns({
        page: currentPage,
        limit: itemsPerPage,
    });

    const returns = (returnsResponse?.data || []) as ReturnRequest[];
    const totalReturns = returnsResponse?.count || 0;
    const totalPages = Math.ceil(totalReturns / itemsPerPage);

    const filteredReturns = useMemo(() => {
        return returns
            .filter(r => statusFilter === 'all' || r.status === statusFilter)
            .sort((a, b) => new Date(b.return_requested_at).getTime() - new Date(a.return_requested_at).getTime());
    }, [returns, statusFilter]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const handleStatusChange = async (returnId: string, newStatus: ReturnRequestStatus) => {
        showConfirmationModal({
            title: 'Confirm Status Change',
            message: `Are you sure you want to change the status to "${newStatus}"?`,
            onConfirm: async () => {
                setUpdatingId(returnId);
                setUpdateError(null);
                try {
                    await adminUpdateReturnStatus(returnId, { status: newStatus });
                } catch (error) {
                    console.error("Failed to update return status:", error);
                    setUpdateError((error as Error).message || "An unknown error occurred. Please try again.");
                    throw error; // Re-throw to keep modal from closing on error
                } finally {
                    setUpdatingId(null);
                }
            },
            confirmText: newStatus === 'Approved' ? 'Approve' : 'Confirm',
            isDestructive: newStatus === 'Rejected',
        });
    };

    const StatusBadge: React.FC<{ status: ReturnRequestStatus }> = ({ status }) => {
        const styles: Record<ReturnRequestStatus, string> = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-blue-100 text-blue-800',
            'Pickup Scheduled': 'bg-cyan-100 text-cyan-800',
            'In Transit': 'bg-indigo-100 text-indigo-800',
            'Item Inspected': 'bg-purple-100 text-purple-800',
            Processing: 'bg-orange-100 text-orange-800',
            Completed: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800',
        };
        const style = styles[status] || 'bg-gray-100 text-gray-800';
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>{status}</span>;
    };

    const nextActionMap: Record<ReturnRequestStatus, ReturnRequestStatus | null> = {
        Pending: 'Approved',
        Approved: 'Pickup Scheduled',
        'Pickup Scheduled': 'In Transit',
        'In Transit': 'Item Inspected',
        'Item Inspected': 'Processing', // Assuming inspection leads to refund processing
        Processing: 'Completed',
        Rejected: null,
        Completed: null,
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Return Requests</h1>
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    {(['Pending', 'Approved', 'Completed', 'Rejected', 'all'] as const).map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${statusFilter === f ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>

            {updateError && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{updateError}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReturns.map(r => {
                            const nextAction = nextActionMap[r.status];
                            const isUpdating = updatingId === r.id;
                            return (
                                <tr key={r.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={r.item?.image} alt={r.item?.name || ''} className="w-12 h-16 object-cover rounded-md" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 line-clamp-2">{r.item?.name}</div>
                                                <div className="text-xs text-gray-500">Qty: {r.item?.quantity}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="font-medium text-gray-900">{r.user?.name}</div>
                                        <Link to={`/admin/orders/${r.order_id}`} className="text-primary hover:underline">Order #{r.order_id.slice(-6)}</Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{r.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2 h-6">
                                            {isUpdating ? <span className="text-xs text-gray-500">Updating...</span> : (
                                                <>
                                                    {r.status === 'Pending' && (
                                                        <button onClick={() => handleStatusChange(r.id, 'Rejected')} className="text-red-600 hover:text-red-800 text-xs font-semibold">Reject</button>
                                                    )}
                                                    {nextAction && (
                                                        <button onClick={() => handleStatusChange(r.id, nextAction)} className="bg-primary text-white py-1 px-3 text-xs rounded-md hover:bg-pink-700">
                                                            {nextAction === 'Approved' ? 'Approve' : `Mark as ${nextAction}`}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {isLoading && filteredReturns.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8">Loading returns...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {!isLoading && filteredReturns.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No return requests match the filter.</div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default ReturnsListPage;