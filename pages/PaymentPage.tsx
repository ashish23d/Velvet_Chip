
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import OrderSummary from '../components/OrderSummary.tsx';
import CreditCardIcon from '../components/icons/CreditCardIcon.tsx';
import UpiIcon from '../components/icons/UpiIcon.tsx';
import WalletIcon from '../components/icons/WalletIcon.tsx';
import BankIcon from '../components/icons/BankIcon.tsx';
import VisaIcon from '../components/icons/VisaIcon.tsx';
import MastercardIcon from '../components/icons/MastercardIcon.tsx';
import QrCodeIcon from '../components/icons/QrCodeIcon.tsx';
import PaymentProcessingAnimation from '../components/PaymentProcessingAnimation.tsx';
import PaymentSuccessAnimation from '../components/PaymentSuccessAnimation.tsx';
import { loadRazorpayScript, openRazorpayCheckout } from '../services/razorpayService.ts';

type PaymentTab = 'card' | 'upi' | 'wallet' | 'netbanking' | 'cod';

const PaymentPage: React.FC = () => {
  const { cart, placeOrder, checkoutState, currentUser, paymentSettings, siteSettings, deliverySettings, taxSettings, categories } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PaymentTab>('card');
  const [deliveryMethod, setDeliveryMethod] = useState<'partner' | 'pickup'>('partner');

  // Check if pickup is available for the selected address
  const isPickupAvailable = useMemo(() => {
    if (!checkoutState.selectedAddressId || !currentUser?.addresses || !deliverySettings?.store_city) return false;
    const address = currentUser.addresses.find(a => a.id === checkoutState.selectedAddressId);
    if (!address) return false;

    // Normalize comparison
    return address.city.trim().toLowerCase() === deliverySettings.store_city.trim().toLowerCase();
  }, [checkoutState.selectedAddressId, currentUser?.addresses, deliverySettings]);

  // Reset to partner delivery if pickup becomes unavailable or new address selected
  useEffect(() => {
    if (!isPickupAvailable && deliveryMethod === 'pickup') {
      setDeliveryMethod('partner');
    }
  }, [isPickupAvailable]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDemoProcessing, setIsDemoProcessing] = useState(false); // New state for demo flow
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const totalAmount = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // Tax Calculation
    let taxAmount = 0;
    if (taxSettings && taxSettings.enabled) {
      if (taxSettings.mode === 'global') {
        const rate = taxSettings.global_rate || 0;
        taxAmount = (subtotal * rate) / 100;
      } else if (taxSettings.mode === 'category') {
        cart.forEach(item => {
          const productCategory = categories.find(c => c.name === item.product.category);
          const rate = productCategory?.tax_rate || 0;
          taxAmount += (item.product.price * item.quantity * rate) / 100;
        });
      }
    }

    const deliveryCharge = (deliveryMethod === 'pickup') ? 0 : (subtotal > 499 ? 0 : 50);
    return (subtotal - checkoutState.discount) + taxAmount + deliveryCharge;
  }, [cart, checkoutState.discount, deliveryMethod, taxSettings, categories]);

  // ... (useEffect logic)

  useEffect(() => {
    // Redirect if cart is empty or address not selected
    if (completedOrderId) return;

    if (!currentUser || cart.length === 0 || !checkoutState.selectedAddressId) {
      if (!isProcessing && !isDemoProcessing && !isPlacingOrder) { // Check demo flag too
        console.log("Redirecting to cart (empty/no address)");
        navigate('/cart', { replace: true });
      }
    }
  }, [currentUser, cart, checkoutState, navigate, isProcessing, isDemoProcessing, isPlacingOrder, completedOrderId]);

  // ...

  const handlePayment = async () => {
    setError(null);

    // Capture cart snapshot
    const cartSnapshot = [...cart];

    // Handle Cash on Delivery
    if (activeTab === 'cod') {
      // ... existing COD logic ...
      setIsPlacingOrder(true);
      try {
        const pickupCode = deliveryMethod === 'pickup' ? Math.floor(100000 + Math.random() * 900000).toString() : undefined;
        // call placeOrder
        const newOrderId = await placeOrder('COD', cartSnapshot, { type: deliveryMethod, pickupCode });
        // ...
        setIsPlacingOrder(false);
      } catch (err: any) {
        setError(err.message);
        setIsPlacingOrder(false);
      }
      return;
    }

    // Handle Online Payments with Razorpay
    if (paymentSettings?.razorpay_enabled && paymentSettings.razorpay_key_id) {
      try {
        setIsProcessing(true); // Generic processing (no demo animation)

        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setError('Failed to load payment gateway.');
          setIsProcessing(false);
          return;
        }

        const options = {
          // ... options
          key: paymentSettings.razorpay_key_id,
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          name: siteSettings?.textLogo || 'VelvetChip',
          description: `Order Payment`,
          handler: async function (response: any) {
            try {
              setIsProcessing(true); // Keep processing true while verifying/placing order
              const pickupCode = deliveryMethod === 'pickup' ? Math.floor(100000 + Math.random() * 900000).toString() : undefined;

              const newOrderId = await placeOrder('Online', cartSnapshot, {
                type: deliveryMethod,
                pickupCode,
                paymentId: response.razorpay_payment_id // Optionally pass payment ID if placeOrder supports it
              });

              if (newOrderId) {
                setCompletedOrderId(newOrderId);
                setShowSuccessAnimation(true);
                // We keep isProcessing true until animation takes over? 
                // No, generic loader should hide so animation can show.
                setIsProcessing(false);
              } else {
                throw new Error("Order placement failed after payment.");
              }
            } catch (err: any) {
              console.error("Payment Handler Error:", err);
              setError('Order placement failed. Please contact support if amount was deducted. Error: ' + (err.message || 'Unknown'));
              setIsProcessing(false);
            }
          },
          // ... rest of options
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setError('Payment cancelled by user');
            }
          }
        };

        openRazorpayCheckout(options);
      } catch (err: any) {
        setError('Payment failed: ' + err.message);
        setIsProcessing(false);
      }
    } else {
      // Fallback: Show demo animation
      setIsDemoProcessing(true); // Use Demo flag
    }
  };

  const onAnimationComplete = async () => {
    try {
      const pickupCode = deliveryMethod === 'pickup' ? Math.floor(100000 + Math.random() * 900000).toString() : undefined;
      const newOrderId = await placeOrder('Online', undefined, { type: deliveryMethod, pickupCode });

      if (newOrderId) {
        setCompletedOrderId(newOrderId); // Set this so we don't redirect
        navigate(`/order/${newOrderId}`); // Actually navigate is redundant if we show success animation, but maybe okay
        // Actually for demo, we can just navigate directly
      } else {
        setIsDemoProcessing(false);
        setError('Order error.');
      }
    } catch (err: any) {
      setIsDemoProcessing(false);
      setError(err.message);
    }
  };

  const paymentTabs = [
    { id: 'card', label: 'Card', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'upi', label: 'UPI', icon: <UpiIcon className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallets', icon: <WalletIcon className="w-5 h-5" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <BankIcon className="w-5 h-5" /> },
    { id: 'cod', label: 'Cash on Delivery', icon: <span className="font-bold text-lg">₹</span> },
  ];

  const renderActiveTabContent = () => {
    const containerClasses = "text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg";
    const textClasses = "mt-2 text-sm text-gray-600 dark:text-gray-300";
    const headingClasses = "text-lg font-semibold text-gray-800 dark:text-white";

    switch (activeTab) {
      case 'card':
        return (
          <div className={containerClasses}>
            <div className="flex justify-center gap-4 mb-4">
              <VisaIcon className="h-8" />
              <MastercardIcon className="h-8" />
            </div>
            <h3 className={headingClasses}>Credit / Debit Card</h3>
            <p className={textClasses}>You will be redirected to our secure payment partner to complete your payment.</p>
          </div>
        );
      case 'upi':
        return (
          <div className={containerClasses}>
            <QrCodeIcon className="w-16 h-16 mx-auto mb-4 text-gray-800 dark:text-white" />
            <h3 className={headingClasses}>UPI Payment</h3>
            <p className={textClasses}>Pay securely using GPay, PhonePe, Paytm or any UPI App.</p>
          </div>
        );
      case 'wallet':
        return (
          <div className={containerClasses}>
            <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-800 dark:text-white" />
            <h3 className={headingClasses}>Wallets</h3>
            <p className={textClasses}>Pay using popular digital wallets.</p>
          </div>
        );
      case 'netbanking':
        return (
          <div className={containerClasses}>
            <BankIcon className="w-16 h-16 mx-auto mb-4 text-gray-800 dark:text-white" />
            <h3 className={headingClasses}>Net Banking</h3>
            <p className={textClasses}>Select from all major banks to pay securely.</p>
          </div>
        );
      case 'cod':
        return (
          <div className={containerClasses}>
            <span className="text-4xl font-bold text-gray-800 dark:text-white block mb-2">₹</span>
            <h3 className={headingClasses}>Pay on Delivery</h3>
            <p className={textClasses}>You can pay in cash to our courier partner at the time of delivery. No online payment is required.</p>
          </div>
        );
      default:
        return null;
    }
  }

  const ctaDisabled = isPlacingOrder;
  const ctaText = useMemo(() => {
    if (isPlacingOrder) return 'Placing Order...';
    if (activeTab === 'cod') return 'Confirm Order';
    return `Pay ₹${totalAmount.toLocaleString()}`;
  }, [isPlacingOrder, activeTab, totalAmount]);

  return (
    <>
      <PaymentProcessingAnimation isOpen={isDemoProcessing} onComplete={onAnimationComplete} />

      {/* Generic Loading Overlay for Razorpay/Real processing */}
      {isProcessing && !isDemoProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium text-gray-800">Processing secure payment...</p>
            <p className="text-sm text-gray-500">Please do not close this window.</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-6">
          Payment & Delivery
        </h1>
        {isPickupAvailable && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">Store Pickup Available</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">You can pick up your order from our store in {deliverySettings?.store_city} and save shipping charges.</p>
            </div>
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-blue-100 dark:border-gray-700">
              <button
                onClick={() => setDeliveryMethod('partner')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMethod === 'partner' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}
              >
                Delivery
              </button>
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deliveryMethod === 'pickup' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}
              >
                Pickup
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          {/* Payment Selection */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex">
            {/* Vertical Tabs */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-l-lg">
              {paymentTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PaymentTab)}
                  className={`w-full flex items-center gap-3 p-4 text-left text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-r-2 border-primary dark:bg-primary/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="w-2/3 p-6">
              {renderActiveTabContent()}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              ctaText={ctaText}
              onClick={handlePayment}
              disabled={ctaDisabled}
              isPaymentPage={true}
            />
            {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}
          </div>
        </div>

        {/* Show success animation after payment */}
        {showSuccessAnimation && completedOrderId && (
          <PaymentSuccessAnimation orderId={completedOrderId} />
        )}
      </div>
    </>
  );
};

export default PaymentPage;
