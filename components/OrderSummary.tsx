import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CartItem } from '../types';
import { useAppContext } from '../context/AppContext.tsx';

interface OrderSummaryProps {
  cart: CartItem[];
  ctaText: string;
  ctaLink?: string;
  onClick?: () => void;
  disabled?: boolean;
  isPaymentPage?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, ctaText, ctaLink, onClick, disabled = false, isPaymentPage = false }) => {
  const { checkoutState, applyPromotion, removePromotion } = useAppContext();
  const { appliedPromotion, discount } = checkoutState;
  
  const [promotionCode, setPromotionCode] = useState('');
  const [promotionError, setPromotionError] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalMrp = cart.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalDiscount = totalMrp - subtotal;
  const deliveryCharge = subtotal > 499 ? 0 : 50;
  const totalAmount = (subtotal - discount) + deliveryCharge;

  const CtaComponent = onClick || disabled ? 'button' : ReactRouterDOM.Link;

  const ctaProps = {
    ...(!onClick && !disabled && ctaLink && { to: ctaLink }),
    ...(onClick && { onClick: onClick }),
    disabled: disabled,
    className: `w-full block text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
      disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-primary text-white hover:bg-pink-700'
    }`
  };
  
  const handleApplyPromotion = async () => {
    if (!promotionCode) return;
    setPromotionError(null);
    try {
        await applyPromotion(promotionCode);
        setPromotionCode('');
    } catch (err: any) {
        setPromotionError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
        Order Summary
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
          <span className="font-medium text-gray-800">₹{subtotal.toLocaleString()}</span>
        </div>
        {totalDiscount > 0 && (
            <div className="flex justify-between">
            <span className="text-gray-600">You Saved</span>
            <span className="font-medium text-green-600">- ₹{totalDiscount.toLocaleString()}</span>
            </div>
        )}
        {appliedPromotion && (
            <div className="flex justify-between items-center bg-green-50 p-2 rounded-md">
                <span className="text-green-700">Promotion "{appliedPromotion.code}"</span>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-green-700">- ₹{discount.toFixed(2)}</span>
                    {!isPaymentPage && (
                      <button onClick={removePromotion} className="text-red-500 text-xs hover:underline">[Remove]</button>
                    )}
                </div>
            </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charges</span>
          <span className="font-medium text-gray-800">{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge.toLocaleString()}`}</span>
        </div>
      </div>
      
      {!isPaymentPage && (
        <div className="border-t mt-4 pt-4">
            <label htmlFor="promotion" className="text-sm font-medium text-gray-700">Have a promotion code?</label>
            <div className="mt-1 flex gap-2">
                <input
                    type="text"
                    id="promotion"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    placeholder="Enter Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                    onClick={handleApplyPromotion}
                    disabled={!promotionCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                    Apply
                </button>
            </div>
            {promotionError && <p className="text-red-500 text-xs mt-1">{promotionError}</p>}
        </div>
      )}

      <div className="border-t mt-4 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-bold text-gray-900">Total Amount</span>
          <span className="text-xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-6">
        <CtaComponent {...ctaProps}>
          {ctaText}
        </CtaComponent>
      </div>
    </div>
  );
};

export default OrderSummary;