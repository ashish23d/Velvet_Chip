import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { ContactSubmission } from '../../types.ts';

const InboxPage: React.FC = () => {
    const { getAllContactSubmissions, updateContactSubmissionStatus } = useAppContext();
    const submissions = getAllContactSubmissions();
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const filteredSubmissions = useMemo(() => {
        let filtered = submissions.filter(s => statusFilter === 'all' || s.status === statusFilter);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
            case 'today':
                filtered = filtered.filter(s => new Date(s.createdAt) >= today);
                break;
            case 'week': {
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Assuming week starts on Sunday
                filtered = filtered.filter(s => new Date(s.createdAt) >= firstDayOfWeek);
                break;
            }
            case 'month': {
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                filtered = filtered.filter(s => new Date(s.createdAt) >= firstDayOfMonth);
                break;
            }
            case 'custom': {
                const start = customStartDate ? new Date(customStartDate) : null;
                const end = customEndDate ? new Date(customEndDate) : null;
                if(start) start.setHours(0,0,0,0);
                if(end) end.setHours(23,59,59,999);
                
                filtered = filtered.filter(s => {
                    const submissionDate = new Date(s.createdAt);
                    if (start && end) return submissionDate >= start && submissionDate <= end;
                    if (start) return submissionDate >= start;
                    if (end) return submissionDate <= end;
                    return true;
                });
                break;
            }
            case 'all':
            default:
                break;
        }

        return filtered;
    }, [submissions, statusFilter, dateFilter, customStartDate, customEndDate]);

    const handleStatusChange = (id: number, status: ContactSubmission['status']) => {
        updateContactSubmissionStatus(id, status);
    };

    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return 'Date not available';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const StatusBadge: React.FC<{ status: ContactSubmission['status'] }> = ({ status }) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800',
            read: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        {(['all', 'new', 'read', 'resolved'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    statusFilter === f ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                    <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        {(['all', 'today', 'week', 'month', 'custom'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setDateFilter(f)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    dateFilter === f ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'
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

            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubmissions.map(submission => (
                            <tr key={submission.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                                    <div className="text-sm text-gray-500">{submission.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 line-clamp-2">{submission.message}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(submission.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={submission.status}
                                        onChange={(e) => handleStatusChange(submission.id, e.target.value as ContactSubmission['status'])}
                                        className="text-xs p-1 rounded-md border-gray-300 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="new">New</option>
                                        <option value="read">Read</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {submissions.length > 0 ? 'No messages match your filters.' : 'Your inbox is empty.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxPage;