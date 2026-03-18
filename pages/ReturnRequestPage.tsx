
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import ImageUploader from '../components/admin/ImageUploader.tsx';
import { BUCKETS } from '../constants.ts';
import SupabaseImage from '../components/shared/SupabaseImage';
import { CartItem } from '../types.ts';
import { useUserOrders } from '../services/api/user.api.ts';

const ReturnRequestPage: React.FC = () => {
  const { orderId, itemId } = useParams<{ orderId?: string, itemId?: string }>();
  const navigate = useNavigate();
  const { currentUser, submitReturnRequest, isLoading } = useAppContext();
  const { data: userOrders = [] } = useUserOrders(currentUser?.id);

  const order = useMemo(() => userOrders.find(o => o.id === orderId), [orderId, userOrders]);
  const itemToReturn = useMemo(() => {
    if (!order || !itemId) return undefined;

    // Try exact match first
    let item = order.items.find(i => i.id === itemId);
    if (item) return item;

    // Try decoded match
    const decodedId = decodeURIComponent(itemId);
    item = order.items.find(i => i.id === decodedId);
    if (item) return item;

    // Try legacy ID format with spaces (product.id -size -color )
    const parts = decodedId.split('-'); // This might be tricky if names have hyphens. 
    // Better strategy: iterate over all items and check if their "clean" version matches our "clean" version.
    // OR explicitly construct the legacy ID if we can parse the URL params.
    // But we only have `itemId`.

    // Let's normalize both sides for comparison
    const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
    const normalizedTarget = normalize(decodedId);

    item = order.items.find(i => normalize(i.id) === normalizedTarget);
    if (item) return item;

    // Try fallback for space encoding issues (replace + with space)
    const spaceDecodedId = itemId.replace(/\+/g, ' ');
    item = order.items.find(i => i.id === spaceDecodedId);

    return item;
  }, [order, itemId]);

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.hash.substring(1))}`);
    }
  }, [currentUser, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for your return.');
      return;
    }
    if (!orderId || !itemId) {
      setError('Missing order or item information.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitReturnRequest({
        orderId,
        itemId,
        reason,
        comments: details,
        images,
        type: 'refund' // Default to refund
      });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const returnReasons = [
    "Item is defective or damaged",
    "Received the wrong item",
    "Size is incorrect",
    "Product does not match description",
    "Changed my mind",
    "Other"
  ];

  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

  if (success) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Return Request Submitted</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Thank you! Your request has been received. Our team will review it and get back to you within 24-48 hours.</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">You can track the status in the "My Returns" section of your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order || !itemToReturn) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Request</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Could not find the item you are trying to return.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/70 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-6">Request a Return</h1>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
              <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={itemToReturn.product?.images?.[0] || itemToReturn.image} alt={itemToReturn.product?.name || itemToReturn.name} className="w-20 h-28 object-cover rounded-md" />
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">{itemToReturn.product?.name || itemToReturn.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order #{orderId}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Size: {itemToReturn.selectedSize} | Color: {itemToReturn.selectedColor?.name || itemToReturn.selectedColor}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Return *</label>
                <select id="reason" name="reason" value={reason} onChange={e => setReason(e.target.value)} required className={inputClasses}>
                  <option value="">-- Select a reason --</option>
                  {returnReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments (Optional)</label>
                <textarea id="details" name="details" rows={3} value={details} onChange={e => setDetails(e.target.value)} className={inputClasses} placeholder="e.g., The color was much brighter than the picture."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Photos (Optional)</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">If the item is damaged or incorrect, please upload photos.</p>
                <ImageUploader bucket={BUCKETS.REVIEW_IMAGES} pathPrefix={`returns/${orderId}`} images={images} onImageUpload={(path) => setImages(p => [...p, path])} onImageRemove={(path) => setImages(p => p.filter(img => img !== path))} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => navigate(`/order/${orderId}`)} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white py-2 px-6 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 disabled:bg-gray-400">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestPage;
