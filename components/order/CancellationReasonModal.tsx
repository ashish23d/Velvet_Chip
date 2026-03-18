import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CancellationReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, comments?: string) => void;
    isLoading?: boolean;
}

const CANCELLATION_REASONS = [
    'Changed my mind / No longer needed',
    'Found a better price elsewhere',
    'Ordered the wrong item / Incorrect size-color',
    'Expected delivery date is too long',
    'Duplicate order',
    'Other (please specify)'
];

const CancellationReasonModal: React.FC<CancellationReasonModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [comments, setComments] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReason) return;
        onConfirm(selectedReason, comments);
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Why do you want to cancel this order?
                                </label>
                                <div className="space-y-2">
                                    {CANCELLATION_REASONS.map((reason) => (
                                        <label key={reason} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-gray-200">
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={reason}
                                                checked={selectedReason === reason}
                                                onChange={(e) => setSelectedReason(e.target.value)}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                                required
                                            />
                                            <span className="ml-3 text-sm text-gray-700">{reason}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedReason === 'Other (please specify)' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Please specify
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
                                        rows={3}
                                        required
                                        placeholder="Enter your reason here..."
                                    />
                                </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                                <p className="text-xs text-blue-700">
                                    <strong>Note:</strong> If you've already paid online, the refund will be processed to your original payment method within 3-5 business days.
                                </p>
                            </div>

                            <div className="mt-5 sm:mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={isLoading}
                                >
                                    Go Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                                    disabled={!selectedReason || isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationReasonModal;
