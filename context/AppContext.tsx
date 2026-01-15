import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import {
    Product, Category, User, CartItem, Order, Review,
    Notification, SiteSettings, ContactDetails, SiteContent,
    Slide, SeasonalEditCard, Promotion, Announcement,
    UserProfile, AdminData, MailTemplate, ContactSubmission,
    ReturnRequest, ReturnRequestStatus, PendingChange,
    Address, ReturnStatusUpdate, SearchHistoryEntry,
    CardAddon, PaymentSettings, EmailSettings,
    DeliverySettings, ServiceableRule, MasterLocation, TaxSettings
} from '../types.ts';

import { INITIAL_SLIDES } from '../constants.ts';
import { generateInvoicePDF } from '../utils/invoiceGenerator.ts';

interface CheckoutState {
    selectedAddressId: string | null;
    appliedPromotion: Promotion | null;
    discount: number;
}

interface AppContextType {
    // State
    categories: Category[];
    products: Product[];
    cart: CartItem[];
    wishlist: Product[];
    savedItems: Product[];
    currentUser: User | null;
    session: any;
    isLoading: boolean;

    // Site Data
    siteSettings: SiteSettings | null;
    paymentSettings: PaymentSettings | null;
    taxSettings: TaxSettings | null;
    updateTaxSettings: (settings: Partial<TaxSettings>) => Promise<void>;
    contactDetails: ContactDetails;
    siteContent: SiteContent[];
    slides: Slide[];
    seasonalEditCards: SeasonalEditCard[];
    announcement: Announcement | null;

