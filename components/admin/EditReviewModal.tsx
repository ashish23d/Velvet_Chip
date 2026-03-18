import React, { useState, useEffect } from 'react';
import { Review } from '../../types.ts';
import { useAppContext } from '../../context/AppContext.tsx';
import XIcon from '../icons/XIcon.tsx';
import SupabaseImage from '../shared/SupabaseImage';
import TrashIcon from '../icons/TrashIcon.tsx';
import { BUCKETS } from '../../constants.ts';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({ isOpen, onClose, review }) => {
  const { adminUpdateReview, adminDeleteReviewImage, showConfirmationModal } = useAppContext();
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (review) {
      setComment(review.comment);
      setStatus(review.status);
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedReview = { ...review, comment, status };
      await adminUpdateReview(updatedReview);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update review.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (imagePath: string) => {
    showConfirmationModal({
        title: 'Delete Image',
        message: 'Are you sure you want to delete this image? This cannot be undone.',
        onConfirm: async () => {
            try {
                await adminDeleteReviewImage(review.id, imagePath);
            } catch (err: any) {
                setError(err.message || 'Failed to delete image.');
                throw err;
            }
        },
        confirmText: 'Delete Image',
        isDestructive: true,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-gray-800">Edit Review by {review.author}</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 flex-grow overflow-y-auto">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Review['status'])}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Photos</label>
              {review.productImages.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {review.productImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <SupabaseImage bucket={BUCKETS.REVIEW_IMAGES} imagePath={img} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                        <button
                          onClick={() => handleDeleteImage(img)}
                          className="p-2 bg-white/80 text-red-500 rounded-full hover:bg-white"
                          aria-label="Remove image"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No photos were submitted with this review.</p>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        
        <div className="p-4 flex-shrink-0 flex justify-end gap-3 border-t bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditReviewModal;