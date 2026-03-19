import React, { useState } from 'react';
import { Product, User, Review } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import XIcon from '../components/icons/XIcon.tsx';
import SupabaseImage from '../components/shared/SupabaseImage';
import ImageUploader from '../components/admin/ImageUploader.tsx';
import { BUCKETS } from '../constants.ts';
import StarRatingInput from '../components/product/StarRatingInput';
import ThankYouModal from '../components/shared/ThankYouModal';
import { sanitizeString } from '../utils/sanitization';

interface ReviewProductPageProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const ReviewProductPage: React.FC<ReviewProductPageProps> = ({ isOpen, onClose, product }) => {
  const { currentUser, addReview, updateUserReview } = useAppContext();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const currentUserReview = (product as any).currentUserReview;
  const isEditMode = !!currentUserReview;

  React.useEffect(() => {
    if (currentUserReview) {
      setRating(currentUserReview.rating);
      setComment(currentUserReview.comment || '');
      setUploadedImages(currentUserReview.productImages || []);
    }
  }, [currentUserReview]);

  const resetForm = () => {
    setRating(0);
    setComment('');
    setUploadedImages([]);
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to leave a review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const sanitizedComment = sanitizeString(comment);

      if (isEditMode) {
        await updateUserReview(currentUserReview.id, {
          rating,
          comment: sanitizedComment,
          productImages: uploadedImages
        });
      } else {
        const reviewData: Omit<Review, 'id' | 'date' | 'status'> = {
          productId: product.id,
          userId: currentUser.id,
          author: currentUser.name,
          rating: rating,
          comment: sanitizedComment,
          userImage: currentUser.avatar || '',
          productImages: uploadedImages,
        };
        await addReview(reviewData);
      }

      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        handleClose();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-white z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-page-title"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 id="review-page-title" className="text-2xl font-serif text-gray-800">{isEditMode ? 'Edit Review' : 'Review Product'}</h1>
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <SupabaseImage
              bucket={BUCKETS.PRODUCTS}
              imagePath={product.images[0]}
              alt={product.name}
              className="w-20 h-28 object-cover rounded-md"
            />
            <div>
              <h2 className="font-semibold text-gray-800">{product.name}</h2>
              <p className="text-sm text-gray-500">{product.category ? product.category.replace('-', ' ') : 'Uncategorized'}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Media Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Add Photos</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Upload photos related to the product like unboxing, wearing the dress, etc. (Up to 5 photos, max 5MB each).
              </p>
              {currentUser && (
                <ImageUploader
                  bucket={BUCKETS.REVIEW_IMAGES}
                  pathPrefix={`user_${currentUser.id}/prod_${product.id}`}
                  images={uploadedImages}
                  onImageUpload={(path) => setUploadedImages(prev => [...prev, path])}
                  onImageRemove={(path) => setUploadedImages(prev => prev.filter(p => p !== path))}
                />
              )}
            </div>

            {/* Written Review */}
            <div>
              <label htmlFor="comment" className="block text-lg font-semibold text-gray-700 mb-2">Write a Review</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="How was your experience with the product?"
              />
            </div>

            {/* Star Rating */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Rate the Product *</h3>
              {isEditMode && <p className="text-xs text-gray-500 mb-2">Rating cannot be changed while editing.</p>}
              <StarRatingInput rating={rating} setRating={setRating} readOnly={isEditMode} />
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleSkip}
                className="py-2 px-6 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-6 bg-primary text-white rounded-md font-semibold hover:bg-pink-700 transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Review' : 'Continue')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ThankYouModal isOpen={showThankYou} />
    </>
  );
};

export default ReviewProductPage;
