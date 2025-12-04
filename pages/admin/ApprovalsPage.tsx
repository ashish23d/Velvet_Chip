



import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { PendingChange } from '../../types.ts';
import CheckIcon from '../../components/icons/CheckIcon.tsx';
import XMarkIcon from '../../components/icons/XMarkIcon.tsx';

const ApprovalsPage: React.FC = () => {
    const { getPendingChanges, approveChange, rejectChange } = useAppContext();
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');

    const changes = useMemo(() => {
        const allChanges = getPendingChanges().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filter === 'pending') {
            return allChanges.filter(c => c.status === 'pending');
        }
        return allChanges;
    }, [filter, getPendingChanges]);
    
    const StatusBadge: React.FC<{ status: PendingChange['status'] }> = ({ status }) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Approval Queue</h1>
                 <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    {(['pending', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                filter === f ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f === 'pending' ? 'Pending' : 'Show All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {changes.map(change => (
                            <tr key={change.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{change.description}</div>
                                    <div className="text-xs text-gray-500">{change.type}</div>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.author_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(change.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={change.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {change.status === 'pending' ? (
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => approveChange(change.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-full" aria-label="Approve">
                                                <CheckIcon className="h-5 w-5"/>
                                            </button>
                                            <button onClick={() => rejectChange(change.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label="Reject">
                                                <XMarkIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Actioned</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {changes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {filter === 'pending' ? 'The approval queue is empty.' : 'No changes found.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalsPage;