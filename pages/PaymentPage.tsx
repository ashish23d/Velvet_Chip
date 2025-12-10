
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
  const { cart, placeOrder, checkoutState, currentUser, paymentSettings, siteSettings } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PaymentTab>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Form state for credit card
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | null>(null);

  // Validate cart on page load
  useEffect(() => {
    console.log('🔍 PaymentPage mounted');
    console.log('📦 Cart on mount:', cart);
    console.log('🔢 Cart length on mount:', cart.length);
    console.log('👤 Current user:', currentUser);

    if (!currentUser) {
      console.error('❌ User not logged in!');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      console.error('❌ Cart is empty on payment page! Redirecting to cart...');
      setError('Your cart is empty. Please add items before proceeding to payment.');
      setTimeout(() => navigate('/cart'), 2000);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Redirect if cart is empty or address not selected
    // BUT only if we're not currently processing a payment
    if (!currentUser || cart.length === 0 || !checkoutState.selectedAddressId) {
      // Don't redirect if we're in the middle of placing an order
      if (!isProcessing && !isPlacingOrder) {
        navigate('/cart');
      }
    }
  }, [currentUser, cart, checkoutState, navigate, isProcessing, isPlacingOrder]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('4')) {
      setCardType('visa');
    } else if (value.startsWith('5')) {
      setCardType('mastercard');
    } else {
      setCardType(null);
    }
    setCardNumber(value.replace(/(.{4})/g, '$1 ').trim().slice(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiryDate(value.slice(0, 5));
  };

  const totalAmount = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const deliveryCharge = subtotal > 499 ? 0 : 50;
    return (subtotal - checkoutState.discount) + deliveryCharge;
  }, [cart, checkoutState.discount]);


  const handlePayment = async () => {
    setError(null);

    // Capture cart snapshot at the time of payment initiation
    const cartSnapshot = [...cart];
    console.log('📸 Cart snapshot for payment:', cartSnapshot);
    console.log('🔢 Snapshot length:', cartSnapshot.length);

    // Handle Cash on Delivery
    if (activeTab === 'cod') {
      setIsPlacingOrder(true);
      try {
        console.log('💵 COD payment - passing cart snapshot');
        const newOrderId = await placeOrder('COD', cartSnapshot);
        if (newOrderId) {
          navigate(`/order-confirmation/${newOrderId}`);
        } else {
          setError('Failed to place order. Please try again.');
        }
      } catch (err: any) {
        console.error('❌ COD order error:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsPlacingOrder(false);
      }
      return;
    }

    // Handle Online Payments with Razorpay
    if (paymentSettings?.razorpay_enabled && paymentSettings.razorpay_key_id) {
      try {
        setIsProcessing(true);

        // Load Razorpay script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setError('Failed to load payment gateway. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Razorpay options
        const options = {
          key: paymentSettings.razorpay_key_id,
          amount: totalAmount * 100, // Convert to paise
          currency: 'INR',
          name: siteSettings?.textLogo || 'Awaany',
          description: `Order Payment`,
          handler: async function (response: any) {
            console.log('✅ Razorpay payment successful:', response);
            console.log('🛒 Cart at payment success:', cart);
            console.log('🔢 Cart length at payment success:', cart.length);

            // Capture cart snapshot BEFORE any state changes
            const cartSnapshot = [...cart];
            console.log('📸 Cart snapshot created:', cartSnapshot);

            try {
              setIsProcessing(true);
              // Pass cart snapshot to placeOrder to avoid race condition
              const newOrderId = await placeOrder('Online', cartSnapshot);
              console.log('✅ Order placed successfully:', newOrderId);
              if (newOrderId) {
                setCompletedOrderId(newOrderId);
                setShowSuccessAnimation(true);
                setIsProcessing(false);
              }
            } catch (err: any) {
              console.error('❌ Order placement error:', err);
              setError('Order placement failed: ' + err.message);
              setIsProcessing(false);
            }
          },
          prefill: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            contact: currentUser?.mobile || ''
          },
          theme: {
            color: siteSettings?.primaryColor || '#ec4899'
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setError('Payment cancelled');
            }
          }
        };

        openRazorpayCheckout(options);
      } catch (err: any) {
        setError('Payment failed: ' + err.message);
        setIsProcessing(false);
      }
    } else {
      // Fallback: Show processing animation (for demo/testing without Razorpay)
      setIsProcessing(true);
    }
  };

  const onAnimationComplete = async () => {
    try {
      const newOrderId = await placeOrder('Online');
      // The animation component will close on its own.
      if (newOrderId) {
        navigate(`/order-confirmation/${newOrderId}`);
      } else {
        setIsProcessing(false);
        setError('There was an error placing your order. Please try again.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'An unexpected error occurred during payment.');
    }
  };

  const isCardFormValid =
    cardNumber.replace(/\s/g, '').length >= 16 &&
    cardHolder.trim().length > 2 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate) &&
    cvv.length === 3;

  const paymentTabs = [
    { id: 'card', label: 'Card', icon: <CreditCardIcon className="w-5 h-5" /> },
    { id: 'upi', label: 'UPI', icon: <UpiIcon className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallets', icon: <WalletIcon className="w-5 h-5" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <BankIcon className="w-5 h-5" /> },
    { id: 'cod', label: 'Cash on Delivery', icon: <span className="font-bold text-lg">₹</span> },
  ];

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'card':
        return (
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
              <input type="text" id="cardNumber" value={cardNumber} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" className={`${inputClasses} pl-3 pr-12`} />
              {cardType === 'visa' && <VisaIcon className="absolute right-3 top-8 h-6" />}
              {cardType === 'mastercard' && <MastercardIcon className="absolute right-3 top-8 h-6" />}
            </div>
            <div>
              <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name on Card</label>
              <input type="text" id="cardHolder" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Jane Doe" className={inputClasses} />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry (MM/YY)</label>
                <input type="text" id="expiryDate" value={expiryDate} onChange={handleExpiryChange} placeholder="MM/YY" className={inputClasses} />
              </div>
              <div className="w-1/2">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                <input type="password" id="cvv" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} placeholder="•••" className={inputClasses} />
              </div>
            </div>
          </div>
        );
      case 'upi':
        return (
          <div className="text-center">
            <QrCodeIcon className="w-40 h-40 mx-auto text-gray-800 dark:text-white" />
            <p className="font-semibold mt-2 text-gray-800 dark:text-gray-200">Scan with any UPI app</p>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <input type="text" placeholder="Enter UPI ID" className={`text-center ${inputClasses}`} />
          </div>
        );
      case 'cod':
        return (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pay on Delivery</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">You can pay in cash to our courier partner at the time of delivery. No online payment is required.</p>
          </div>
        );
      default:
        return (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">This payment method is not available at the moment. Please select another option.</p>
          </div>
        );
    }
  }

  const ctaDisabled = (activeTab === 'card' && !isCardFormValid) || isPlacingOrder;
  const ctaText = useMemo(() => {
    if (isPlacingOrder) return 'Placing Order...';
    if (activeTab === 'cod') return 'Confirm Order';
    return `Pay ₹${totalAmount.toLocaleString()}`;
  }, [isPlacingOrder, activeTab, totalAmount]);

  return (
    <>
      <PaymentProcessingAnimation isOpen={isProcessing} onComplete={onAnimationComplete} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-6">
          Payment Options
        </h1>
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
