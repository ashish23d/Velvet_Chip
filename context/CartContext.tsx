import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CartItem, Product, Promotion, Order, DeliverySettings, ServiceableRule, ContactDetails, SiteSettings } from '../types';
import { useAuth } from './AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';

interface CheckoutState {
    selectedAddressId: string | null;
    appliedPromotion: Promotion | null;
    discount: number;
}

interface CartContextType {
    cart: CartItem[];
    cartCount: number;
    addToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity?: number, customization?: string) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;

    // Checkout
    checkoutState: CheckoutState;
    setSelectedAddressForCheckout: (id: string) => void;
    applyPromotion: (code: string) => Promise<void>;
    removePromotion: () => void;
    activePromotions: Promotion[]; // For UI listing
    getAvailablePromotions: () => Promotion[];

    placeOrder: (
        method: 'COD' | 'Online',
        cartItems?: CartItem[],
        deliveryOptions?: { type: 'partner' | 'pickup' | 'shop', pickupCode?: string }
    ) => Promise<string | null>;

    // UI State
    isCartShaking: boolean;
    setIsCartShaking: (shaking: boolean) => void;
    flyToCartItem: { product: Product; startRect: DOMRect } | null;
    triggerFlyToCartAnimation: (product: Product, startElement: HTMLElement) => void;
    setAnimationItem: (item: any) => void;

    // Dependent Data (Needed for Checkout)
    deliverySettings: DeliverySettings | null;
    isOfferModalOpen: boolean;
    openOfferModal: () => void;
    closeOfferModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, session, refreshProfile } = useAuth();

    // State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
    const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
    const [checkoutState, setCheckoutState] = useState<CheckoutState>({ selectedAddressId: null, appliedPromotion: null, discount: 0 });

    // UI State
    const [isCartShaking, setIsCartShaking] = useState(false);
    const [flyToCartItem, setFlyToCartItem] = useState<{ product: Product; startRect: DOMRect } | null>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    // Sync Cart from Auth Context
    useEffect(() => {
        if (currentUser?.cart) {
            setCart(currentUser.cart);
        } else {
            setCart([]);
        }
    }, [currentUser?.cart]);

    // Load Checkout Dependencies
    useEffect(() => {
        const loadDependencies = async () => {
            const [promos, delSettings] = await Promise.all([
                supabase.from('promotions').select('*').eq('is_active', true),
                supabase.from('delivery_settings').select('*').single()
            ]);

            if (promos.data) setActivePromotions(promos.data.map((p: any) => ({ ...p, minPurchase: p.min_purchase, usageLimit: p.usage_limit, expiresAt: p.expires_at, isActive: p.is_active, createdAt: p.created_at })));
            if (delSettings.data) setDeliverySettings(delSettings.data);
        };
        loadDependencies();
    }, []);

    // ----------------------------------------------------
    // CART ACTIONS
    // ----------------------------------------------------
    const addToCart = async (product: Product, size: string, color: { name: string; hex: string }, quantity = 1, customization?: string) => {
        if (!currentUser) return; // UI handles login prompt
        const newCartItem: CartItem = {
            id: `${product.id}-${size}-${color.name}`,
            product,
            quantity,
            selectedSize: size,
            selectedColor: color,
            customization
        };
        const updatedCart = [...cart];
        const existingIndex = updatedCart.findIndex(i => i.id === newCartItem.id);
        if (existingIndex > -1) {
            updatedCart[existingIndex].quantity += quantity;
            if (customization !== undefined) updatedCart[existingIndex].customization = customization;
        } else {
            updatedCart.push(newCartItem);
        }

        // Optimistic
        setCart(updatedCart);
        await supabase.from('profiles').update({ cart: updatedCart }).eq('id', currentUser.id);
        // We might want to refresh profile to be sure, but optimistic is smoother
    };

    const removeFromCart = async (itemId: string) => {
        if (!currentUser) return;
        const updatedCart = cart.filter(item => item.id !== itemId);
        setCart(updatedCart);
        await supabase.from('profiles').update({ cart: updatedCart }).eq('id', currentUser.id);
    };

    const updateCartItemQuantity = async (itemId: string, quantity: number) => {
        if (!currentUser) return;
        const updatedCart = cart.map(item => item.id === itemId ? { ...item, quantity } : item);
        setCart(updatedCart);
        await supabase.from('profiles').update({ cart: updatedCart }).eq('id', currentUser.id);
    };

    const clearCart = async () => {
        if (!currentUser) return;
        setCart([]);
        await supabase.from('profiles').update({ cart: [] }).eq('id', currentUser.id);
    };

    // ----------------------------------------------------
    // PROMOTIONS & DISCOUNT LOGIC
    // ----------------------------------------------------
    useEffect(() => {
        if (!checkoutState.appliedPromotion) {
            if (checkoutState.discount !== 0) setCheckoutState(prev => ({ ...prev, discount: 0 }));
            return;
        }

        const promotion = checkoutState.appliedPromotion;
        const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        const isExpired = promotion.expires_at && new Date(promotion.expires_at) < new Date();
        const minPurchaseMet = !promotion.min_purchase || cartTotal >= promotion.min_purchase;

        if (isExpired || !minPurchaseMet) {
            setCheckoutState(prev => ({ ...prev, appliedPromotion: null, discount: 0 }));
            return;
        }

        let newDiscount = 0;
        if (promotion.type === 'percentage') {
            newDiscount = (cartTotal * promotion.value) / 100;
        } else {
            newDiscount = promotion.value;
        }
        newDiscount = Math.min(newDiscount, cartTotal);

        if (newDiscount !== checkoutState.discount) {
            setCheckoutState(prev => ({ ...prev, discount: newDiscount }));
        }
    }, [cart, checkoutState.appliedPromotion]);

    const applyPromotion = async (code: string) => {
        const promotion = activePromotions.find(p => p.code === code);
        if (!promotion) throw new Error("Invalid promotion code");
        if (promotion.expires_at && new Date(promotion.expires_at) < new Date()) throw new Error("Promotion code has expired");

        const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        if (promotion.min_purchase && cartTotal < promotion.min_purchase) {
            throw new Error(`Minimum purchase of ₹${promotion.min_purchase} required`);
        }

        let discountAmount = 0;
        if (promotion.type === 'percentage') {
            discountAmount = (cartTotal * promotion.value) / 100;
        } else {
            discountAmount = promotion.value;
        }
        discountAmount = Math.min(discountAmount, cartTotal);

        setCheckoutState(p => ({ ...p, appliedPromotion: promotion, discount: discountAmount }));
    };

    const removePromotion = () => setCheckoutState(p => ({ ...p, appliedPromotion: null, discount: 0 }));

    // ----------------------------------------------------
    // ORDER PLACEMENT (Core Logic)
    // ----------------------------------------------------
    const placeOrder = async (
        method: 'COD' | 'Online',
        cartItems?: CartItem[],
        deliveryOptions?: { type: 'partner' | 'pickup' | 'shop', pickupCode?: string }
    ) => {
        if (!currentUser) throw new Error("User not authenticated");
        const itemsToOrder = cartItems || cart;
        if (itemsToOrder.length === 0) throw new Error("Cart is empty");

        console.log('🛒 placeOrder (CartContext) called', { method });

        // 1. Stock Check & Deduction
        const updatedProductsMap = new Map();

        for (const item of itemsToOrder) {
            const { data: product, error: pError } = await supabase.from('products').select('*').eq('id', item.product.id).single();
            if (pError || !product) throw new Error(`Product ${item.product.name} not found`);

            let stockDeducted = false;
            let currentStock = 0;

            const newColors = product.colors.map((c: any) => {
                const itemColorName = item.selectedColor?.name || '';
                const normalize = (s: string) => s?.trim().toLowerCase() || '';
                const isColorMatch = !item.selectedColor || (normalize(c.name) === normalize(itemColorName));

                if (!isColorMatch) return c;

                return {
                    ...c,
                    sizes: c.sizes.map((s: any) => {
                        if (s.size === item.selectedSize) {
                            currentStock = Number(s.stock);
                            if (currentStock < item.quantity) {
                                throw new Error(`Insufficient stock for ${product.name} (${item.selectedSize}). Available: ${currentStock}`);
                            }
                            stockDeducted = true;
                            return { ...s, stock: currentStock - item.quantity };
                        }
                        return s;
                    })
                };
            });

            if (!stockDeducted) {
                throw new Error(`Variant not found for ${product.name}: ${item.selectedColor?.name} / ${item.selectedSize}.`);
            }

            const { error: updateError } = await supabase.from('products').update({ colors: newColors }).eq('id', product.id);
            if (updateError) throw new Error(`Failed to update stock for ${product.name}`);
        }

        // 2. Secure Price & Tax Calculation
        let secureSubtotal = 0;
        let totalTaxAmount = 0;
        const taxDetailsStr: Record<string, number> = {};
        const itemDetailsMap = new Map<string, { basePrice: number, taxRate: number, taxAmount: number, price: number }>();

        const { data: taxSettingsDb } = await supabase.from('tax_settings').select('*').single();
        const taxMode = taxSettingsDb?.enabled ? (taxSettingsDb.mode || 'global') : 'none';
        const globalRate = taxSettingsDb?.global_rate || 0;

        const categoryRates = new Map<string, number>();
        if (taxMode === 'category') {
            const { data: cats } = await supabase.from('categories').select('name, tax_rate');
            if (cats) cats.forEach((c: any) => categoryRates.set(c.name, Number(c.tax_rate) || 0));
        }

        for (const item of itemsToOrder) {
            const { data: product } = await supabase.from('products').select('*').eq('id', item.product.id).single();
            if (!product) continue;

            let itemPrice = product.price;
            if (item.selectedColor) {
                const variant = product.colors?.find((c: any) => c.name?.toLowerCase() === item.selectedColor?.name?.toLowerCase());
                if (variant) {
                    const sizeVariant = variant.sizes?.find((s: any) => s.size === item.selectedSize);
                    if (sizeVariant && sizeVariant.price) itemPrice = Number(sizeVariant.price);
                }
            }

            const lineItemTotal = itemPrice * item.quantity;
            secureSubtotal += lineItemTotal;

            let rate = 0;
            if (taxMode === 'global') rate = globalRate;
            else if (taxMode === 'category') rate = categoryRates.get(product.category) || 0;

            if (rate > 0) {
                const tax = (lineItemTotal * rate) / 100;
                totalTaxAmount += tax;
                const label = taxSettingsDb?.label || 'Tax';
                taxDetailsStr[`${label} (${rate}%)`] = (taxDetailsStr[`${label} (${rate}%)`] || 0) + tax;
                itemDetailsMap.set(item.id, {
                    basePrice: product.base_price || (itemPrice / (1 + (rate / 100))),
                    taxRate: rate,
                    taxAmount: tax / item.quantity,
                    price: itemPrice
                });
            } else {
                itemDetailsMap.set(item.id, {
                    basePrice: product.base_price || itemPrice,
                    taxRate: 0,
                    taxAmount: 0,
                    price: itemPrice
                });
            }
        }

        // 3. Final Totals
        const deliveryType = deliveryOptions?.type || 'partner';
        const baseCharge = deliverySettings?.base_charge ?? 50;
        const freeThreshold = deliverySettings?.free_delivery_threshold ?? 499;

        const deliveryCharge = (deliveryType === 'pickup') ? 0 : (secureSubtotal >= freeThreshold ? 0 : baseCharge);
        const grossTotal = secureSubtotal + totalTaxAmount + deliveryCharge;
        const finalDiscount = Math.min(checkoutState.discount, grossTotal);
        const totalAmount = grossTotal - finalDiscount;

        const orderPayload = {
            user_id: currentUser.id,
            items: itemsToOrder.map(item => {
                const details = itemDetailsMap.get(item.id);
                return {
                    id: item.id,
                    productId: item.product.id,
                    name: item.product.name,
                    price: details?.price || item.product.price,
                    base_price: details ? details.basePrice : (item.product.base_price || item.product.price),
                    tax_percent: details ? details.taxRate : 0,
                    tax_amount: details ? details.taxAmount : 0,
                    quantity: item.quantity,
                    size: item.selectedSize,
                    color: item.selectedColor,
                    image: item.product.images[0]
                };
            }),
            total_amount: totalAmount,
            total: totalAmount, // legacy field?
            tax_amount: totalTaxAmount,
            tax_details: taxDetailsStr,
            payment: {
                method: method,
                status: method === 'Online' ? 'Paid' : 'Pending', // Assumes online success before calling this
                transactionId: ''
            },
            current_status: 'Processing',
            shipping_address: currentUser.addresses?.find(a => a.id === checkoutState.selectedAddressId) || null,
            order_date: new Date().toISOString(),
            status_history: [{ status: 'Processing', timestamp: new Date().toISOString(), description: 'Order placed successfully' }],
            delivery_type: deliveryType,
            pickup_verification_code: deliveryOptions?.pickupCode || null,
            is_pickup_verified: false
        };

        const { data, error } = await supabase.from('orders').insert(orderPayload).select().single();
        if (error) {
            console.error("Error creating order:", error);
            throw error;
        }

        // 4. Notifications & Email
        await supabase.from('notifications').insert({
            user_id: currentUser.id,
            link: `/order/${data.id}`,
            type: 'order',
            title: 'Order Placed',
            message: 'Your order has been placed successfully'
        });

        const emailPromise = supabase.functions.invoke('send-order-update', {
            body: { orderId: data.id, templateName: 'order_confirmation' }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Email trigger timeout")), 2000));
        Promise.race([emailPromise, timeoutPromise]).catch(e => console.error("Email trigger error (non-blocking)", e));

        const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
        if (admins) {
            const adminNotifs = admins.map(admin => ({
                user_id: admin.id,
                link: `/admin/orders/${data.id}`,
                type: 'system',
                title: 'New Order',
                message: `New order placed by ${currentUser.name || 'a user'}`
            }));
            await supabase.from('notifications').insert(adminNotifs); // Batch insert
        }

        // 5. Cleanup
        await clearCart();
        await refreshProfile(); // Sync AuthContext

        return data.id;
    };

    const triggerFlyToCartAnimation = (product: Product, startElement: HTMLElement) => {
        const rect = startElement.getBoundingClientRect();
        setFlyToCartItem({ product, startRect: rect });
        setIsCartShaking(true);
        setTimeout(() => setIsCartShaking(false), 500);
    };

    const contextValue: CartContextType = {
        cart,
        cartCount: cart.reduce((acc, item) => acc + item.quantity, 0),
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,

        checkoutState,
        setSelectedAddressForCheckout: (id) => setCheckoutState(p => ({ ...p, selectedAddressId: id })),
        applyPromotion,
        removePromotion,
        activePromotions,
        getAvailablePromotions: () => {
            const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            return activePromotions.filter(p => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                const isMinPurchaseMet = !p.min_purchase || cartTotal >= p.min_purchase;
                return !isExpired && isMinPurchaseMet;
            });
        },
        placeOrder,

        isCartShaking,
        setIsCartShaking,
        flyToCartItem,
        triggerFlyToCartAnimation,
        setAnimationItem: (item) => setFlyToCartItem(item),

        deliverySettings,
        isOfferModalOpen,
        openOfferModal: () => setIsOfferModalOpen(true),
        closeOfferModal: () => setIsOfferModalOpen(false),
    };

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
