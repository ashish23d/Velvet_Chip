import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Avatar from '../../components/profile/Avatar';
import { useAdminUserById, useAdminOrdersByUserId } from '../../services/api/admin.api';

const UserDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const { data: user, isLoading: isUserLoading } = useAdminUserById(id);
    const { data: userOrdersData, isLoading: isOrdersLoading } = useAdminOrdersByUserId(id);

    if (isUserLoading || isOrdersLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading user details...</p>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center p-10">User not found.</div>;
    }

    const userOrders = userOrdersData || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
                <Link to="/admin/users" className="text-sm font-medium text-primary hover:underline">&larr; Back to Users</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex flex-col items-center text-center">
                            <Avatar user={user} className="h-24 w-24 rounded-full object-cover mb-4" />
                            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email || user.mobile}</p>
                            <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {user.status || 'Active'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h3>
                        <div className="space-y-4">
                            {(user.addresses && user.addresses.length > 0) ? user.addresses.map(addr => (
                                <div key={addr.id} className="p-3 border rounded-md text-xs">
                                    <p className="font-bold">{addr.name} {addr.isDefault && <span className="text-green-600">(Default)</span>}</p>
                                    <p>{addr.address}, {addr.city}</p>
                                </div>
                            )) : <p className="text-sm text-gray-500">No saved addresses.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {userOrders.length > 0 ? userOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-primary">{order.id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm font-semibold">₹{order.totalAmount}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${{
                                                    Delivered: 'bg-green-100 text-green-800',
                                                    Shipped: 'bg-blue-100 text-blue-800',
                                                    'Out for Delivery': 'bg-blue-100 text-blue-800',
                                                    Processing: 'bg-yellow-100 text-yellow-800',
                                                    Cancelled: 'bg-red-100 text-red-800',
                                                    'Cancelled by User': 'bg-red-100 text-red-800'
                                                }[order.currentStatus] || 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.currentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:underline">View</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">This user has not placed any orders.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;