import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentSuccessAnimationProps {
    orderId: string;
}

const PaymentSuccessAnimation: React.FC<PaymentSuccessAnimationProps> = ({ orderId }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to profile orders page after 5 seconds
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                {/* Success Animation */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        {/* Outer circle animation */}
                        <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>

                        {/* Main circle with checkmark */}
                        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                            <svg
                                className="w-12 h-12 text-white animate-draw-check"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                    className="checkmark-path"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Successful!
                </h2>
                <p className="text-gray-600 mb-1">
                    Your order has been placed successfully
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    Order ID: {orderId}
                </p>

                {/* Loading indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="ml-2">Redirecting to your orders...</span>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes draw-check {
                    0% {
                        stroke-dasharray: 0, 100;
                    }
                    100% {
                        stroke-dasharray: 100, 0;
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.5s ease-out;
                }

                .animate-draw-check {
                    animation: draw-check 0.5s ease-out 0.3s both;
                }

                .checkmark-path {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccessAnimation;
