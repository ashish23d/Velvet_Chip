
import React from 'react';
import { XMarkIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { ContactDetails } from '../../types';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactDetails: ContactDetails;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, contactDetails }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Need Help?</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm">
                        If you have any issues with your order, please contact our support team. We are here to help!
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <PhoneIcon className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Phone Support</p>
                                <a href={`tel:${contactDetails.phone}`} className="text-primary hover:underline font-semibold">{contactDetails.phone}</a>
                                <p className="text-xs text-gray-500 mt-1">Available Mon-Sat, 9am - 7pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <EnvelopeIcon className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email Support</p>
                                <a href={`mailto:${contactDetails.email}`} className="text-primary hover:underline font-semibold">{contactDetails.email}</a>
                                <p className="text-xs text-gray-500 mt-1">We usually respond within 24 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 text-center">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Close</button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
