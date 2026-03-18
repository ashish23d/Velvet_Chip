
import React from 'react';
import ShoppingBagIcon from '../icons/ShoppingBagIcon';
import MapPinIcon from '../icons/MapPinIcon';
import CreditCardIcon from '../icons/CreditCardIcon';

interface CheckoutStepperProps {
  currentStep: 'cart' | 'address' | 'payment';
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 'cart', name: 'Cart', icon: ShoppingBagIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Checkout progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex;
          const isCurrent = stepIdx === currentStepIndex;
          const Icon = step.icon;
          
          return (
            <li key={step.name} className="relative flex-1 flex items-center justify-center">
               {/* Connecting Line */}
              {stepIdx < steps.length - 1 ? (
                <div 
                  className={`absolute left-1/2 top-1/2 -translate-y-1/2 w-full h-0.5 ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`} 
                  aria-hidden="true" 
                />
              ) : null}

              <div className="relative flex flex-col items-center gap-2 z-10 p-2">
                 <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isCurrent ? 'bg-primary' : isCompleted ? 'bg-primary' : 'bg-gray-300'}`}>
                    <Icon className={`h-6 w-6 ${isCurrent || isCompleted ? 'text-white' : 'text-white'}`} />
                 </div>
                 <p className={`text-xs sm:text-sm font-medium ${isCurrent ? 'text-primary' : 'text-gray-500'}`}>
                   {step.name}
                 </p>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  );
};

export default CheckoutStepper;