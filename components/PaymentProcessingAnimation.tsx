import React, { useState, useEffect } from 'react';

interface PaymentProcessingAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
}

const PaymentProcessingAnimation: React.FC<PaymentProcessingAnimationProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<'connecting' | 'processing' | 'success' | 'idle'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStep('connecting');
      const t1 = setTimeout(() => setStep('processing'), 2000);
      const t2 = setTimeout(() => setStep('success'), 4500);
      const t3 = setTimeout(onComplete, 6000);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
        setStep('idle');
    }
  }, [isOpen, onComplete]);

  if (!isOpen) {
    return null;
  }
  
  const AnimatedCheckmark = () => (
      <svg className="w-24 h-24" viewBox="0 0 52 52">
        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" stroke="#4CAF50" strokeWidth="3" />
        <path className="checkmark-check" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" d="M14 27l6 6 15-15" />
      </svg>
  );

  const renderContent = () => {
    switch (step) {
      case 'connecting':
        return (
          <>
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">Connecting securely...</p>
          </>
        );
      case 'processing':
        return (
          <>
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">Processing payment...</p>
            <p className="text-sm text-gray-500">Please do not refresh or close the page.</p>
          </>
        );
      case 'success':
        return (
          <>
            <AnimatedCheckmark />
            <p className="mt-4 text-xl font-semibold text-green-600">Payment Successful!</p>
            <p className="text-gray-600">Redirecting to confirmation...</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentProcessingAnimation;
