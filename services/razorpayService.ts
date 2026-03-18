import { supabase } from './supabaseClient';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface RazorpayOrderData {
    amount: number;  // in paise (₹299 = 29900 paise)
    currency: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id?: string; // Optional - can place order after payment confirmation
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

/**
 * Load Razorpay checkout script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

/**
 * Create a Razorpay order via Edge Function
 * This keeps the secret key secure on the backend
 */
export const createRazorpayOrder = async (orderData: RazorpayOrderData) => {
    try {
        const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
            body: orderData
        });

        if (error) {
            console.error('Error creating Razorpay order:', error);
            throw new Error(error.message || 'Failed to create payment order');
        }

        return data;
    } catch (error: any) {
        console.error('Razorpay order creation failed:', error);
        throw new Error(error.message || 'Payment initialization failed');
    }
};

/**
 * Verify Razorpay payment signature via Edge Function
 * This ensures payment authenticity using the secret key on backend
 */
export const verifyRazorpayPayment = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) => {
    try {
        const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: paymentData
        });

        if (error) {
            console.error('Error verifying Razorpay payment:', error);
            throw new Error(error.message || 'Payment verification failed');
        }

        return data;
    } catch (error: any) {
        console.error('Razorpay payment verification failed:', error);
        throw new Error(error.message || 'Payment verification failed');
    }
};

/**
 * Open Razorpay checkout modal
 */
export const openRazorpayCheckout = (options: RazorpayOptions) => {
    if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();
};