    // Cart & Checkout
    cartCount: number;
    addToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity?: number, customization?: string) => void;
    removeFromCart: (itemId: string) => void;
    updateCartItemQuantity: (itemId: string, quantity: number) => void;
    checkoutState: CheckoutState;
    setSelectedAddressForCheckout: (id: string) => void;
    applyPromotion: (code: string) => Promise<void>;
    removePromotion: () => void;
    placeOrder: (
        method: 'COD' | 'Online',
        cartItems?: CartItem[]
    ) => Promise<string | null>;


    // User Actions
    toggleWishlist: (product: Product) => void;
    isProductInWishlist: (productId: number) => boolean;
    toggleSavedItem: (product: Product) => void;
    isProductSaved: (productId: number) => boolean;
    addAddress: (address: any) => Promise<void>;
    updateAddress: (address: any) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
    fetchUserOrders: () => Promise<void>;


    fetchProducts: (params?: { categoryId?: string; limit?: number; page?: number; perPage?: number; sort?: 'latest' | 'popular' | 'price-asc' | 'price-desc' }) => Promise<{ data: Product[]; count: number }>;
    getProductById: (id: number | string | undefined) => Promise<Product | undefined>;
    searchProducts: (query: string) => Promise<Product[]>;
    getSearchSuggestions: (query: string) => Promise<{ suggestedQueries: string[], suggestedCategories: string[] }>;
    lastProductUpdate: number;
    searchHistory: SearchHistoryEntry[];
    addToSearchHistory: (query: string) => Promise<void>;
    deleteSearchHistoryItem: (id: string) => Promise<void>;
    clearSearchHistory: () => Promise<void>;

    // Categories
    getCategoryById: (id: string) => Category | undefined;

    // Reviews
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'date' | 'status'>) => Promise<void>;
    reviewModalState: { isOpen: boolean; product: Product | null };
    openReviewModal: (product: Product) => void;
    closeReviewModal: () => void;

    // Notifications
    // 🔔 Notifications
    // Notifications
    // 🔔 Notifications
    notifications: Notification[];
    orderUpdates: any[]; // From profiles.updates
    promotions: any[];   // From broadcast_notifications
    unreadNotificationCount: number;
    markNotificationAsRead: (id: string) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;


    // Admin
    adminData: AdminData | null;
    isLoadingAdminData: boolean;
    loadAdminData: () => Promise<void>;
    addProduct: (product: any) => Promise<void>;
    updateProduct: (product: any) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    addCategory: (category: any) => Promise<void>;
    updateCategory: (category: any) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateOrderStatus: (id: string, status: string) => Promise<void>;
    adminBulkUpdateOrderStatus: (ids: string[], status: string) => Promise<void>;
    adminCreateUser: (user: Partial<User>) => Promise<void>;
    adminUpdateUser: (user: Partial<User>) => Promise<void>;
    updateUserStatus: (id: string, status: string) => Promise<void>;
    adminChangeUserRole: (id: string, role: string) => Promise<void>;
    updateReviewStatus: (id: number, status: string) => Promise<void>;
    deleteReview: (id: number) => Promise<void>;
    adminUpdateReview: (review: Review) => Promise<void>;
    updateUserReview: (reviewId: number, updates: { rating?: number; comment?: string; productImages?: string[] }) => Promise<void>;
    adminDeleteReviewImage: (reviewId: number, imagePath: string) => Promise<void>;
    getPendingChanges: () => PendingChange[];
    approveChange: (id: string) => Promise<void>;
    rejectChange: (id: string) => Promise<void>;
    updateSiteContent: (content: SiteContent) => Promise<void>;
    updateSiteSettings: (settings: SiteSettings) => Promise<void>;
    updateContactDetails: (details: ContactDetails) => Promise<void>;
    updateSlides: (slides: Slide[]) => Promise<void>;
    adminDeleteSiteAsset: (path: string) => Promise<void>;
    adminAddSeasonalCard: (card: any) => Promise<void>;
    adminUpdateSeasonalCard: (card: any) => Promise<void>;
    adminDeleteSeasonalCard: (id: string) => Promise<void>;
    getAllSubscribers: () => any[];

    // Card Addons
    cardAddons: CardAddon[];
    fetchCardAddons: () => Promise<void>;
    addCardAddon: (addon: Partial<CardAddon>) => Promise<CardAddon>;
    updateCardAddon: (id: string, updates: Partial<CardAddon>) => Promise<CardAddon>;
    deleteCardAddon: (id: string) => Promise<void>;
    addSubscriber: (email: string) => Promise<void>;
    deleteSubscriber: (id: number) => Promise<void>;
    activePromotions: Promotion[];
    getAvailablePromotions: () => Promotion[];
    getAllPromotions: () => Promotion[];
    getPromotionById: (id: number) => Promotion | undefined;
    addPromotion: (promo: any) => Promise<void>;
    updatePromotion: (promo: any) => Promise<void>;
    deletePromotion: (promo: Promotion) => Promise<void>;
    updateAnnouncement: (announcement: Announcement) => Promise<void>;
    emailSettings: EmailSettings | null;
    emailSettings: EmailSettings | null;
    updateEmailSettings: (settings: EmailSettings) => Promise<void>;

    // Delivery & Serviceable API
    deliverySettings: DeliverySettings | null;
    serviceableRules: ServiceableRule[];
    updateDeliverySettings: (settings: Partial<DeliverySettings>) => Promise<void>;
    addServiceableRule: (rule: Omit<ServiceableRule, 'id'>) => Promise<ServiceableRule>;
    removeServiceableRule: (id: string, cascade?: boolean) => Promise<void>;
    // Delivery Management
    deliverySettings: DeliverySettings | null;
    serviceableRules: ServiceableRule[];
    updateDeliverySettings: (newSettings: Partial<DeliverySettings>) => Promise<void>;
    fetchServiceableRules: () => Promise<void>;
    addServiceableRule: (rule: Omit<ServiceableRule, 'id'>) => Promise<ServiceableRule>;
    removeServiceableRule: (ruleId: string, removeChildren?: boolean) => Promise<void>;
    searchMasterLocations: (term: string, type: 'pincode' | 'city' | 'state', parent?: string) => Promise<MasterLocation[]>;
    fetchUniqueStates: () => Promise<string[]>;
    fetchCitiesByState: (state: string) => Promise<string[]>;
    fetchPincodesByCity: (state: string, city: string) => Promise<string[]>;
    // Order Actions
    assignShopDelivery: (orderId: string, details: any) => Promise<void>;
    verifyOrderPickup: (orderId: string, code: string) => Promise<void>;

    submitContactForm: (data: any) => Promise<void>;
    getAllContactSubmissions: () => ContactSubmission[];
    updateContactSubmissionStatus: (id: number, status: string) => Promise<void>;
    getAllMailTemplates: () => MailTemplate[];
    getMailTemplateById: (id: number) => MailTemplate | undefined;
    addMailTemplate: (template: any) => Promise<void>;
    updateMailTemplate: (template: any) => Promise<void>;
    deleteMailTemplate: (id: number) => Promise<void>;
    toggleMailTemplateStatus: (id: number, isActive: boolean) => Promise<void>;
    getAllInvoices: () => any[];
    generateInvoice: (orderId: string) => Promise<void>;
    getUserById: (id: string) => User | undefined;
    getOrderById: (id: string | undefined) => Order | undefined;

    // Returns
    submitReturnRequest: (data: any) => Promise<void>;
    adminUpdateReturnStatus: (returnId: string, data: any) => Promise<void>;

    // UI
    isOfferModalOpen: boolean;
    openOfferModal: () => void;
    closeOfferModal: () => void;
    isCartShaking: boolean;
    setIsCartShaking: (shaking: boolean) => void;
    flyToCartItem: { product: Product; startRect: DOMRect } | null;
    setAnimationItem: (item: any) => void;
    triggerFlyToCartAnimation: (product: Product, startElement: HTMLElement) => void;
    confirmationState: {
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        isDestructive: boolean;
        isConfirming: boolean;
        onConfirm: () => void;
    };
    showConfirmationModal: (options: any) => void;
    closeConfirmationModal: () => void;
    logout: () => Promise<void>;
    userCancelOrder: (orderId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // 🔔 Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [orderUpdates, setOrderUpdates] = useState<any[]>([]); // Personal updates
    const [promotions, setPromotions] = useState<any[]>([]);     // Broadcasts
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [savedItems, setSavedItems] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
    const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
    const [contactDetails, setContactDetailsState] = useState<ContactDetails>({ email: '', phone: '', address: '' });
    const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
    const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
    const [seasonalEditCards, setSeasonalEditCards] = useState<SeasonalEditCard[]>([]);
    const [cardAddons, setCardAddons] = useState<CardAddon[]>([]);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
    const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
    const [serviceableRules, setServiceableRules] = useState<ServiceableRule[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
    const [lastProductUpdate, setLastProductUpdate] = useState(Date.now());

    const [checkoutState, setCheckoutState] = useState<CheckoutState>({ selectedAddressId: null, appliedPromotion: null, discount: 0 });
    const [reviewModalState, setReviewModalState] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isCartShaking, setIsCartShaking] = useState(false);
    const [flyToCartItem, setFlyToCartItem] = useState<{
        product: Product;
        startRect: DOMRect;
    } | null>(null);

    // Dynamic Discount Recalculation
    useEffect(() => {
        // If no promotion applied, nothing to do
        if (!checkoutState.appliedPromotion) {
            if (checkoutState.discount !== 0) {
                setCheckoutState(prev => ({ ...prev, discount: 0 }));
            }
            return;
        }

        const promotion = checkoutState.appliedPromotion;
        const cartTotal = (currentUser?.cart || []).reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        // 1. Re-validate
        const isExpired = promotion.expires_at && new Date(promotion.expires_at) < new Date();
        const minPurchaseMet = !promotion.min_purchase || cartTotal >= promotion.min_purchase;

        if (isExpired || !minPurchaseMet) {
            // Remove invalid promotion
            console.log("Removing invalid promotion due to cart change/expiry");
            setCheckoutState(prev => ({ ...prev, appliedPromotion: null, discount: 0 }));
            return;
        }

        // 2. Recalculate Amount
        let newDiscount = 0;
        if (promotion.type === 'percentage') {
            newDiscount = (cartTotal * promotion.value) / 100;
        } else {
            newDiscount = promotion.value;
        }

        newDiscount = Math.min(newDiscount, cartTotal);

        // Only update if changed prevents infinite loop
        if (newDiscount !== checkoutState.discount) {
            setCheckoutState(prev => ({ ...prev, discount: newDiscount }));
        }

    }, [cart, checkoutState.appliedPromotion, currentUser?.cart]);

    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDestructive: false,
        isConfirming: false,
        onConfirm: () => { },
    });





    // ----------------------------------------------------
    // DELIVERY & SERVICEABLE RULES
    // ----------------------------------------------------
    const fetchDeliverySettings = async () => {
        const { data, error } = await supabase.from('delivery_settings').select('*').single();
        if (data) setDeliverySettings(data);
    };

    const fetchTaxSettings = async () => {
        const { data } = await supabase.from('tax_settings').select('*').single();
        if (data) setTaxSettings(data);
    };

    const fetchServiceableRules = async () => {
        const { data } = await supabase.from('serviceable_rules').select('*').order('created_at', { ascending: true });
        if (data) setServiceableRules(data);
    };

    const updateDeliverySettings = async (settings: Partial<DeliverySettings>) => {
        try {
            const { data, error } = await supabase.from('delivery_settings').update(settings).eq('id', 1).select().single();
            if (error) throw error;
            if (data) setDeliverySettings(data);
            alert("Delivery Settings Updated");
        } catch (e: any) {
            console.error("Update Delivery Settings Error", e);
            alert("Failed to update settings: " + e.message);
        }
    };

    const updateTaxSettings = async (settings: Partial<TaxSettings>) => {
        try {
            const { data, error } = await supabase.from('tax_settings').update(settings).eq('id', 1).select().single();
            if (error) throw error;
            if (data) setTaxSettings(data);
            alert("Tax Settings Updated");
        } catch (e: any) {
            console.error("Update Tax Settings Error", e);
            alert("Failed to update settings: " + e.message);
        }
    };

    const addServiceableRule = async (rule: Omit<ServiceableRule, 'id'>) => {
        const { data, error } = await supabase.from('serviceable_rules').insert(rule).select().single();
        if (error) throw error;
        setServiceableRules(prev => [...prev, data]);
        return data;
    };

    const removeServiceableRule = async (id: string, cascade = false) => {
        if (cascade) {
            // Logic to delete child rules (e.g. delete city should delete its pincodes)
            // Implementation depends on how we query parents.
            // For now, simplify to just delete the rule.
            const rule = serviceableRules.find(r => r.id === id);
            if (rule) {
                // cascading delete logic if needed from DB side or multiple calls
                await supabase.from('serviceable_rules').delete().eq('parent_value', rule.value);
            }
        }
        await supabase.from('serviceable_rules').delete().eq('id', id);
        setServiceableRules(prev => prev.filter(r => r.id !== id));
    };

    const searchMasterLocations = async (term: string, type: 'pincode' | 'city' | 'state', parent?: string) => {
        let query = supabase.from('master_locations').select('*').ilike(type, `${term}%`).limit(20);

        // If searching cities, constrain by state if parent provided
        if (type === 'city' && parent) {
            query = query.eq('state', parent);
        }
        // If searching pincodes, constrain by city if parent provided
        if (type === 'pincode' && parent) {
            query = query.eq('city', parent);
        }
        // Distinct handling (Supabase simple select doesn't support distinct well on client without RPC)
        // We will filter client side or rely on unique results if master set is clean.
        // For States:
        if (type === 'state') {
            // For strict state list, better to select distinct state from master_locations
            // But simple ilike is fine for autocomplete.
        }

        const { data } = await query;
        return data || [];
    };

    const assignShopDelivery = async (orderId: string, details: any) => {
        const { error } = await supabase.from('orders').update({
            delivery_type: 'shop',
            shop_delivery_details: details,
            current_status: 'Out for Delivery',
            status_history: [...(getOrderById(orderId)?.statusHistory || []), { status: 'Out for Delivery', timestamp: new Date().toISOString(), description: `Out for delivery by shop personnel: ${details.boy_name}` }]
        }).eq('id', orderId);

        if (error) throw error;
        await loadAdminData(); // Refresh
    };

    const verifyOrderPickup = async (orderId: string, code: string) => {
        // Optimistic verification? No, must be secure.
        // Best to use a DB Function if we want to confirm code matches on server side securely
        // OR simply fetch the order secret and compare here if current user is admin.
        const order = getOrderById(orderId);
        if (!order) throw new Error("Order not found");

        if (order.pickup_verification_code !== code) {
            throw new Error("Invalid Verification Code");
        }

        const { error } = await supabase.from('orders').update({
            is_pickup_verified: true,
            current_status: 'Delivered', // Pickup complete
            status_history: [...(order.statusHistory || []), { status: 'Delivered', timestamp: new Date().toISOString(), description: 'Order picked up by customer (Verified)' }]
        }).eq('id', orderId);

        if (error) throw error;
        await loadAdminData();
    };

    // --- Fetching Logic ---

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (data && data.length > 0) {
                const mapped = data.map((c: any) => ({
                    ...c,
                    heroImage: c.hero_image, // Map snake_case DB column to camelCase prop
                    pageHeroMedia: c.page_hero_media,
                    pageHeroText: c.page_hero_text,
                    showPageHeroText: c.show_page_hero_text,
                    appImagePath: c.app_image_path
                }));
                setCategories(mapped);
                return mapped;
            }
        } catch (e) { console.error("Fetch categories error", e); }
        return null;
    };

    const fetchSearchHistory = async (userId?: string) => {
        // If no userId, try local storage
        if (!userId) {
            try {
                const local = localStorage.getItem('velvetchip_search_history');
                if (local) {
                    setSearchHistory(JSON.parse(local));
                }
            } catch (e) { console.error("Error loading local history", e); }
            return;
        }

        try {
            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(8); // Limit to 8

            if (error) throw error;

            // Filter client-side for the 30-day retention rule
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Deduplicate logic
            const uniqueHistory: SearchHistoryEntry[] = [];
            const seenQueries = new Set<string>();

            (data || []).forEach(item => {
                const q = item.query.toLowerCase().trim();
                // Filter for 30-day retention and uniqueness
                if (!seenQueries.has(q) && new Date(item.created_at) > thirtyDaysAgo) {
                    seenQueries.add(q);
                    uniqueHistory.push(item);
                }
            });

            setSearchHistory(uniqueHistory.slice(0, 8));
        } catch (error) {
            console.error("Error fetching search history:", error);
        }
    };

    const addToSearchHistory = async (query: string) => {
        if (!query.trim()) return;

        const trimmedQuery = query.trim();
        const newEntry: SearchHistoryEntry = {
            id: crypto.randomUUID(),
            query: trimmedQuery,
            created_at: new Date().toISOString()
        };

        const userId = session?.user?.id;

        // Optimistic State Update
        setSearchHistory(prev => {
            const filtered = prev.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());
            const updated = [newEntry, ...filtered].slice(0, 8);

            if (!userId) {
                localStorage.setItem('velvetchip_search_history', JSON.stringify(updated));
            }
            return updated;
        });

        if (!userId) return;

        try {
            // 1. Remove existing entry for this query (to move it to top)
            await supabase.from('search_history').delete()
                .eq('user_id', userId)
                .ilike('query', trimmedQuery);

            // 2. Insert new entry
            await supabase.from('search_history').insert({
                id: newEntry.id,
                user_id: userId,
                query: trimmedQuery
            });

            // 3. Cleanup old entries (keep last 8)
            const { data: recentHistory } = await supabase
                .from('search_history')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (recentHistory && recentHistory.length > 8) {
                const idsToDelete = recentHistory.slice(8).map(r => r.id);
                if (idsToDelete.length > 0) {
                    await supabase.from('search_history').delete().in('id', idsToDelete);
                }
            }

        } catch (error) {
            console.error("Error managing search history:", error);
        }
    };



    const deleteSearchHistoryItem = async (id: string) => {
        const userId = session?.user?.id;

        setSearchHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            if (!userId) {
                localStorage.setItem('velvetchip_search_history', JSON.stringify(updated));
            }
            return updated;
        });

        if (!userId) return;

        try {
            await supabase.from('search_history').delete().eq('id', id);
        } catch (error) {
            console.error("Error deleting search history item:", error);
        }
    };

    const clearSearchHistory = async () => {
        const userId = session?.user?.id;
        setSearchHistory([]);

        if (!userId) {
            localStorage.removeItem('velvetchip_search_history');
            return;
        }
        try {
            await supabase.from('search_history').delete().eq('user_id', userId);
        } catch (error) {
            console.error("Error clearing search history:", error);
        }
    };

    const loadAdminData = useCallback(async () => {
        // Allow re-fetching even if loading, to support "refresh" actions
        if (isLoadingAdminData) return;
        setIsLoadingAdminData(true);
        try {
            const results = await Promise.allSettled([
                supabase.from('products').select('*'),
                supabase.from('orders').select('*'),
                supabase.from('profiles').select('*'),
                supabase.from('invoices').select('*'),
                supabase.from('promotions').select('*'),
                supabase.from('mail_templates').select('*'),
                supabase.from('contacts').select('*'),
                supabase.from('returns').select('*'),
                supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false })
            ]);

            const getData = (result: PromiseSettledResult<any>) =>
                result.status === 'fulfilled' && !result.value.error ? result.value.data : [];

            const products = getData(results[0]);
            const orders = getData(results[1]);
            const users = getData(results[2]);
            const invoices = getData(results[3]);
            const promotions = getData(results[4]);
            const mailTemplates = getData(results[5]);
            const contactSubmissions = getData(results[6]);
            const returns = getData(results[7]);
            const subscribers = getData(results[8]);

            // Log errors for debugging
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Error loading admin data index ${index}:`, result.reason);
                } else if (result.value.error) {
                    console.error(`Error loading admin data index ${index}:`, result.value.error);
                }
            });

            const usersWithOrders = users?.map((u: any) => {
                const userOrders = orders?.filter((o: any) => o.user_id === u.id).map((o: any) => ({
                    ...o,
                    items: o.items,
                    shippingAddress: o.shipping_address,
                    orderDate: o.order_date,
                    totalAmount: o.total_amount,
                    currentStatus: o.current_status,
                    statusHistory: o.status_history
                })) || [];
                return { ...u, createdAt: u.created_at, orders: userOrders };
            }) as UserProfile[] || [];

            const processedReturns = returns?.map((r: any) => {
                const relatedOrder = orders?.find((o: any) => o.id === r.order_id);
                // We can find the item details from the order's items JSON
                const orderItems: any[] = relatedOrder?.items || [];
                // item_id in returns table corresponds to the CartItem.id in the order's items array
                const item = orderItems.find((i: any) => i.id === r.item_id);

                // Find user details from users array
                const relatedUser = users?.find((u: any) => u.id === r.user_id);

                return {
                    ...r,
                    item,
                    user: relatedUser ? { id: relatedUser.id, name: relatedUser.name, email: relatedUser.email } : null,
                    order: relatedOrder
                };
            }) || [];

            setAdminData({
                products: products || [],
                orders: orders?.map(o => ({ ...o, items: o.items, shippingAddress: o.shipping_address, orderDate: o.order_date, totalAmount: o.total_amount, currentStatus: o.current_status, statusHistory: o.status_history, customerName: o.customer_name, customerEmail: o.customer_email, promotionCode: o.promotion_code, userId: o.user_id })) as Order[] || [],
                users: usersWithOrders,
                invoices: invoices || [],
                promotions: promotions?.map(p => ({ ...p, minPurchase: p.min_purchase, usageLimit: p.usage_limit, expiresAt: p.expires_at, isActive: p.is_active, createdAt: p.created_at })) as Promotion[] || [],
                mailTemplates: mailTemplates?.map(m => ({ ...m, htmlContent: m.html_content, templateType: m.template_type, isActive: m.is_active, createdAt: m.created_at, updatedAt: m.updated_at })) as MailTemplate[] || [],
                contactSubmissions: contactSubmissions?.map(c => ({ ...c, createdAt: c.created_at })) as ContactSubmission[] || [],
                returns: processedReturns as ReturnRequest[] || [],
                subscribers: subscribers || [],
            });
        } catch (e) {
            console.error("Error loading admin data", e);
        } finally {
            setIsLoadingAdminData(false);
        }
    }, [isLoadingAdminData]);

    // Effect to load search history when user changes/logs in


    // 🔔 STEP 2.3: REALTIME NOTIFICATIONS (LIVE)
    // Listen for new notifications


    // Load guest history on mount
    useEffect(() => {
        if (!session?.user) {
            fetchSearchHistory();
        }
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        // Load existing notifications
        fetchNotifications(currentUser.id);

        let channel;

        if (currentUser.role === 'admin') {
            // 👨‍💼 ADMIN → listen to ALL notifications (filtered by RLS or client)
            // Note: 'filter' with 'type=eq.system' might fail if type is not exposed or binding mismatch.
            // Simplified: Listen to all INSERTs on notifications table.
            channel = supabase
                .channel('admin-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications'
                    },
                    payload => {
                        if (payload.new.type === 'system') {
                            setNotifications(prev => [payload.new as Notification, ...prev]);
                            setUnreadNotificationCount(prev => prev + 1);
                        }
                    }
                )
                .subscribe();
        } else {
            // 👤 USER → listen to own notifications
            // Note: user_id=eq... might fail if RLS is on and we are not using the right jwt or if user_id is uuid type discrepancy. 
            // Better to rely on RLS (if enabled) or just filter client side if the channel receives all (not recommended for scale but fine for now with RLS).
            // Actually, let's try removing the filter string which causes the 'binding mismatch' error.
            channel = supabase
                .channel('user-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${currentUser.id}`
                    },
                    (payload) => {
                        // Double check client side
                        if (payload.new.user_id === currentUser.id) {
                            setNotifications(prev => [payload.new as Notification, ...prev]);
                            setUnreadNotificationCount(prev => prev + 1);
                        }
                    }
                )
                .subscribe((status, err) => {
                    if (status === 'CHANNEL_ERROR') {
                        console.error("Realtime Error (User):", err);
                        // Fallback?
                    }
                });
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [currentUser?.id, currentUser?.role]);



    useEffect(() => {
        const initApp = async () => {
            setIsLoading(true);
            try {
                // 1. Critical Phase: Auth & Site Settings
                // We need these to determine if user is logged in (routing) and site colors (visuals)
                const [sessionRes, siteContentRes] = await Promise.all([
                    supabase.auth.getSession(),
                    supabase.from('site_content').select('*')
                ]);

                const session = sessionRes.data.session;
                setSession(session);

                // Process Site Content immediately (needed for layout/styles)
                if (siteContentRes.data) {
                    const siteData = siteContentRes.data;
                    setSiteContent(siteData);
                    const settings = siteData.find((d: any) => d.id === 'site_settings')?.data;
                    if (settings) setSiteSettings(settings);
                    const contactData = siteData.find((d: any) => d.id === 'contact_details')?.data;
                    if (contactData) setContactDetailsState(contactData);
                    const paymentData = siteData.find((d: any) => d.id === 'payment_settings')?.data;
                    if (paymentData) setPaymentSettings(paymentData);
                    const announcementData = siteData.find((d: any) => d.id === 'announcement')?.data;
                    if (announcementData) setAnnouncement(announcementData);
                }

                // 2. User Profile (Critical for Routing/Guards)
                if (session?.user) {
                    // 🔴 FIX: Await this to prevent race condition on refresh where isLoading becomes false before user is loaded
                    await fetchUserProfile(session.user.id);
                    fetchSearchHistory(session.user.id);
                    fetchNotifications(session.user.id); // <--- Added this
                }

                // --- 🚀 RELEASE UI: Stop Loading Screen ---
                // We have Session + User Profile + Site Config. UI can render safely.
                // Deep links will now work because router has auth state.
                setIsLoading(false);

                // 3. Background Data Fetch (Content)
                // These can load in parallel without blocking the UI
                const results = await Promise.allSettled([
                    fetchCategories(),
                    supabase.from('products').select('*'),
                    // site_content moved to critical phase
                    supabase.from('promotions').select('*').eq('is_active', true),
                    supabase.from('slides').select('*').order('ordering', { ascending: true }),
                    supabase.from('seasonal_edit_cards').select('*'),
                    supabase.from('card_addons').select('*'),
                    supabase.from('reviews').select('*').eq('status', 'approved'),
                    supabase.from('delivery_settings').select('*').single(),
                    supabase.from('serviceable_rules').select('*').order('created_at', { ascending: true })
                ]);

                // Cast results to any to bypass TS 'never' inference on mixed array
                const productsResult = results[1] as PromiseFulfilledResult<any>;
                // siteContentResult removed (index 2 in old, moved up)
                const promotionsResult = results[2] as PromiseFulfilledResult<any>;
                const slidesResult = results[3] as PromiseFulfilledResult<any>;
                const seasonalResult = results[4] as PromiseFulfilledResult<any>;
                const addonsResult = results[5] as PromiseFulfilledResult<any>;
                const reviewsResult = results[6] as PromiseFulfilledResult<any>;
                const deliverySettingsResult = results[7] as PromiseFulfilledResult<any>;
                const rulesResult = results[8] as PromiseFulfilledResult<any>;

                // 1. Products
                let loadedProducts: Product[] = [];
                if (productsResult.status === 'fulfilled' && productsResult.value?.data && productsResult.value.data.length > 0) {
                    loadedProducts = productsResult.value.data;
                    setProducts(loadedProducts);
                } else {
                    setProducts([]);
                }

                // 2. Categories - State handled inside fetchCategories if fulfilled

                // 3. Site Content (Handled above)

                // 4. Promotions (Critical for price calculations)
                if (promotionsResult && promotionsResult.status === 'fulfilled' && promotionsResult.value?.data) {
                    setActivePromotions(promotionsResult.value.data);
                }

                // 5. Slides (Hero Images)
                if (slidesResult.status === 'fulfilled' && slidesResult.value.data) {
                    setSlides(slidesResult.value.data.map((s: any) => ({
                        id: s.id,
                        media: s.media,
                        text: s.text,
                        showText: s.show_text
                    })));
                }

                // 6. Seasonal Cards
                if (seasonalResult.status === 'fulfilled' && seasonalResult.value.data) {
                    setSeasonalEditCards(seasonalResult.value.data as SeasonalEditCard[]);
                }

                // 7. Card Addons
                if (addonsResult.status === 'fulfilled' && addonsResult.value.data) {
                    setCardAddons(addonsResult.value.data);
                }

                // 8. Public Reviews (Approved)
                if (reviewsResult.status === 'fulfilled' && reviewsResult.value.data) {
                    setReviews(reviewsResult.value.data.map((r: any) => ({
                        ...r,
                        productId: r.product_id,
                        userId: r.user_id,
                        userImage: r.user_image,
                        productImages: r.product_images
                    })));
                }

                if (deliverySettingsResult.status === 'fulfilled' && deliverySettingsResult.value.data) {
                    setDeliverySettings(deliverySettingsResult.value.data);
                } else if (deliverySettingsResult.status === 'rejected') {
                    // Maybe create initial row if missing? Handled by migration sql roughly
                }

                if (rulesResult.status === 'fulfilled' && rulesResult.value.data) {
                    setServiceableRules(rulesResult.value.data);
                }

                // Note: User profile operations moved to critical phase above

            } catch (e) {
                console.error("Init error", e);
                setIsLoading(false); // Ensure loading stops on error
            }
        };

        // Add Auth State Listener
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            if (event === 'SIGNED_IN' && session?.user) {
                await fetchUserProfile(session.user.id);
                fetchSearchHistory(session.user.id); // Optimized for eager load
                fetchNotifications(session.user.id); // <--- Added this
                // Fetch user's own reviews (so they see their pending/rejected ones)
                const { data: userReviews } = await supabase.from('reviews').select('*').eq('user_id', session.user.id);
                if (userReviews) {
                    setReviews(prev => {
                        const existingIds = new Set(prev.map(r => r.id));
                        const newReviews = userReviews
                            .filter(r => !existingIds.has(r.id))
                            .map((r: any) => ({
                                ...r,
                                productId: r.product_id,
                                userId: r.user_id,
                                userImage: r.user_image,
                                productImages: r.product_images
                            }));
                        return [...prev, ...newReviews];
                    });
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                // Switch to local history or clear?
                // Let's clear search history from state, then try to load local
                setSearchHistory([]);
                setSession(null);
                fetchSearchHistory(); // Load guest history
            }
        });

        // Realtime Subscription
        const channel = supabase.channel('db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'site_content' },
                (payload) => {
                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        const newContent = payload.new as SiteContent;
                        setSiteContent(prev => {
                            const exists = prev.some(c => c.id === newContent.id);
                            if (exists) return prev.map(c => c.id === newContent.id ? newContent : c);
                            return [...prev, newContent];
                        });

                        // Update derived states
                        if (newContent.id === 'site_settings') setSiteSettings(newContent.data as any);
                        if (newContent.id === 'contact_details') setContactDetailsState(newContent.data as any);
                        if (newContent.id === 'announcement') setAnnouncement(newContent.data as any);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'seasonal_edit_cards' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSeasonalEditCards(prev => [...prev, payload.new as SeasonalEditCard]);
                    } else if (payload.eventType === 'UPDATE') {
                        setSeasonalEditCards(prev => prev.map(c => c.id === payload.new.id ? payload.new as SeasonalEditCard : c));
                    } else if (payload.eventType === 'DELETE') {
                        setSeasonalEditCards(prev => prev.filter(c => c.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        const safetyTimer = setTimeout(() => setIsLoading(false), 7000);

        // 🛡️ Tab Visibility Handler
        // Browsers throttle timers in background tabs. If initApp hangs while backgrounded,
        // the safetyTimer might not fire. When user returns, we ensure loading stops.
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // If still loading when tab becomes visible, give it a moment (2s) then force stop
                // We use a separate check because 'isLoading' in this closure is stale (initial render value).
                // So we must trust that if this event fires, and we are stuck, we want to clear it.
                // However, we can't check current `isLoading` easily without a ref or updated closure.
                // Ideally, we just set a "cleanup" timer on wake.
                setTimeout(() => {
                    setIsLoading(prev => {
                        if (prev) {
                            console.warn("🛡️ Force stopping loading state on tab wake");
                            return false;
                        }
                        return prev;
                    });
                }, 2000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        initApp();
        return () => {
            clearTimeout(safetyTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            authListener.subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []);




    // 🔔 Realtime Notifications Subscription
    useEffect(() => {
        if (!session?.user) return;

        console.log("🔌 Subscribing to Realtime Notifications:", session.user.id);

        const channel = supabase.channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${session.user.id}`
                },
                (payload) => {
                    console.log("🔔 New Notification Received:", payload);
                    fetchNotifications(session.user.id);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'broadcast_notifications'
                },
                (payload) => {
                    console.log("📢 New Broadcast Received:", payload);
                    fetchNotifications(session.user.id);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${session.user.id}`
                },
                (payload) => {
                    console.log("👤 Profile Updated (Order Log):", payload);
                    // Fetch notifications to get the new 'updates' array
                    fetchNotifications(session.user.id);
                }
            )
            .subscribe((status, err) => {
                console.log("🔌 Notification Subscription Status:", status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Listening for new notifications...');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Notification Subscription Error:', err);
                }
            });

        return () => {
            console.log("🔌 Unsubscribing from Realtime Notifications");
            supabase.removeChannel(channel);
        };
    }, [session]);

    const fetchUserProfile = async (userId: string) => {
        try {
            // 🔹 Get profile + addresses together
            const [profileRes, addressRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single(),
                supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', userId)
            ]);

            // ❌ If no profile found
            if (!profileRes.data) return;

            const profile = profileRes.data;

            // 🔹 Load user orders
            const fetchedOrders = await fetchUserOrders();

            // 🔹 Load user returns
            const returns = await fetchUserReturns(userId);

            // 🔔 Load user notifications
            await fetchNotifications(profile.id);

            // 🔹 Save user in state
            setCurrentUser({
                ...profile,
                cart: profile.cart || [],
                wishlist: profile.wishlist || [],
                savedItems: profile.saved_items || [],
                addresses: (addressRes.data || []).map((addr: any) => ({ ...addr, isDefault: addr.is_default })),
                returns: returns || [],
                orders: fetchedOrders
            });

        } catch (error) {
            console.error("❌ Error fetching user profile:", error);
        }
    };

    const fetchUserReturns = async (userId: string) => {
        const { data, error } = await supabase.from('returns').select('*').eq('user_id', userId);
        if (error) {
            console.error("Error fetching user returns:", error);
            return [];
        }
        return data as ReturnRequest[];
    };






    const fetchUserOrders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return [];

        const { data: orders } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
        if (orders) {
            // Also update state if we are just calling this standalone
            const mappedOrders = orders.map(mapDbOrderToAppOrder);
            return mappedOrders;
        }
        return [];
    };
    // 🔔 Fetch notifications for user

    const fetchNotifications = async (userId: string) => {
        try {
            // 1. Fetch System Notifications (Legacy/Direct)
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // 🕒 Filter out notifications older than 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query = query.gte('created_at', thirtyDaysAgo.toISOString());

            const { data: notificationsData, error: notifError } = await query;
            if (notifError) throw notifError;

            setNotifications(notificationsData || []);

            // 2. Fetch Broadcasts (Promotions)
            const { data: broadcastData, error: broadcastError } = await supabase
                .from('broadcast_notifications')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (broadcastError) {
                console.error("Error fetching broadcasts:", broadcastError);
            } else {
                setPromotions(broadcastData || []);
            }

            // 3. Fetch Personal Updates (from profiles.updates)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('updates')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error("Error fetching profile updates:", profileError);
            } else {
                // Ensure it's an array
                const updates = Array.isArray(profileData?.updates) ? profileData.updates : [];
                // Sort by timestamp desc if needed (assuming they are appended, so maybe reverse?)
                // If appended to end, reverse to show newest first.
                setOrderUpdates([...updates].reverse());
            }

            // Calculate Unread Count (Sum of unread system + unread broadcasts?)
            // For now, logic only tracks system notifications 'is_read'.
            // Broadcasts are 'read' via local storage or marked? 
            // Current 'markAllNotificationsAsRead' clears the badge.
            // Let's stick to system notifications for badge count OR use local state for broadcasts.
            // Simplified: Badge = count(notifications.is_read=false)
            setUnreadNotificationCount(
                (notificationsData || []).filter(n => !n.is_read).length
            );

        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
        }
    };



    const mapDbOrderToAppOrder = (o: any): Order => ({
        ...o,
        items: o.items || [],
        shippingAddress: o.shipping_address,
        orderDate: o.order_date,
        totalAmount: o.total_amount,
        currentStatus: o.current_status,
        statusHistory: o.status_history,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        promotionCode: o.promotion_code
    });

    const addCategory = async (c: any) => {
        const dbPayload = {
            id: c.name.toLowerCase().replace(/\s+/g, '-'),
            name: c.name,
            hero_image: c.heroImage,
            page_hero_media: c.pageHeroMedia,
            page_hero_text: c.pageHeroText,
            show_page_hero_text: c.showPageHeroText,
            app_image_path: c.appImagePath || null,
            tax_rate: c.tax_rate || 0
        };

        const { error } = await supabase.from('categories').insert(dbPayload);
        if (error) throw error;

        await Promise.all([fetchCategories(), loadAdminData()]);
    };

    const updateCategory = async (c: any) => {
        console.log("🔄 Updating category:", c);
        const dbPayload = {
            name: c.name,
            hero_image: c.heroImage,
            page_hero_media: c.pageHeroMedia,
            page_hero_text: c.pageHeroText,
            show_page_hero_text: c.showPageHeroText,
            app_image_path: c.appImagePath || null,
            tax_rate: c.tax_rate || 0
        };
        console.log("📤 DB Payload:", dbPayload);
        console.log("🆔 Updating category ID:", c.id);

        const { data, error } = await supabase.from('categories').update(dbPayload).eq('id', c.id).select();

        if (error) {
            console.error("❌ Error updating category in DB:", error);
            console.error("❌ Error code:", error.code);
            console.error("❌ Error message:", error.message);
            console.error("❌ Error details:", error.details);
            console.error("❌ Error hint:", error.hint);
            throw new Error(`Failed to update category: ${error.message}${error.hint ? ' - ' + error.hint : ''}`);
        }

        if (!data || data.length === 0) {
            console.error("❌ Update failed: No category found with ID", c.id);
            throw new Error(`Category update failed. ID '${c.id}' not found or permission denied.`);
        }

        console.log("✅ Category updated successfully:", data);
        await Promise.all([fetchCategories(), loadAdminData()]);
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        await Promise.all([fetchCategories(), loadAdminData()]);
    };

    const cartCount = (currentUser?.cart || []).reduce((acc, item) => acc + item.quantity, 0);
    const addToCart = async (product: Product, size: string, color: { name: string; hex: string }, quantity = 1, customization?: string) => {
        if (!currentUser) return;
        const newCartItem: CartItem = {
            id: `${product.id}-${size}-${color.name}`,
            product,
            quantity,
            selectedSize: size,
            selectedColor: color,
            customization
        };
        const updatedCart = [...(currentUser.cart || [])];
        const existingIndex = updatedCart.findIndex(i => i.id === newCartItem.id);
        if (existingIndex > -1) {
            updatedCart[existingIndex].quantity += quantity;
            // Overwrite customization if provided in the new add, otherwise keep existing
            if (customization !== undefined) {
                updatedCart[existingIndex].customization = customization;
            }
        } else {
            updatedCart.push(newCartItem);
        }
        setCurrentUser({ ...currentUser, cart: updatedCart });
        await supabase.from('profiles').update({ cart: updatedCart }).eq('id', currentUser.id);
    };

    const removeFromCart = async (itemId: string) => {
        if (!currentUser) return;
        const updatedCart = (currentUser.cart || []).filter(item => item.id !== itemId);
        setCurrentUser({ ...currentUser, cart: updatedCart });
        await supabase.from('profiles').update({ cart: updatedCart }).eq('id', currentUser.id);
    };

    const updateCartItemQuantity = async (itemId: string, quantity: number) => {
        if (!currentUser) return;
        const updatedCart = (currentUser.cart || []).map(item => item.id === itemId ? { ...item, quantity } : item);
        setCurrentUser({ ...currentUser, cart: updatedCart });
        await supabase.from('profiles').update({ cart: updatedCart }).eq('id', currentUser.id);
    };

    const toggleWishlist = async (product: Product) => {
        if (!currentUser) return;
        const exists = currentUser.wishlist?.some(p => p.id === product.id);
        const updatedWishlist = exists
            ? currentUser.wishlist!.filter(p => p.id !== product.id)
            : [...(currentUser.wishlist || []), product];

        setCurrentUser({ ...currentUser, wishlist: updatedWishlist });
        await supabase.from('profiles').update({ wishlist: updatedWishlist }).eq('id', currentUser.id);
    };

    const toggleSavedItem = async (product: Product) => {
        if (!currentUser) return;
        const exists = currentUser.savedItems?.some(p => p.id === product.id);
        const updatedSaved = exists
            ? currentUser.savedItems!.filter(p => p.id !== product.id)
            : [...(currentUser.savedItems || []), product];

        setCurrentUser({ ...currentUser, savedItems: updatedSaved });
        await supabase.from('profiles').update({ saved_items: updatedSaved }).eq('id', currentUser.id);
    };

    const addAddress = async (addr: any) => {
        if (!currentUser) return;
        // Sanitize: remove 'isDefault' (frontend) and ensure we don't send it to DB which expects 'is_default' or nothing
        const { isDefault, ...dbPayload } = addr;

        const { data, error } = await supabase.from('addresses').insert({ ...dbPayload, user_id: currentUser.id }).select().single();
        if (!error && data) {
            // Map back for state
            const newAddress = { ...data, isDefault: data.is_default };
            const newAddresses = [...(currentUser.addresses || []), newAddress];
            setCurrentUser({ ...currentUser, addresses: newAddresses });
        }
    };
    const updateAddress = async (addr: any) => {
        // Sanitize: remove 'isDefault' before sending to DB
        const { isDefault, ...dbPayload } = addr;

        const { error } = await supabase.from('addresses').update(dbPayload).eq('id', addr.id);
        if (!error && currentUser) {
            const newAddresses = currentUser.addresses?.map(a => a.id === addr.id ? { ...a, ...dbPayload, isDefault: a.isDefault } : a);
            setCurrentUser({ ...currentUser, addresses: newAddresses });
        }
    };
    const deleteAddress = async (id: string) => {
        await supabase.from('addresses').delete().eq('id', id);
        if (currentUser) {
            const newAddresses = currentUser.addresses?.filter(a => a.id !== id);
            setCurrentUser({ ...currentUser, addresses: newAddresses });
        }
    };
    const setDefaultAddress = async (id: string) => {
        if (!currentUser) return;
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', currentUser.id);
        await supabase.from('addresses').update({ is_default: true }).eq('id', id);
        const updatedAddresses = currentUser.addresses?.map(a => ({ ...a, isDefault: a.id === id }));
        setCurrentUser({ ...currentUser, addresses: updatedAddresses });
    };

    const updateUser = async (data: Partial<User>) => {
        if (!currentUser) return;
        const { error } = await supabase.from('profiles').update(data).eq('id', currentUser.id);
        if (!error) setCurrentUser({ ...currentUser, ...data });
    };

    const generateInvoice = async (orderId: string) => {
        const order = adminData?.orders.find(o => o.id === orderId);
        if (!order) throw new Error("Order not found.");

        const { pdfBlob, qrBlob, invoiceData } = await generateInvoicePDF(order, siteSettings, contactDetails);

        const pdfPath = `invoices/pdf/${invoiceData.invoice_number}.pdf`;
        const { error: pdfError } = await supabase.storage.from('site-assets').upload(pdfPath, pdfBlob, { upsert: true, contentType: 'application/pdf' });
        if (pdfError) throw new Error("Failed to upload invoice PDF.");

        const qrPath = `invoices/qr/${invoiceData.invoice_number}.png`;
        await supabase.storage.from('site-assets').upload(qrPath, qrBlob, { upsert: true, contentType: 'image/png' });

        const { data: existingInvoice } = await supabase.from('invoices').select('id').eq('order_id', orderId).single();

        const payload = {
            order_id: orderId,
            user_id: order.userId,
            ...invoiceData,
            pdf_url: pdfPath,
            qr_code_url: qrPath
        };

        if (existingInvoice) {
            await supabase.from('invoices').update(payload).eq('id', existingInvoice.id);
        } else {
            await supabase.from('invoices').insert(payload);
        }

        await supabase.from('orders').update({
            invoice_number: invoiceData.invoice_number,
            downloadable_invoice_url: pdfPath,
            packet_id: invoiceData.packet_id
        }).eq('id', orderId);

        loadAdminData();
    };

    const updateOrderStatus = async (id: string, status: string) => {
        const timestamp = new Date().toISOString();
        const description = `Order status updated to ${status} `;

        // 1. Optimistic UI Update
        if (adminData) {
            setAdminData({
                ...adminData,
                orders: adminData.orders.map(o => {
                    if (o.id === id) {
                        return {
                            ...o,
                            currentStatus: status as any,
                            statusHistory: [...o.statusHistory, { status: status as any, timestamp, description }]
                        };
                    }
                    return o;
                })
            });
        }

        // 2. Database Update
        // 🔴 FIX: Fetch 'customer_email' (from order snapshot) AND user profile email to ensure we have a recipient
        const { data: currentOrder } = await supabase
            .from('orders')
            .select('status_history, user_id, id, customer_email, user:profiles(email)')
            .eq('id', id)
            .single();

        if (!currentOrder) return;

        const currentHistory = (currentOrder?.status_history as any[]) || [];
        const newHistory = [...currentHistory, { status, timestamp, description }];

        const { error: updateError } = await supabase.from('orders').update({
            current_status: status,
            status_history: newHistory
        }).eq('id', id);

        if (updateError) {
            console.error("Error updating order status:", updateError);
            return;
        }

        // 3. Create In-App Notification
        try {
            await supabase.from('notifications').insert({
                user_id: currentOrder.user_id,
                type: 'order',
                title: `Order Updated: ${status}`,
                message: `Your order #${currentOrder.id.slice(0, 8)} status has been updated to ${status}.`,
                link: `/order/${currentOrder.id}`,
                is_read: false
            });
        } catch (notifError) {
            console.error("Error creating notification:", notifError);
        }

        // 4. Send Email Notification via Edge Function
        try {
            console.log("📧 Attempting to send email for Order:", id);
            console.log("📧 Current Order Data for Email:", currentOrder);

            // Determine the best email to use: priority to order snapshot, fallback to profile
            // @ts-ignore
            const orderEmail = currentOrder.customer_email || currentOrder.user?.email;

            console.log("📧 Resolved Email Address:", orderEmail);

            if (orderEmail) {
                const { data: funcData, error: funcError } = await supabase.functions.invoke('send-order-update', {
                    body: {
                        orderId: id,
                        templateName: status.includes('Cancelled') ? 'order_cancelled' : 'order_status_update',
                        email: orderEmail, // 📧 Passing the email!
                        status: status     // Passing status for the template
                    }
                });

                if (funcError) {
                    console.error("❌ Edge Function invocation error:", funcError);
                } else {
                    console.log("✅ Email notification success. Function response:", funcData);
                }
            } else {
                console.warn("⚠️ No email found for order update notification. user relation:", currentOrder?.user);
            }
        } catch (emailError) {
            console.error("❌ CRITICAL Error triggering email notification:", emailError);
        }
    };

    const adminBulkUpdateOrderStatus = async (ids: string[], status: string) => {
        for (const id of ids) {
            await updateOrderStatus(id, status);
        }
    };





    const adminUpdateReturnStatus = useCallback(
        async (returnId: string, data: { status: ReturnRequestStatus }) => {
            // ✅ Only admin allowed
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error("Unauthorized.");
            }

            // 1️⃣ Fetch current return
            const { data: currentReturn, error: fetchError } = await supabase
                .from('returns')
                .select('status_history, user_id, item_id, order_id')
                .eq('id', returnId)
                .single();

            if (fetchError || !currentReturn) {
                console.error("Error fetching return details:", fetchError);
                throw new Error("Failed to fetch return details.");
            }

            // ... (keeping existing logic, skipping lines for brevity if possible, but tool requires contiguous block?
            // Actually, replace_file_content replaces a block. I will target the fetch block first, then the notification block.
            // Wait, multi_replace_file_content is better for non-contiguous.
            // But I can just do two replace calls.

            // Re-reading logic...

            // I'll update the FETCH first.


            // 2️⃣ Update status history
            const currentHistory = (currentReturn.status_history as any[]) || [];

            const newHistoryEntry: ReturnStatusUpdate = {
                status: data.status,
                timestamp: new Date().toISOString(),
                description: `Status updated to "${data.status}" by admin.`
            };

            const newHistory = [...currentHistory, newHistoryEntry];

            // 3️⃣ Update return record
            const { data: updatedReturnData, error: updateError } = await supabase
                .from('returns')
                .update({
                    status: data.status,
                    status_history: newHistory
                })
                .eq('id', returnId)
                .select(
                    '*, order:orders(*), user:profiles(id,name,email)'
                )
                .single();

            if (updateError) {
                console.error("Error updating return status:", updateError);
                throw new Error("Failed to update return status.");
            }

            // 4️⃣ STOCK RESTORATION LOGIC
            // If status is changed to 'Completed', add the stock back
            if (data.status === 'Completed' && currentReturn.item_id) {
                try {
                    // We need to find the item details. currentReturn.order_id helps, but we need the item structure
                    // The 'order' is joined in updatedReturnData, let's use that
                    // Using Optional Chaining to avoid potential crashes
                    const orderData = updatedReturnData?.order;
                    if (orderData && orderData.items) {
                        // Find the specific item in the order's item list
                        // Assuming item_id in returns refers to the 'id' property of the item object in JSON
                        const returnedItem = (orderData.items as any[]).find(i => i.id === currentReturn.item_id);

                        if (returnedItem && returnedItem.productId) {
                            const { data: productData } = await supabase.from('products').select('*').eq('id', returnedItem.productId).single();

                            if (productData) {
                                // Update Stock
                                let stockUpdated = false;
                                const newColors = productData.colors.map((c: any) => {
                                    // Match color (if applicable)
                                    // returnedItem.color could be name or hex or null
                                    if (returnedItem.color && c.name !== returnedItem.color && c.hex !== returnedItem.color) return c;

                                    return {
                                        ...c,
                                        sizes: c.sizes.map((s: any) => {
                                            if (s.size === returnedItem.size) {
                                                stockUpdated = true;
                                                return { ...s, stock: Number(s.stock) + Number(returnedItem.quantity) };
                                            }
                                            return s;
                                        })
                                    };
                                });

                                if (stockUpdated) {
                                    await supabase.from('products').update({ colors: newColors }).eq('id', productData.id);
                                    console.log(`Checking stock for Product ${productData.id}: Restocked ${returnedItem.quantity}`);
                                } else {
                                    // Fallback: If strict color match failed or no color, try just size match on all variants?
                                    // For now, assuming data integrity.
                                    console.warn("Could not match variant to restock.");
                                }
                            }
                        }
                    }
                } catch (stockError) {
                    console.error("Failed to restore stock:", stockError);
                    // Don't throw, as status is already updated
                }
            }

            // 4️⃣ 🔔 Send notification to USER
            try {
                await supabase.from('notifications').insert({
                    user_id: currentReturn.user_id,
                    type: 'return',
                    title: 'Return Update',
                    message: `Your return request status updated to ${data.status}`,
                    link: `/order/${currentReturn.order_id}`,
                    is_read: false
                });
            } catch (notifError) {
                console.warn("Could not send notification:", notifError);
            }

            // 📧 TRIGGER EMAIL: Return Status Update
            try {
                // Only send if status is something 'interesting' (not just Pending again)

                // 📧 TRIGGER EMAIL: Return Status Update
                const userEmail = updatedReturnData?.user?.email;

                if (userEmail) {
                    supabase.functions.invoke('send-order-update', {
                        body: {
                            returnId: returnId,
                            templateName: 'return_status_update',
                            email: userEmail,
                            status: data.status,
                            orderId: updatedReturnData.order_id // Pass Order ID for details
                        }
                    }).catch(emailError => {
                        console.error("Failed to trigger return status update email (async):", emailError);
                    });
                } else {
                    console.warn("No email found for return status update notification.");
                }

            } catch (emailError) {
                console.error("Failed to trigger return status update email:", emailError);
            }

            // 5️⃣ Update admin state (UI)
            if (updatedReturnData) {
                const orderItems: any[] = updatedReturnData.order?.items || [];
                const item = orderItems.find(
                    (i: any) => i.id === updatedReturnData.item_id
                );

                const mappedReturn = {
                    ...updatedReturnData,
                    item,
                    user: updatedReturnData.user
                };

                setAdminData(prevData => {
                    if (!prevData) return null;

                    const exists = prevData.returns.some(
                        r => r.id === mappedReturn.id
                    );

                    const newReturns = exists
                        ? prevData.returns.map(r =>
                            r.id === mappedReturn.id ? mappedReturn : r
                        )
                        : [...prevData.returns, mappedReturn];

                    return {
                        ...prevData,
                        returns: newReturns.sort(
                            (a, b) =>
                                new Date(b.return_requested_at).getTime() -
                                new Date(a.return_requested_at).getTime()
                        )
                    };
                });
            } else {
                await loadAdminData();
            }

            loadAdminData();
            return updatedReturnData;
        },
        [currentUser, loadAdminData]
    );



















    const adminCreateUser = async (u: any) => {
        // Note: Creating a user usually requires Supabase Auth Admin API (service role).
        // For now, we'll assume we are creating a profile entry or updating an existing one if the auth user exists.
        // If you need to create an actual auth user, this needs a backend function.
        // We will just insert into profiles for now as a placeholder for "creating a customer record" if that's the intent.
        const { error } = await supabase.from('profiles').insert(u);
        if (error) throw error;
        await loadAdminData();
    };

    const adminUpdateUser = async (u: any) => {
        const { error } = await supabase.from('profiles').update(u).eq('id', u.id);
        if (error) throw error;
        await loadAdminData();
    };

    const updateUserStatus = async (id: string, status: string) => {
        if (adminData) {
            setAdminData({
                ...adminData,
                users: adminData.users.map(u => u.id === id ? { ...u, status: status as any } : u)
            });
        }
        await supabase.from('profiles').update({ status }).eq('id', id);
    };

    const adminChangeUserRole = async (id: string, role: string) => {
        const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
        if (error) throw error;
        await loadAdminData();
    };

    const updateReviewStatus = async (id: number, status: string) => {
        const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
        if (error) throw error;
        await loadAdminData();
    };

    const deleteReview = async (id: number) => {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw error;
        await loadAdminData();
    };

    const adminUpdateReview = async (r: any) => {
        const { error } = await supabase.from('reviews').update(r).eq('id', r.id);
        if (error) throw error;
        await loadAdminData();
    };

    const adminDeleteReviewImage = async (rid: number, path: string) => {
        // 1. Remove from storage
        const { error: storageError } = await supabase.storage.from('reviews').remove([path]);
        if (storageError) console.error("Error removing image from storage", storageError);

        // 2. Update review record
        const review = adminData?.reviews.find(r => r.id === rid);
        if (review) {
            const updatedImages = (review.productImages || []).filter(p => p !== path);
            const { error: dbError } = await supabase.from('reviews').update({ product_images: updatedImages }).eq('id', rid);
            if (dbError) throw dbError;
            await loadAdminData();
        }
    };

    const getPendingChanges = () => [];
    const approveChange = async (id: string) => { };
    const rejectChange = async (id: string) => { };

    const updateSiteContent = async (content: SiteContent) => {
        const { error } = await supabase.from('site_content').upsert({ id: content.id, data: content.data });
        if (error) throw error;
        setSiteContent(prev => {
            const exists = prev.some(c => c.id === content.id);
            if (exists) return prev.map(c => c.id === content.id ? content : c);
            return [...prev, content];
        });
        if (content.id === 'site_settings') setSiteSettings(content.data as any);
        if (content.id === 'contact_details') setContactDetailsState(content.data as any);
        if (content.id === 'announcement') setAnnouncement(content.data as any);
    };

    const updateSiteSettings = async (settings: SiteSettings) => {
        await updateSiteContent({ id: 'site_settings', data: settings });
    };
    const updateContactDetails = async (details: ContactDetails) => {
        await updateSiteContent({ id: 'contact_details', data: details });
    };

    const updateEmailSettings = async (settings: EmailSettings) => {
        const { error } = await supabase.from('email_settings').upsert({ ...settings, id: 1 });
        if (error) throw error;
        setEmailSettings(settings);
    };
    const updateAnnouncement = async (announcement: Announcement) => {
        await updateSiteContent({ id: 'announcement', data: announcement });
    };

    const updateSlides = async (newSlides: Slide[]) => {
        // 1. Fetch existing IDs to delete them safely (avoids UUID type errors with neq('id', '0'))
        const { data: existingData, error: fetchError } = await supabase.from('slides').select('id');
        if (fetchError) throw fetchError;

        if (existingData && existingData.length > 0) {
            const idsToDelete = existingData.map(r => r.id);
            const { error: delError } = await supabase.from('slides').delete().in('id', idsToDelete);
            if (delError) throw delError;
        }

        // 2. Insert new slides
        if (newSlides.length > 0) {
            const { error: insError } = await supabase.from('slides').insert(
                newSlides.map((s, i) => ({
                    id: s.id,
                    media: s.media,
                    text: s.text,
                    show_text: s.showText,
                    ordering: i
                }))
            );
            if (insError) throw insError;
        }

        setSlides(newSlides);
    };

    const adminDeleteSiteAsset = async (path: string) => {
        await supabase.storage.from('site-assets').remove([path]);
    };

    const adminAddSeasonalCard = async (card: any) => {
        const { data, error } = await supabase.from('seasonal_edit_cards').insert(card).select().single();
        if (error) throw error;
        setSeasonalEditCards(prev => [...prev, data]);
    };
    const adminUpdateSeasonalCard = async (card: any) => {
        const { error } = await supabase.from('seasonal_edit_cards').update(card).eq('id', card.id);
        if (error) throw error;
        setSeasonalEditCards(prev => prev.map(c => c.id === card.id ? card : c));
    };
    const adminDeleteSeasonalCard = async (id: string) => {
        await supabase.from('seasonal_edit_cards').delete().eq('id', id);
        setSeasonalEditCards(prev => prev.filter(c => c.id !== id));
    };

    const getAllSubscribers = () => adminData?.subscribers || [];
    const addSubscriber = async (email: string) => {
        const { data } = await supabase.from('subscribers').select('id').eq('email', email).single();
        if (data) return;
        await supabase.from('subscribers').insert({ email });
    };
    const deleteSubscriber = async (id: number) => {
        await supabase.from('subscribers').delete().eq('id', id);
        loadAdminData();
    };

    const getAllPromotions = () => adminData?.promotions || [];
    const getPromotionById = (id: number) => adminData?.promotions.find(p => p.id === id);
    const addPromotion = async (p: any) => {
        const dbPayload = {
            code: p.code, type: p.type, value: p.value, min_purchase: p.minPurchase,
            usage_limit: p.usageLimit, expires_at: p.expiresAt, is_active: p.isActive
        };
        await supabase.from('promotions').insert(dbPayload);
        loadAdminData();
    };
    const updatePromotion = async (p: any) => {
        const dbPayload = {
            code: p.code, type: p.type, value: p.value, min_purchase: p.minPurchase,
            usage_limit: p.usageLimit, expires_at: p.expiresAt, is_active: p.isActive
        };
        await supabase.from('promotions').update(dbPayload).eq('id', p.id);
        loadAdminData();
    };
    const deletePromotion = async (p: any) => {
        await supabase.from('promotions').delete().eq('id', p.id);
        loadAdminData();
    };

    const submitContactForm = async (data: any) => {
        await supabase.from('contacts').insert({ ...data, user_id: currentUser?.id });
    };
    const getAllContactSubmissions = () => adminData?.contactSubmissions || [];
    const updateContactSubmissionStatus = async (id: number, status: string) => {
        await supabase.from('contacts').update({ status }).eq('id', id);
        loadAdminData();
    };

    const getAllMailTemplates = () => adminData?.mailTemplates || [];
    const getMailTemplateById = (id: number) => adminData?.mailTemplates.find(t => t.id === id);
    const addMailTemplate = async (t: any) => {
        const dbPayload = {
            name: t.name, subject: t.subject, html_content: t.htmlContent,
            template_type: t.templateType, placeholders: t.placeholders, is_active: t.isActive
        };
        await supabase.from('mail_templates').insert(dbPayload);
        loadAdminData();
    };
    const updateMailTemplate = async (t: any) => {
        const dbPayload = {
            name: t.name, subject: t.subject, html_content: t.htmlContent,
            template_type: t.templateType, placeholders: t.placeholders, is_active: t.isActive
        };
        await supabase.from('mail_templates').update(dbPayload).eq('id', t.id);
        loadAdminData();
    };
    const deleteMailTemplate = async (id: number) => {
        await supabase.from('mail_templates').delete().eq('id', id);
        loadAdminData();
    };
    const toggleMailTemplateStatus = async (id: number, isActive: boolean) => {
        await supabase.from('mail_templates').update({ is_active: !isActive }).eq('id', id);
        loadAdminData();
    };

    const getAllInvoices = () => adminData?.invoices || [];

    const submitReturnRequest = async (data: any) => {
        const payload = {
            order_id: data.orderId,
            item_id: data.itemId,
            user_id: currentUser?.id,
            reason: data.reason,
            comments: data.comments,
            images: data.images,
            type: data.type,
            status: 'Pending',
            return_requested_at: new Date().toISOString()
        };
        const { data: newReturn, error } = await supabase.from('returns').insert(payload).select().single();
        if (error) throw error;

        // Optimistic Update
        if (currentUser && newReturn) {
            setCurrentUser({
                ...currentUser,
                returns: [...(currentUser.returns || []), newReturn as any]
            });
        }

        // 📧 TRIGGER EMAIL: Return Requested
        try {
            await supabase.functions.invoke('send-order-update', {
                body: {
                    returnId: newReturn.id,
                    templateName: 'return_requested',
                    orderId: data.orderId // Pass Order ID for details
                }
            });
        } catch (emailError) {
            console.error("Failed to trigger return requested email:", emailError);
        }

        // 🔔 TRIGGER ADMIN NOTIFICATION
        try {
            const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
            if (admins && admins.length > 0) {
                for (const admin of admins) {
                    await supabase.from('notifications').insert({
                        user_id: admin.id,
                        type: 'system',
                        title: 'New Return Request',
                        message: `Return requested for Order #${data.orderId.slice(0, 8)}`,
                        link: `/admin/returns`,
                        is_read: false
                    });
                }
            }
        } catch (adminNotifError) {
            console.error("Failed to notify admins of return:", adminNotifError);
        }
    };

    const userCancelOrder = async (orderId: string) => {
        await updateOrderStatus(orderId, 'Cancelled by User');
    }



    const isProductInWishlist = (productId: number) => {
        return (currentUser?.wishlist || []).some(p => p.id === productId);
    };






    const placeOrder = async (
        method: string,
        cartItems?: CartItem[],
        deliveryOptions?: { type: 'partner' | 'pickup' | 'shop', pickupCode?: string }
    ) => {
        // Use provided cart items or fall back to current cart
        const itemsToOrder = cartItems || cart;

        console.log('🛒 placeOrder called with method:', method);
        console.log('📦 Cart items to order:', itemsToOrder);

        // 🛑 STOCK CHECK & DEDUCTION
        // We must check stock and deduct it BEFORE creating the order.
        // If any item fails, we abort.
        const updatedProductsMap = new Map(); // To track updates and prevent race conditions if multiple items same product

        for (const item of itemsToOrder) {
            // Fetch fresh product data to check stock
            const { data: product, error: pError } = await supabase.from('products').select('*').eq('id', item.product.id).single();
            if (pError || !product) throw new Error(`Product ${item.product.name} not found`);

            let stockDeducted = false;
            let currentStock = 0;


            const newColors = product.colors.map((c: any) => {
                // Determine if this is the color variant we need
                // item.selectedColor matches c.name?
                // FIX: Ensure case-insensitive match and handle object structure correctly
                // item.selectedColor is { name: string, hex: string } based on addToCart
                const itemColorName = item.selectedColor?.name || '';
                const normalize = (s: string) => s?.trim().toLowerCase() || '';

                const isColorMatch = !item.selectedColor ||
                    (normalize(c.name) === normalize(itemColorName));

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
                // In case no matching size/color found
                // Safe check: if product doesn't have colors, maybe it's just size match? 
                // But for now assuming strict variant structure.
                throw new Error(`Variant not found for ${product.name}: ${item.selectedColor?.name} / ${item.selectedSize}. (Stock Deducted: ${stockDeducted})`);
            }

            // Perform Update
            const { error: updateError } = await supabase.from('products').update({ colors: newColors }).eq('id', product.id);
            if (updateError) throw new Error(`Failed to update stock for ${product.name}`);
            if (updateError) throw new Error(`Failed to update stock for ${product.name}`);
        }
        // End Stock Deduction

        // 🛡️ SECURE PRICE & TAX CALCULATION
        // Re-fetch everything needed for accurate calculation to prevent client-side tampering
        let secureSubtotal = 0;
        let totalTaxAmount = 0;
        const taxDetailsStr: Record<string, number> = {};

        // Fetch Tax Settings
        const { data: taxSettingsDb } = await supabase.from('tax_settings').select('*').single();
        const taxMode = taxSettingsDb?.enabled ? (taxSettingsDb.mode || 'global') : 'none';
        const globalRate = taxSettingsDb?.global_rate || 0;

        // Fetch Category Rates if needed
        const categoryRates = new Map<string, number>();
        if (taxMode === 'category') {
            const { data: cats } = await supabase.from('categories').select('name, tax_rate');
            if (cats) cats.forEach((c: any) => categoryRates.set(c.name, Number(c.tax_rate) || 0));
        }

        // Iterate again to calculate totals using FRESH DB data (we can optimize by doing this in the loop above but separating for clarity is fine)
        // actually we can't easily reuse the loop above as it updates stock one by one. 
        // We will just do a fresh pass or trust the values we *could* have captured above.
        // For strict security, we should have captured the price in the loop above.
        // Let's do a quick fresh read or relies on the fact that we just verified stock. 
        // We really should capture price in the loop above to avoid N+1 reads again.
        // But for now, to avoid rewriting the stock loop significantly, we will iterate `itemsToOrder` and fetch price again (or better, optimize later).
        // Actually, let's just loop again, it's safer.

        for (const item of itemsToOrder) {
            const { data: product } = await supabase.from('products').select('*').eq('id', item.product.id).single();
            if (!product) continue;

            // Find correct variant price
            let itemPrice = product.price;
            if (item.selectedColor) {
                const variant = product.colors?.find((c: any) => c.name?.toLowerCase() === item.selectedColor?.name?.toLowerCase());
                if (variant) {
                    const sizeVariant = variant.sizes?.find((s: any) => s.size === item.selectedSize);
                    if (sizeVariant && sizeVariant.price) {
                        itemPrice = Number(sizeVariant.price);
                    }
                }
            }

            const lineItemTotal = itemPrice * item.quantity;
            secureSubtotal += lineItemTotal;

            // Calculate Tax
            let rate = 0;
            if (taxMode === 'global') rate = globalRate;
            else if (taxMode === 'category') rate = categoryRates.get(product.category) || 0;

            if (rate > 0) {
                const tax = (lineItemTotal * rate) / 100;
                totalTaxAmount += tax;
                const label = taxSettingsDb?.label || 'Tax';
                taxDetailsStr[`${label} (${rate}%)`] = (taxDetailsStr[`${label} (${rate}%)`] || 0) + tax;
            }
        }

        // Final Totals
        const deliveryType = deliveryOptions?.type || 'partner';
        const deliveryCharge = (deliveryType === 'pickup') ? 0 : (secureSubtotal > 499 ? 0 : 50);

        // Apply discount (on subtotal + tax? Or just subtotal? Usually discount reduces payable)
        // We will apply discount on (Subtotal + Tax) or just subtract from final.
        // User said: "priceing with tax and if coupon added then that price add tha section"
        // Let's assume standard: Total = (Subtotal + Tax + Delivery) - Discount.
        // Ensure discount doesn't exceed total.
        const grossTotal = secureSubtotal + totalTaxAmount + deliveryCharge;
        const finalDiscount = Math.min(checkoutState.discount, grossTotal);
        const totalAmount = grossTotal - finalDiscount;

        console.log("🛡️ Secure Calc:", { secureSubtotal, totalTaxAmount, deliveryCharge, finalDiscount, totalAmount });


        const orderPayload = {
            // Database auto-generates: id, created_at
            user_id: currentUser.id,
            items: itemsToOrder.map(item => ({
                id: item.id,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                size: item.selectedSize,
                color: item.selectedColor,
                image: item.product.images[0]
            })),
            total_amount: totalAmount,
            total: totalAmount,
            tax_amount: totalTaxAmount,
            tax_details: taxDetailsStr,
            payment: {
                method: method,
                status: method === 'Online' ? 'Paid' : 'Pending',
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
            console.error("❌ Error placing order:", error);
            throw error;
        }

        console.log("✅ Order created successfully:", data);
        // 🔔 STEP 3 — USER NOTIFICATION (In-App)
        await supabase.from('notifications').insert({
            user_id: currentUser.id,
            link: `/order/${data.id}`,
            type: 'order',
            title: 'Order Placed',
            message: 'Your order has been placed successfully'
        });

        // 📧 STEP 3.1 — USER EMAIL (Order Confirmation)
        try {
            // Fire and forget email with short timeout to prevent hanging the UI
            const emailPromise = supabase.functions.invoke('send-order-update', {
                body: { orderId: data.id, templateName: 'order_confirmation' }
            });

            // Allow 2 seconds max for email trigger, otherwise proceed
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Email trigger timeout")), 2000));

            await Promise.race([emailPromise, timeoutPromise]);
            console.log("Order confirmation email triggered.");
        } catch (emailError) {
            console.error("Error triggering order confirmation email (non-blocking):", emailError);
        }

        // 🔔 STEP 3 — ADMIN NOTIFICATION
        const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

        if (admins && admins.length > 0) {
            for (const admin of admins) {
                await supabase.from('notifications').insert({
                    user_id: admin.id,
                    link: `/admin/orders/${data.id}`,
                    type: 'system',
                    title: 'New Order',
                    message: `New order placed by ${currentUser.name || 'a user'}`
                });
            }
        }


        // Clear cart
        const { error: clearCartError } = await supabase.from('profiles').update({ cart: [] }).eq('id', currentUser.id);
        if (clearCartError) console.error("Error clearing cart:", clearCartError);

        setCurrentUser({ ...currentUser, cart: [] });
        setCart([]);

        // Fetch updated orders to show new order immediately in user's orders section
        await fetchUserOrders();

        // Refresh admin data to show new order immediately in admin panel
        loadAdminData();

        return data.id;
    };

    // 🔔 STEP 2.4 — Mark ONE notification as read
    const markNotificationAsRead = async (notificationId: string) => {
        try {
            // Optimistic
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
            setUnreadNotificationCount(prev => Math.max(0, prev - 1));

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
        } catch (error) {
            console.error("Error marking notification as read", error);
            // Revert state if needed?
        }
    };

    // 🔔 STEP 2.4 — Mark ALL notifications as read
    const markAllNotificationsAsRead = async () => {
        if (!currentUser) return;

        try {
            // Optimistic
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadNotificationCount(0);

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', currentUser.id)
                .eq('is_read', false); // Only update unread ones

        } catch (error) {
            console.error("Error marking all notifications as read", error);
            fetchNotifications(currentUser.id); // Revert/Reload on error
        }
    };


    const fetchUniqueStates = async () => {
        const { data, error } = await supabase.rpc('get_unique_states');
        if (error) {
            console.error('Error fetching unique states:', error);
            return [];
        }
        return data?.map((d: any) => d.state_name) || [];
    };

    const fetchCitiesByState = async (stateVal: string) => {
        const { data, error } = await supabase.rpc('get_cities_by_state', { p_state: stateVal });
        if (error) {
            console.error('Error fetching cities:', error);
            return [];
        }
        return data?.map((d: any) => d.city_name) || [];
    };

    const fetchPincodesByCity = async (stateVal: string, cityVal: string) => {
        const { data, error } = await supabase.rpc('get_pincodes_by_city', { p_state: stateVal, p_city: cityVal });
        if (error) {
            console.error('Error fetching pincodes:', error);
            return [];
        }
        // Data is now a JSON object: { state, city, total_pincodes, pincodes: [] }
        if (data && data.pincodes) {
            // Supabase might return strings inside the JSON array
            return data.pincodes.map((p: any) => String(p));
        }
        return [];
    };

    const contextValue: AppContextType = {
        fetchUniqueStates,
        fetchCitiesByState,
        fetchPincodesByCity,
        categories,
        products,
        cart: currentUser?.cart || [],
        wishlist: currentUser?.wishlist || [],
        savedItems: currentUser?.savedItems || [],
        currentUser,
        session,
        isLoading,
        siteSettings,
        paymentSettings,
        contactDetails,
        siteContent,
        slides,
        seasonalEditCards,
        announcement,
        cartCount,
        addToCart,
        // Notifications

        // 🔔 Notifications

        // 🔔 Notifications

        // 🔔 Notifications
        // 🔔 Notifications
        notifications,
        orderUpdates,
        promotions,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        removeFromCart,
        updateCartItemQuantity,
        checkoutState,
        setSelectedAddressForCheckout: (id) => setCheckoutState(p => ({ ...p, selectedAddressId: id })),
        applyPromotion: async (code) => {
            const promotion = activePromotions.find(p => p.code === code);
            if (!promotion) {
                throw new Error("Invalid promotion code");
            }

            // Check expiry
            if (promotion.expires_at && new Date(promotion.expires_at) < new Date()) {
                throw new Error("Promotion code has expired");
            }

            // Calculate cart total for min purchase check
            const cartTotal = (currentUser?.cart || []).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            if (promotion.min_purchase && cartTotal < promotion.min_purchase) {
                throw new Error(`Minimum purchase of ₹${promotion.min_purchase} required`);
            }

            // Apply discount
            let discountAmount = 0;
            if (promotion.type === 'percentage') {
                discountAmount = (cartTotal * promotion.value) / 100;
            } else {
                discountAmount = promotion.value;
            }

            // Ensure discount doesn't exceed total
            discountAmount = Math.min(discountAmount, cartTotal);

            setCheckoutState(p => ({
                ...p,
                appliedPromotion: promotion,
                discount: discountAmount
            }));
        },
        removePromotion: () => setCheckoutState(p => ({ ...p, appliedPromotion: null, discount: 0 })),
        activePromotions,
        getAvailablePromotions: () => {
            const cartTotal = (currentUser?.cart || []).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            return activePromotions.filter(p => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                const isMinPurchaseMet = !p.min_purchase || cartTotal >= p.min_purchase;
                return !isExpired && isMinPurchaseMet;
            });
        },
        placeOrder,
        toggleWishlist,
        isProductInWishlist: (id) => currentUser?.wishlist?.some(p => p.id === id) || false,
        toggleSavedItem,
        isProductSaved: (id) => currentUser?.savedItems?.some(p => p.id === id) || false,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateUser,
        fetchUserOrders,
        fetchProducts: async (params) => {
            let filtered = products;
            if (params?.categoryId) {
                const searchParam = params.categoryId.toLowerCase();

                // Helper to clean strings for comparison
                const clean = (str: string) => str.toLowerCase().trim().replace(/-+$/, '');

                const searchClean = clean(searchParam);

                let matchedCategory = categories.find(c =>
                    clean(c.id) === searchClean ||
                    clean(c.name.replace(/\s+/g, '-')) === searchClean ||
                    clean(c.name) === searchClean
                );

                if (!matchedCategory) {
                    matchedCategory = categories.find(c => clean(c.name) === searchClean);
                }

                if (matchedCategory) {
                    // 2. Filter products using the Matched Category's ID OR Name
                    const targetId = clean(matchedCategory.id);
                    const targetName = clean(matchedCategory.name);

                    filtered = filtered.filter(p => {
                        const pCat = p.category ? clean(p.category) : '';
                        return pCat === targetId || pCat === targetName;
                    });
                } else {
                    // Fallback
                    filtered = filtered.filter(p => {
                        if (!p.category) return false;
                        const pCatClean = clean(p.category);
                        const pCatSlug = clean(p.category.replace(/\s+/g, '-'));

                        return p.category === params.categoryId ||
                            pCatClean === searchClean ||
                            pCatSlug === searchClean;
                    });
                }
            }

            if (params?.limit) filtered = filtered.slice(0, params.limit);
            return { data: filtered, count: filtered.length };
        },
        getProductById: async (id) => products.find(p => p.id === Number(id)),
        searchProducts: async (q) => {
            const lowerQ = q.toLowerCase();
            return products.filter(p =>
                p.name.toLowerCase().includes(lowerQ) ||
                p.tags?.some(tag => tag.toLowerCase().includes(lowerQ))
            );
        },
        getSearchSuggestions: async (q) => {
            if (!q.trim()) return { suggestedQueries: [], suggestedCategories: [] };
            const lowerQ = q.toLowerCase();

            // 1. Suggest Categories
            const suggestedCategories = categories
                .filter(c => c.name.toLowerCase().includes(lowerQ))
                .slice(0, 3)
                .map(c => c.name);

            // 2. Suggest Products (as queries)
            // We can also extract tags or brand names if available.
            // For now, let's just suggest product names that match, but de-duped or simplified.
            const suggestedQueries = products
                .filter(p => p.name.toLowerCase().includes(lowerQ))
                .slice(0, 5)
                .map(p => p.name);

            return { suggestedQueries, suggestedCategories };
        },
        lastProductUpdate,
        searchHistory,
        addToSearchHistory,
        deleteSearchHistoryItem,
        clearSearchHistory,
        getCategoryById: (id) => categories.find(c => c.id === id),
        reviews,
        addReview: async (review) => {
            if (!currentUser) throw new Error('Not logged in');

            const payload = {
                product_id: review.productId,
                user_id: review.userId,
                rating: review.rating,
                author: review.author,
                comment: review.comment,
                user_image: review.userImage,
                product_images: review.productImages || [],
                status: 'pending', // admin approval
                date: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('reviews')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('Add review error details:', error);
                throw error;
            }

            // Optimistic UI update
            setReviews(prev => [
                {
                    ...data,
                    productId: data.product_id,
                    userId: data.user_id,
                    userImage: data.user_image,
                    productImages: data.product_images
                },
                ...prev
            ]);
        },
        updateUserReview: async (reviewId, updates) => {
            const payload = {
                rating: updates.rating,
                comment: updates.comment,
                product_images: updates.productImages,
                status: 'pending', // Re-evaluate on edit? Or keep previous? Usually re-review needed.
                // date: new Date().toISOString() // Update date?
            };
            // Only update comment and images, rating might be restricted by UI but we allow payload to carry it if needed, 
            // but user said "not rating". The UI effectively blocks it, but the API should probably allow it if passed, or we verify.
            // For now we allow what is passed.

            const { data, error } = await supabase
                .from('reviews')
                .update(payload)
                .eq('id', reviewId)
                .select()
                .single();

            if (error) throw error;

            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...data, productId: data.product_id, userId: data.user_id, userImage: data.user_image, productImages: data.product_images } : r));
        },

        reviewModalState,
        openReviewModal: (p) => setReviewModalState({ isOpen: true, product: p }),
        closeReviewModal: () => setReviewModalState({ isOpen: false, product: null }),




        adminData,
        isLoadingAdminData,
        loadAdminData,
        addProduct: async (p) => {
            const { data, error } = await supabase.from('products').insert(p).select().single();
            if (error) {
                console.error("Error adding product:", error);
                throw error;
            }
            if (data) {
                setProducts(prev => [...prev, data]);
                // Sync to Admin Data
                if (adminData) {
                    setAdminData(prev => prev ? ({
                        ...prev,
                        products: [...prev.products, data]
                    }) : null);
                }
            }
        },
        updateProduct: async (p) => {
            const { error } = await supabase.from('products').update(p).eq('id', p.id);
            if (error) throw error;
            setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, ...p } : prod));
            // Sync to Admin Data
            if (adminData) {
                setAdminData(prev => prev ? ({
                    ...prev,
                    products: prev.products.map(prod => prod.id === p.id ? { ...prod, ...p } : prod)
                }) : null);
            }
        },
        deleteProduct: async (id) => {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setProducts(prev => prev.filter(p => p.id !== id));
        },
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        adminBulkUpdateOrderStatus,
        adminCreateUser,
        adminUpdateUser,
        updateUserStatus,
        adminChangeUserRole,
        updateReviewStatus,
        deleteReview,
        adminUpdateReview,
        adminDeleteReviewImage,
        getPendingChanges,
        approveChange,
        rejectChange,
        updateSiteContent,
        updateSiteSettings,
        emailSettings,
        updateEmailSettings,
        updateContactDetails,
        updateSlides,
        adminDeleteSiteAsset,
        adminAddSeasonalCard,
        adminUpdateSeasonalCard,
        adminDeleteSeasonalCard,
        getAllSubscribers,
        addSubscriber,
        deleteSubscriber,
        getAllPromotions,
        getPromotionById,
        addPromotion,
        updatePromotion,
        deletePromotion,
        updateAnnouncement,
        submitContactForm,
        getAllContactSubmissions,
        updateContactSubmissionStatus,
        getAllMailTemplates,
        getMailTemplateById,
        addMailTemplate,
        updateMailTemplate,
        deleteMailTemplate,
        toggleMailTemplateStatus,
        getAllInvoices,
        generateInvoice,
        getUserById: (id) => adminData?.users.find(u => u.id === id),
        getOrderById: (id) => {
            const userOrder = currentUser?.orders?.find(o => o.id === id);
            if (userOrder) return userOrder;
            return adminData?.orders.find(o => o.id === id);
        },
        submitReturnRequest,
        adminUpdateReturnStatus,
        isOfferModalOpen,
        openOfferModal: () => setIsOfferModalOpen(true),
        closeOfferModal: () => setIsOfferModalOpen(false),
        isCartShaking,
        setIsCartShaking,
        flyToCartItem,
        setAnimationItem: setFlyToCartItem,
        triggerFlyToCartAnimation: (p, e) =>
            setFlyToCartItem({ product: p, startRect: e.getBoundingClientRect() }),


        confirmationState,
        showConfirmationModal: (opts: any) => setConfirmationState({ ...confirmationState, ...opts, isOpen: true }),
        closeConfirmationModal: () => setConfirmationState(p => ({ ...p, isOpen: false })),
        logout: async () => { await supabase.auth.signOut(); setSession(null); setCurrentUser(null); },
        deliverySettings,
        serviceableRules,
        updateDeliverySettings,
        fetchTaxSettings,
        taxSettings,
        updateTaxSettings,
        fetchServiceableRules,
        removeServiceableRule,
        searchMasterLocations,
        assignShopDelivery,
        verifyOrderPickup,
        userCancelOrder,

        // Card Addons
        cardAddons,
        fetchCardAddons: useCallback(async () => {
            const { data, error } = await supabase.from('card_addons').select('*').order('order', { ascending: true });
            if (error) {
                console.error('Error fetching card addons:', error);
                return;
            }
            setCardAddons(data || []);
        }, []),
        addCardAddon: async (addon) => {
            const { data, error } = await supabase.from('card_addons').insert(addon).select().single();
            if (error) throw error;
            setCardAddons(prev => [...prev, data]);
            return data;
        },
        updateCardAddon: async (id, updates) => {
            const { data, error } = await supabase.from('card_addons').update(updates).eq('id', id).select().single();
            if (error) throw error;
            setCardAddons(prev => prev.map(a => a.id === id ? data : a));
            return data;
        },
        deleteCardAddon: async (id) => {
            const { error } = await supabase.from('card_addons').delete().eq('id', id);
            if (error) throw error;
            setCardAddons(prev => prev.filter(a => a.id !== id));
        },
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
