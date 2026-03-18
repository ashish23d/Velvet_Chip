import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { useAdminPaginatedUsers } from '../../services/api/admin.api'; // Paginated Hook
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import UserCard from '../../components/admin/UserCard.tsx';
import { UserProfile } from '../../types.ts';
import Avatar from '../../components/profile/Avatar';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import LockClosedIcon from '../../components/icons/LockClosedIcon.tsx';
import LockOpenIcon from '../../components/icons/LockOpenIcon.tsx';
import ArrowUpTrayIcon from '../../components/icons/ArrowUpTrayIcon.tsx';
import ArrowDownTrayIcon from '../../components/icons/ArrowDownTrayIcon.tsx';
import Pagination from '../../components/shared/Pagination';

const UserListPage: React.FC = () => {
    const { currentUser, updateUserStatus, adminChangeUserRole } = useAppContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [sortBy, setSortBy] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Use Paginated API Hook
    const { data: usersResponse, isLoading } = useAdminPaginatedUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
    });

    const users = (usersResponse?.data || []) as UserProfile[];
    const totalUsers = usersResponse?.count || 0;
    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    const { currentAdmin, otherAdmins, customers } = useMemo(() => {
        let filtered = users
            .filter(user => statusFilter === 'all' || (user.status || 'active') === statusFilter);

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'date-desc':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case 'name-asc':
                default:
                    return (a.name || '').localeCompare(b.name || '');
            }
        });

        const currentAdmin = sorted.find(u => u.id === currentUser?.id);
        const otherAdmins = sorted.filter(u => u.role === 'admin' && u.id !== currentUser?.id);
        const customers = sorted.filter(u => u.role !== 'admin');

        return { currentAdmin, otherAdmins, customers };
    }, [users, statusFilter, sortBy, currentUser]);

    // Reset pagination when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortBy]);

    const handleToggleStatus = (user: UserProfile) => {
        const newStatus = (user.status || 'active') === 'blocked' ? 'active' : 'blocked';
        updateUserStatus(user.id, newStatus);
    };

    const StatusBadge: React.FC<{ status: 'active' | 'blocked' | undefined | null }> = ({ status }) => {
        const currentStatus = status || 'active';
        const styles = {
            active: 'bg-green-100 text-green-800',
            blocked: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[currentStatus]}`}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
        );
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                        <option value="name-asc">Name: A-Z</option>
                        <option value="name-desc">Name: Z-A</option>
                        <option value="date-desc">Newest Users</option>
                    </select>
                    {currentUser?.role?.includes('admin') && (
                        <Link
                            to="/admin/users/new"
                            className="flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 transition-colors flex-shrink-0"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Create User
                        </Link>
                    )}
                </div>
            </div>

            {/* Current Admin Section */}
            {currentAdmin && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <UserCard user={currentAdmin} />
                    </div>
                </div>
            )}


            {/* Other Administrators Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Other Administrators ({otherAdmins.length})</h2>
                {otherAdmins.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {otherAdmins.map(user => <UserCard key={user.id} user={user} />)}
                        </div>
                        {otherAdmins.length > 0 && (
                            <div className="mt-6 text-center text-sm text-gray-500">
                                Showing top {otherAdmins.length} administrators on this page.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500">
                        No other administrators found.
                    </div>
                )}
            </div>

            {/* Customers Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Customers ({customers.length})</h2>
                {customers.length > 0 ? (
                    <>
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registered
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8">Loading users...</td>
                                            </tr>
                                        ) : customers.map(user => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <Avatar user={user} className="h-10 w-10 rounded-full" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                <Link to={`/admin/users/${user.id}`} className="hover:text-primary">{user.name}</Link>
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">ID: {user.id.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{user.mobile || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={user.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/admin/users/edit/${user.id}`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" title="Edit User">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </Link>
                                                        <button onClick={() => handleToggleStatus(user)} className="p-2 text-gray-400 rounded-full" title={user.status === 'blocked' ? 'Unblock user' : 'Block user'}>
                                                            {user.status === 'blocked' ? <LockOpenIcon className="h-5 w-5 text-green-500 hover:text-green-700" /> : <LockClosedIcon className="h-5 w-5 text-red-500 hover:text-red-700" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500">
                        {searchTerm || statusFilter !== 'all' ? 'No customers match your filters.' : 'No customers found.'}
                    </div>
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

export default UserListPage;
