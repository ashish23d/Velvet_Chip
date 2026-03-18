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
import { queryClient } from '../services/queryClient';

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
    updateEmailSettings: (settings: EmailSettings) => Promise<void>;

    // Delivery & Serviceable API
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

import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useSite } from './SiteContext';
import { useUI } from './UIContext';

// ... (imports)

// ... (interface)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        session, currentUser, logout, isLoading: isAuthLoading, isAdmin,
        notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead,
        searchHistory, addToSearchHistory, deleteSearchHistoryItem, clearSearchHistory,
        toggleWishlist, toggleSavedItem, addAddress, updateAddress, deleteAddress, setDefaultAddress, updateUser,
        refreshProfile
    } = useAuth();

    const {
        cart, cartCount, checkoutState, addToCart, removeFromCart, updateCartItemQuantity,
        setSelectedAddressForCheckout, applyPromotion, removePromotion, placeOrder,
        activePromotions, getAvailablePromotions
    } = useCart();

    // 🎨 Integrate SiteContext
    const site = useSite();

    // 🎭 Integrate UIContext  
    const ui = useUI();

    // 🔔 Notifications state (Supplemental)
    // orderUpdates derived from 'currentUser.updates' if available
    const orderUpdates = currentUser?.updates || [];
    const [promotions, setPromotions] = useState<any[]>([]);     // Broadcasts

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // REMOVED: cart, activePromotions (Now in CartContext)


    const [reviews, setReviews] = useState<Review[]>([]);
    const [cardAddons, setCardAddons] = useState<CardAddon[]>([]);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
    const [mailTemplates, setMailTemplates] = useState<MailTemplate[]>([]);

    // deliverySettings in AppContext is currently used for ADMIN UPDATES too. 
    // We keep this local state for Admin 'edit' form population or keep it sync with DB.
    // CartContext has its own 'deliverySettings' for checkout. 
    // Ideally we merge, but for now let's keep AppContext's deliverySettings as the "Master/Admin" copy.
    const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
    const [serviceableRules, setServiceableRules] = useState<ServiceableRule[]>([]);

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
    const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);

    const [isContentLoading, setIsContentLoading] = useState(false);
    const isLoading = isAuthLoading; // AppContext no longer gates the UI — only AuthContext's auth check matters
    const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);

    // REMOVED: checkoutState, isCartShaking, flyToCartItem (Now in CartContext)
    const [reviewModalState, setReviewModalState] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    // isOfferModalOpen is in CartContext too? AppContext interface says so. 
    // Let's defer to CartContext for Offer Modal if it's related to Cart/Checkout.
    // Interface says 'isOfferModalOpen'. CartContext has it.
    // We should use CartContext's modal state if possible, or Sync.
    // Let's use local for now if not sure, but 'openOfferModal' is in context.


    // ----------------------------------------------------
    // CART & CHECKOUT (Delegated to CartContext)
    // ----------------------------------------------------

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
            // Use upsert to create if not exists, forcing ID 1
            const { data, error } = await supabase.from('delivery_settings')
                .upsert({ id: 1, ...settings })
                .select()
                .single();

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
            // Use upsert to create if not exists, forcing ID 1
            const { data, error } = await supabase.from('tax_settings')
                .upsert({ id: 1, ...settings })
                .select()
                .single();

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
        // Fetch current status history directly from DB
        const { data: currentOrder } = await supabase.from('orders').select('status_history').eq('id', orderId).single();

        const { error } = await supabase.from('orders').update({
            delivery_type: 'shop',
            shop_delivery_details: details,
            current_status: 'Out for Delivery',
            status_history: [...((currentOrder?.status_history as any[]) || []), { status: 'Out for Delivery', timestamp: new Date().toISOString(), description: `Out for delivery by shop personnel: ${details.boy_name}` }]
        }).eq('id', orderId);

        if (error) throw error;
    };

    const verifyOrderPickup = async (orderId: string, code: string) => {
        // Fetch order directly from the database
        const { data: orderRow } = await supabase.from('orders').select('pickup_verification_code, status_history').eq('id', orderId).single();
        if (!orderRow) throw new Error("Order not found");

        if (orderRow.pickup_verification_code !== code) {
            throw new Error("Invalid Verification Code");
        }

        const { error } = await supabase.from('orders').update({
            is_pickup_verified: true,
            current_status: 'Delivered',
            status_history: [...((orderRow.status_history as any[]) || []), { status: 'Delivered', timestamp: new Date().toISOString(), description: 'Order picked up by customer (Verified)' }]
        }).eq('id', orderId);

        if (error) throw error;
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

    const fetchMailTemplates = async () => {
        try {
            const { data, error } = await supabase.from('mail_templates').select('*');
            if (data) {
                const mapped = data.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    subject: t.subject,
                    htmlContent: t.html_content,
                    templateType: t.template_type,
                    placeholders: t.placeholders || [],
                    isActive: t.is_active
                }));
                setMailTemplates(mapped);
                return mapped;
            }
        } catch (e) {
            console.error("Fetch mail templates error", e);
        }
        return [];
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

            // All admin data now handled by React Query hooks — the monolith is gone.
            // No local state is set here; each page fetches its own data via dedicated hooks.

        } catch (e) {
            console.error("Error loading admin data", e);
        } finally {
            setIsLoadingAdminData(false);
        }
    }, [isLoadingAdminData]);

    // Effect to load search history when user changes/logs in


    // 🔔 STEP 2.3: REALTIME NOTIFICATIONS (LIVE)
    // Listen for new notifications


    // 🔔 Search history is fetched and managed internally by AuthContext on session change.

    // 🔔 Realtime Notifications: Handled efficiently in AuthContext to avoid duplicated subscriptions.




    useEffect(() => {
        const initApp = async () => {
            console.log('[App] Initializing app background data...');
            try {
                // Fetch basic app data in background
                // We use allSettled to ensure one failure doesn't block others
                await Promise.allSettled([
                    fetchCategories().catch(e => console.error('[App] Categories fetch failed:', e)),
                    fetchServiceableRules().catch(e => console.error('[App] Rules fetch failed:', e)),
                    fetchDeliverySettings().catch(e => console.error('[App] Delivery settings fetch failed:', e)),
                    fetchTaxSettings().catch(e => console.error('[App] Tax settings fetch failed:', e)),
                    fetchMailTemplates().catch(e => console.error('[App] Mail templates fetch failed:', e)),
                    supabase.from('products').select('*').then(({ data }) => data && setProducts(data)).catch(e => console.error('[App] Products fetch failed:', e)),
                    supabase.from('broadcast_notifications').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => data && setPromotions(data)).catch(e => console.error('[App] Broadcasts fetch failed:', e)),
                    supabase.from('site_content').select('data').eq('id', 'payment_settings').maybeSingle().then(({ data }) => data?.data && setPaymentSettings(data.data)).catch(e => console.error('[App] Payment settings fetch failed:', e))
                ]);
                console.log('[App] App background data initialized');
            } catch (e) {
                console.error("[App] Init error", e);
            }
        };

        // Realtime Subscription
        const channel = supabase.channel('db-changes-app')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                async () => {
                    const { data } = await supabase.from('products').select('*');
                    if (data) setProducts(data);
                }
            )
            .subscribe();

        initApp();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);




    // 🔌 Realtime Notifications: Handled in AuthContext
    // 👤 User Profile Fetching: Handled in AuthContext




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




    const generateInvoice = async (orderId: string) => {
        // Fetch order directly from the database
        const { data: rawOrder, error: orderFetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

        if (orderFetchError || !rawOrder) throw new Error("Order not found.");

        const order = {
            ...rawOrder,
            shippingAddress: rawOrder.shipping_address,
            orderDate: rawOrder.order_date,
            totalAmount: rawOrder.total_amount,
            currentStatus: rawOrder.current_status,
            statusHistory: rawOrder.status_history,
            customerName: rawOrder.customer_name,
            customerEmail: rawOrder.customer_email,
            promotionCode: rawOrder.promotion_code,
            userId: rawOrder.user_id,
        };

        const { pdfBlob, qrBlob, invoiceData } = await generateInvoicePDF(order, site.siteSettings, site.contactDetails, deliverySettings);

        const pdfPath = `invoices/pdf/${invoiceData.invoice_number}.pdf`;
        const { error: pdfError } = await supabase.storage.from('site-assets').upload(pdfPath, pdfBlob, { upsert: true, contentType: 'application/pdf' });
        if (pdfError) throw new Error("Failed to upload invoice PDF.");

        const qrPath = `invoices/qr/${invoiceData.invoice_number}.png`;
        await supabase.storage.from('site-assets').upload(qrPath, qrBlob, { upsert: true, contentType: 'image/png' });

        const { data: existingInvoice } = await supabase.from('invoices').select('id').eq('order_id', orderId).maybeSingle();

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
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', orderId] });
    };

    const updateOrderStatus = async (id: string, status: string, reason?: string) => {
        const timestamp = new Date().toISOString();
        const description = reason ? `Order cancelled: ${reason}` : `Order status updated to ${status} `;

        // Database Update
        // 🔴 FIX: Fetch 'customer_email' (from order snapshot) AND user profile email to ensure we have a recipient
        const { data: currentOrder } = await supabase
            .from('orders')
            .select('status_history, user_id, id, customer_email, user:profiles(email), items, current_status')
            .eq('id', id)
            .single();

        if (!currentOrder) return;

        // --- STOCK RESTORATION ---
        // If status is becoming 'Cancelled' and wasn't already cancelled/returned
        const isCancelled = status.includes('Cancelled');
        const wasCancelledOrReturned = currentOrder.current_status.includes('Cancelled') || currentOrder.current_status.includes('Return');

        if (isCancelled && !wasCancelledOrReturned && currentOrder.items) {
            try {
                const items = currentOrder.items as any[];
                for (const item of items) {
                    if (item.productId) {
                        const { data: productData } = await supabase.from('products').select('*').eq('id', item.productId).single();
                        if (productData) {
                            let stockUpdated = false;
                            const newColors = productData.colors.map((c: any) => {
                                const normalize = (s: string) => s?.trim().toLowerCase() || '';
                                const isColorMatch = !item.color || (normalize(c.name) === normalize(item.color?.name || item.color));

                                if (!isColorMatch) return c;

                                return {
                                    ...c,
                                    sizes: c.sizes.map((s: any) => {
                                        if (s.size === item.size) {
                                            stockUpdated = true;
                                            return { ...s, stock: Number(s.stock) + Number(item.quantity) };
                                        }
                                        return s;
                                    })
                                };
                            });

                            if (stockUpdated) {
                                await supabase.from('products').update({ colors: newColors }).eq('id', productData.id);
                                console.log(`Restocked Product ${productData.id}: +${item.quantity}`);
                            }
                        }
                    }
                }
            } catch (stockError) {
                console.error("Critical: Failed to restore stock during cancellation:", stockError);
                // We continue with status update even if restocking fails to avoid inconsistent UI
            }
        }

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

        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
        queryClient.invalidateQueries({ queryKey: ['user', 'orders', currentOrder.user_id] });

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

            // The React Query hook (useAdminAllReturns) will automatically
            // refetch returns data on the next render cycle.
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
        const { data: reviewRow } = await supabase.from('reviews').select('product_images').eq('id', rid).single();
        if (reviewRow) {
            const updatedImages = ((reviewRow.product_images || []) as string[]).filter(p => p !== path);
            const { error: dbError } = await supabase.from('reviews').update({ product_images: updatedImages }).eq('id', rid);
            if (dbError) throw dbError;
        }
    };

    const getPendingChanges = () => [];
    const approveChange = async (id: string) => { };
    const rejectChange = async (id: string) => { };

    // Site content mutations — delegated to SiteContext
    const updateSiteContent = site.updateSiteContent;
    const updateSiteSettings = site.updateSiteSettings;
    const updateContactDetails = site.updateContactDetails;
    const updateAnnouncement = site.updateAnnouncement;
    const updateSlides = site.updateSlides;
    const adminDeleteSiteAsset = site.adminDeleteSiteAsset;
    const adminAddSeasonalCard = site.adminAddSeasonalCard;
    const adminUpdateSeasonalCard = site.adminUpdateSeasonalCard;
    const adminDeleteSeasonalCard = site.adminDeleteSeasonalCard;

    const updateEmailSettings = async (settings: EmailSettings) => {
        const { error } = await supabase.from('email_settings').upsert({ ...settings, id: 1 });
        if (error) throw error;
        setEmailSettings(settings);
    };

    const getAllSubscribers = () => [];
    const addSubscriber = async (email: string) => {
        const { data } = await supabase.from('subscribers').select('id').eq('email', email).single();
        if (data) return;
        await supabase.from('subscribers').insert({ email });
    };
    const deleteSubscriber = async (id: number) => {
        await supabase.from('subscribers').delete().eq('id', id);
    };

    // NOTE: getAllPromotions, getPromotionById, addPromotion, updatePromotion, deletePromotion
    // are now handled by standalone hooks in services/api/promotions.api.ts
    const getAllPromotions = () => [];
    const getPromotionById = (_id: number) => undefined;
    const addPromotion = async (_p: any) => { };
    const updatePromotion = async (_p: any) => { };
    const deletePromotion = async (_p: any) => { };

    const submitContactForm = async (data: any) => {
        await supabase.from('contacts').insert({ ...data, user_id: currentUser?.id });
    };
    const getAllContactSubmissions = () => [];
    const updateContactSubmissionStatus = async (id: number, status: string) => {
        await supabase.from('contacts').update({ status }).eq('id', id);
    };

    const getAllMailTemplates = () => mailTemplates;
    const getMailTemplateById = (id: number) => mailTemplates.find(t => t.id === id);
    const addMailTemplate = async (t: any) => {
        const dbPayload = {
            name: t.name, subject: t.subject, html_content: t.htmlContent,
            template_type: t.templateType, placeholders: t.placeholders, is_active: t.isActive
        };
        const { error } = await supabase.from('mail_templates').insert(dbPayload);
        if (error) throw error;
        await fetchMailTemplates();
    };
    const updateMailTemplate = async (t: any) => {
        const dbPayload = {
            name: t.name, subject: t.subject, html_content: t.htmlContent,
            template_type: t.templateType, placeholders: t.placeholders, is_active: t.isActive
        };
        const { error } = await supabase.from('mail_templates').update(dbPayload).eq('id', t.id);
        if (error) throw error;
        await fetchMailTemplates();
    };
    const deleteMailTemplate = async (id: number) => {
        const { error } = await supabase.from('mail_templates').delete().eq('id', id);
        if (error) throw error;
        setMailTemplates(prev => prev.filter(t => t.id !== id));
    };
    const toggleMailTemplateStatus = async (id: number, isActive: boolean) => {
        const { error } = await supabase.from('mail_templates').update({ is_active: !isActive }).eq('id', id);
        if (error) throw error;
        setMailTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !isActive } : t));
    };

    const getAllInvoices = () => [];

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
            if (currentUser && newReturn) {
                await refreshProfile();
            }
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

    const userCancelOrder = async (orderId: string, reason?: string) => {
        await updateOrderStatus(orderId, 'Cancelled by User', reason);
    }



    const isProductInWishlist = (productId: number) => {
        return (currentUser?.wishlist || []).some(p => p.id === productId);
    };








    // We must check stock and deduct it BEFORE creating the order.
    // If any item fails, we abort.

    // 🔔 STEP 2.4 — Mark ONE notification as read
    // 🔔 Notifications: Handled in AuthContext



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
        // 🛒 CART - Delegated to CartContext
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,

        // 💳 CHECKOUT - Delegated to CartContext
        checkoutState,
        setSelectedAddressForCheckout,
        applyPromotion,
        removePromotion,
        activePromotions,
        getAvailablePromotions,
        placeOrder,

        // 🎭 UI - Delegated to UIContext
        isCartShaking: ui.isCartShaking,
        setIsCartShaking: ui.setIsCartShaking,
        flyToCartItem: ui.flyToCartItem,
        setAnimationItem: ui.setAnimationItem,
        triggerFlyToCartAnimation: ui.triggerFlyToCartAnimation,
        isOfferModalOpen: ui.isOfferModalOpen,
        openOfferModal: ui.openOfferModal,
        closeOfferModal: ui.closeOfferModal,
        confirmationState: ui.confirmationState,
        showConfirmationModal: ui.showConfirmationModal,
        closeConfirmationModal: ui.closeConfirmationModal,
        reviewModalState: ui.reviewModalState,
        openReviewModal: ui.openReviewModal,
        closeReviewModal: ui.closeReviewModal,

        wishlist: currentUser?.wishlist || [],
        savedItems: currentUser?.savedItems || [],
        currentUser,
        session,
        isLoading,
        // 🎨 SITE - Delegated to SiteContext
        siteSettings: site.siteSettings,
        contactDetails: site.contactDetails,
        siteContent: site.siteContent,
        slides: site.slides,
        seasonalEditCards: site.seasonalEditCards,
        announcement: site.announcement,

        // Notifications
        notifications,
        promotions, // Broadcasts
        orderUpdates,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        toggleWishlist,
        isProductInWishlist: (id) => currentUser?.wishlist?.some(p => p.id === id) || false,
        toggleSavedItem,
        isProductSaved: (id) => currentUser?.savedItems?.some(p => p.id === id) || false,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateUser,
        fetchUserOrders: refreshProfile,
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
            // ... (keep implementation or assume it was inline)
            // Implementation was inline in previous view.
            // I'll just replace the keys that changed.
            const lowerQ = q.toLowerCase();
            const suggestedCategories = categories
                .filter(c => c.name.toLowerCase().includes(lowerQ))
                .slice(0, 3)
                .map(c => c.name);
            const suggestedQueries = products
                .filter(p => p.name.toLowerCase().includes(lowerQ))
                .slice(0, 5)
                .map(p => p.name);
            return { suggestedQueries, suggestedCategories };
        },
        lastProductUpdate: 0,
        // 🔌 Auth Context: Search History
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

        // Removed duplicate reviewModalState bindings (provided by UIContext)



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
            }
        },
        updateProduct: async (p) => {
            const { error } = await supabase.from('products').update(p).eq('id', p.id);
            if (error) throw error;
            setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, ...p } : prod));
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
        adminData: null as any,
        getUserById: (_id: string) => undefined,
        getOrderById: (_id: string | undefined) => undefined,
        submitReturnRequest,
        adminUpdateReturnStatus,

        logout: logout,
        deliverySettings,
        serviceableRules,
        updateDeliverySettings,
        paymentSettings,
        taxSettings,
        updateTaxSettings,
        fetchServiceableRules,
        addServiceableRule,
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
