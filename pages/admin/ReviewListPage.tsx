
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Review, Product, UserProfile } from '../../types.ts';
import Rating from '../../components/Rating.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import CheckIcon from '../../components/icons/CheckIcon.tsx';
import XMarkIcon from '../../components/icons/XMarkIcon.tsx';
import SupabaseImage from '../../components/SupabaseImage.tsx';
import { BUCKETS } from '../../constants.ts';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import EditReviewModal from '../../components/admin/EditReviewModal.tsx';

const ReviewListPage: React.FC = () => {
    const { adminData, reviews, updateReviewStatus, deleteReview } = useAppContext();
    const users = adminData?.users || [];
    const products = adminData?.products || [];
    
    const [statusFilter, setStatusFilter] = useState<Review['status'] | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const filteredAndSortedReviews = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        let filtered = reviews
            .filter(review => statusFilter === 'all' || review.status === statusFilter)
            .filter(review => {
                if (!searchTerm) return true;
                const product = products.find(p => p.id === review.productId);
                return (
                    (review.author && review.author.toLowerCase().includes(lowerSearchTerm)) ||
                    (review.comment && review.comment.toLowerCase().includes(lowerSearchTerm)) ||
                    (product && product.name && product.name.toLowerCase().includes(lowerSearchTerm))
                );
            });
        
        const sorted = [...filtered].sort((a,b) => {
            switch(sortBy) {
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'rating-asc':
                    return a.rating - b.rating;
                case 'date-desc':
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
        
        return sorted;
    }, [reviews, statusFilter, searchTerm, sortBy, products]);
    
    const handleEditClick = (review: Review) => {
        setSelectedReview(review);
        setIsEditModalOpen(true);
    };

    const StatusBadge: React.FC<{ status: Review['status'] }> = ({ status }) => {
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
        <>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Review Moderation</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="rating-desc">Rating: High to Low</option>
                        <option value="rating-asc">Rating: Low to High</option>
                    </select>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    statusFilter === status ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedReviews.map(review => {
                            const product = products.find(p => p.id === review.productId);
                            const user = users.find(u => u.id === review.userId);
                            return (
                                <tr key={review.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product ? (
                                            <Link to={`/product/${product.id}`} target="_blank" className="flex items-center group">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                     <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={product.images[0]} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 group-hover:text-primary line-clamp-2">{product.name}</div>
                                                </div>
                                            </Link>
                                        ) : <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user ? (
                                            <Link to={`/admin/users/${user.id}`} className="text-sm text-gray-900 hover:text-primary font-medium">{user.name}</Link>
                                        ) : (
                                            <div className="text-sm text-gray-900">{review.author}</div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            {new Date(review.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <Rating rating={review.rating} />
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{review.comment}</p>
                                        {review.productImages.length > 0 && (
                                            <div className="mt-2 flex gap-1">
                                                {review.productImages.slice(0, 4).map((img, idx) => (
                                                    <SupabaseImage bucket={BUCKETS.REVIEW_IMAGES} key={idx} imagePath={img} alt="Review image" className="w-8 h-8 rounded object-cover" />
                                                ))}
                                                {review.productImages.length > 4 && (
                                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                        +{review.productImages.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={review.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => handleEditClick(review)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" aria-label="Edit">
                                                <PencilIcon className="h-5 w-5"/>
                                            </button>
                                            {review.status !== 'approved' && (
                                                <button onClick={() => updateReviewStatus(review.id, 'approved')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-full" aria-label="Approve">
                                                    <CheckIcon className="h-5 w-5"/>
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                 <button onClick={() => updateReviewStatus(review.id, 'rejected')} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-full" aria-label="Reject">
                                                    <XMarkIcon className="h-5 w-5"/>
                                                </button>
                                            )}
                                            <button onClick={() => deleteReview(review.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label="Delete">
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredAndSortedReviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No reviews match the current filter.
                    </div>
                )}
            </div>
        </div>
        <EditReviewModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            review={selectedReview}
        />
        </>
    );
};

export default ReviewListPage;
