import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import {
    Product, Category, User, CartItem, Order, Review,
    Notification, SiteSettings, ContactDetails, SiteContent,
    Slide, SeasonalEditCard, Promotion, Announcement,
    UserProfile, AdminData, MailTemplate, ContactSubmission,
    ReturnRequest, ReturnRequestStatus, PendingChange,
    Address, ReturnStatusUpdate, SearchHistoryEntry,
    CardAddon
} from '../types.ts';
import { generateProductDescription, getSearchSuggestions } from '../services/geminiService.ts';
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
    contactDetails: ContactDetails;
    siteContent: SiteContent[];
    slides: Slide[];
    seasonalEditCards: SeasonalEditCard[];
    announcement: Announcement | null;

    // Cart & Checkout
    cartCount: number;
    addToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateCartItemQuantity: (itemId: string, quantity: number) => void;
    checkoutState: CheckoutState;
    setSelectedAddressForCheckout: (id: string) => void;
    applyPromotion: (code: string) => Promise<void>;
    removePromotion: () => void;
    placeOrder: (method: 'COD' | 'Online') => Promise<string | null>;

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

    // Products & Search
    fetchProducts: (params?: any) => Promise<{ data: Product[], count: number }>;
    getProductById: (id: number | string | undefined) => Promise<Product | undefined>;
    searchProducts: (query: string) => Promise<Product[]>;
    getSearchSuggestions: (query: string) => Promise<{ suggestedQueries: string[], suggestedCategories: string[] }>;
    lastProductUpdate: number;
    searchHistory: SearchHistoryEntry[];
    addToSearchHistory: (query: string) => Promise<void>;
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
    getAllPromotions: () => Promotion[];
    getPromotionById: (id: number) => Promotion | undefined;
    addPromotion: (promo: any) => Promise<void>;
    updatePromotion: (promo: any) => Promise<void>;
    deletePromotion: (promo: Promotion) => Promise<void>;
    updateAnnouncement: (announcement: Announcement) => Promise<void>;
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [savedItems, setSavedItems] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [contactDetails, setContactDetailsState] = useState<ContactDetails>({ email: '', phone: '', address: '' });
    const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
    const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
    const [seasonalEditCards, setSeasonalEditCards] = useState<SeasonalEditCard[]>([]);
    const [cardAddons, setCardAddons] = useState<CardAddon[]>([]);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
    const [lastProductUpdate, setLastProductUpdate] = useState(Date.now());

    const [checkoutState, setCheckoutState] = useState<CheckoutState>({ selectedAddressId: null, appliedPromotion: null, discount: 0 });
    const [reviewModalState, setReviewModalState] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isCartShaking, setIsCartShaking] = useState(false);
    const [animationItem, setAnimationItem] = useState<{ product: Product; startRect: DOMRect } | null>(null);

    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDestructive: false,
        isConfirming: false,
        onConfirm: () => { },
    });



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

    const fetchSearchHistory = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10); // Limit to 10

            if (error) throw error;

            // Filter client-side for the 15-day retention rule
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

            const filteredHistory = (data || []).filter(item => new Date(item.created_at) > fifteenDaysAgo);
            setSearchHistory(filteredHistory);
        } catch (error) {
            console.error("Error fetching search history:", error);
        }
    };

    const addToSearchHistory = async (query: string) => {
        if (!currentUser || !query.trim()) return;

        const trimmedQuery = query.trim();

        // Optimistic update
        const newEntry: SearchHistoryEntry = {
            id: crypto.randomUUID(),
            query: trimmedQuery,
            created_at: new Date().toISOString()
        };

        setSearchHistory(prev => {
            // Remove existing duplicate to bring it to top
            const filtered = prev.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());
            return [newEntry, ...filtered].slice(0, 10);
        });

        try {
            // Insert into DB (RLS handles security)
            await supabase.from('search_history').insert({
                user_id: currentUser.id,
                query: trimmedQuery
            });
            // No need to re-fetch immediately, optimistic update covers UI
        } catch (error) {
            console.error("Error adding search history:", error);
        }
    };

    const clearSearchHistory = async () => {
        if (!currentUser) return;
        setSearchHistory([]); // Optimistic clear
        try {
            await supabase.from('search_history').delete().eq('user_id', currentUser.id);
        } catch (error) {
            console.error("Error clearing search history:", error);
        }
    };

    const loadAdminData = async () => {
        // Allow re-fetching even if loading, to support "refresh" actions
        // if (isLoadingAdminData) return; 
        setIsLoadingAdminData(true);
        try {
            const [
                { data: products },
                { data: orders },
                { data: users },
                { data: invoices },
                { data: promotions },
                { data: mailTemplates },
                { data: contactSubmissions },
                { data: returns }
            ] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('orders').select('*'),
                supabase.from('profiles').select('*'),
                supabase.from('invoices').select('*'),
                supabase.from('promotions').select('*'),
                supabase.from('mail_templates').select('*'),
                supabase.from('contacts').select('*'),
                supabase.from('returns').select('*, item:orders(items), user:profiles(id,name,email)')
            ]);

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
                const orderItems: any[] = r.item?.items || [];
                const item = orderItems.find(i => i.id === r.item_id);
                return { ...r, item, user: r.user };
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
                subscribers: [],
            });
        } catch (e) {
            console.error("Error loading admin data", e);
        } finally {
            setIsLoadingAdminData(false);
        }
    };

    // Effect to load search history when user changes/logs in
    useEffect(() => {
        if (currentUser) {
            fetchSearchHistory(currentUser.id);
        } else {
            setSearchHistory([]);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        const initApp = async () => {
            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                const [categoriesResult, productsResult, reviewsResult, siteContentResult, slidesResult, seasonalResult, cardAddonsResult] = await Promise.allSettled([
                    fetchCategories(),
                    supabase.from('products').select('*'),
                    supabase.from('reviews').select('*').eq('status', 'approved'),
                    supabase.from('site_content').select('*'),
                    supabase.from('slides').select('*').order('ordering'),
                    supabase.from('seasonal_edit_cards').select('*').order('ordering'),
                    supabase.from('card_addons').select('*').order('order', { ascending: true })
                ]);

                // Handle Products & Fallback
                let loadedProducts: Product[] = [];
                if (productsResult.status === 'fulfilled' && productsResult.value.data && productsResult.value.data.length > 0) {
                    loadedProducts = productsResult.value.data;
                    setProducts(loadedProducts);
                } else {
                    setProducts([]);
                }

                // Handle Categories & Fallback
                if (categoriesResult.status === 'fulfilled' && categoriesResult.value) {
                    // State set in fetchCategories
                }

                // Handle Reviews & Fallback
                if (reviewsResult.status === 'fulfilled' && reviewsResult.value.data && reviewsResult.value.data.length > 0) {
                    const mappedReviews = reviewsResult.value.data.map((r: any) => ({
                        ...r,
                        productId: r.product_id,
                        userId: r.user_id,
                        userImage: r.user_image,
                        productImages: r.product_images
                    }));
                    setReviews(mappedReviews);
                }

                if (siteContentResult.status === 'fulfilled' && siteContentResult.value.data) {
                    const siteData = siteContentResult.value.data;
                    setSiteContent(siteData);
                    const settings = siteData.find(d => d.id === 'site_settings')?.data;
                    if (settings) setSiteSettings(settings);
                    const contact = siteData.find(d => d.id === 'contact_details')?.data;
                    if (contact) setContactDetailsState(contact);
                    const announce = siteData.find(d => d.id === 'announcement')?.data;
                    if (announce) setAnnouncement(announce);
                }

                if (slidesResult.status === 'fulfilled' && slidesResult.value.data && slidesResult.value.data.length > 0) {
                    setSlides(slidesResult.value.data.map((s: any) => ({ ...s, showText: s.show_text })));
                }

                if (seasonalResult.status === 'fulfilled' && seasonalResult.value.data) {
                    setSeasonalEditCards(seasonalResult.value.data);
                }

                if (cardAddonsResult.status === 'fulfilled' && cardAddonsResult.value.data) {
                    setCardAddons(cardAddonsResult.value.data);
                }

                if (session?.user) {
                    await fetchUserProfile(session.user.id);
                }

            } catch (e) {
                console.error("Init error", e);
            } finally {
                setTimeout(() => setIsLoading(false), 100);
            }
        };

        // Add Auth State Listener
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            if (event === 'SIGNED_IN' && session?.user) {
                await fetchUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setSearchHistory([]);
                setSession(null);
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

        initApp();
        return () => {
            clearTimeout(safetyTimer);
            authListener.subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            const [profileRes, addressRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('addresses').select('*').eq('user_id', userId)
            ]);

            if (profileRes.data) {
                const profile = profileRes.data;
                fetchUserOrders();

                setCurrentUser({
                    ...profile,
                    cart: profile.cart || [],
                    wishlist: profile.wishlist || [],
                    savedItems: profile.saved_items || [],
                    addresses: addressRes.data || []
                });
            }
        } catch (e) {
            console.error("Error fetching user profile", e);
        }
    };

    const fetchUserOrders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: orders } = await supabase.from('orders').select('*').eq('user_id', session.user.id);
        if (orders) {
            const mappedOrders = orders.map(mapDbOrderToAppOrder);
            setCurrentUser(prev => prev ? ({ ...prev, orders: mappedOrders }) : null);
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
            app_image_path: c.appImagePath || null
        };

        const { error } = await supabase.from('categories').insert(dbPayload);
        if (error) throw error;

        await Promise.all([fetchCategories(), loadAdminData()]);
    };

    const updateCategory = async (c: any) => {
        const dbPayload = {
            name: c.name,
            hero_image: c.heroImage,
            page_hero_media: c.pageHeroMedia,
            page_hero_text: c.pageHeroText,
            show_page_hero_text: c.showPageHeroText,
            app_image_path: c.appImagePath || null
        };

        const { error } = await supabase.from('categories').update(dbPayload).eq('id', c.id);
        if (error) throw error;

        await Promise.all([fetchCategories(), loadAdminData()]);
    };

    const deleteCategory = async (id: string) => {
        await supabase.from('categories').delete().eq('id', id);
        fetchCategories();
    };

    const cartCount = (currentUser?.cart || []).reduce((acc, item) => acc + item.quantity, 0);
    const addToCart = async (product: Product, size: string, color: { name: string; hex: string }, quantity = 1) => {
        if (!currentUser) return;
        const newCartItem: CartItem = { id: `${product.id} -${size} -${color.name} `, product, quantity, selectedSize: size, selectedColor: color };
        const updatedCart = [...(currentUser.cart || [])];
        const existingIndex = updatedCart.findIndex(i => i.id === newCartItem.id);
        if (existingIndex > -1) {
            updatedCart[existingIndex].quantity += quantity;
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
        const { data, error } = await supabase.from('addresses').insert({ ...addr, user_id: currentUser.id }).select().single();
        if (!error && data) {
            const newAddresses = [...(currentUser.addresses || []), data];
            setCurrentUser({ ...currentUser, addresses: newAddresses });
        }
    };
    const updateAddress = async (addr: any) => {
        const { error } = await supabase.from('addresses').update(addr).eq('id', addr.id);
        if (!error && currentUser) {
            const newAddresses = currentUser.addresses?.map(a => a.id === addr.id ? addr : a);
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

        const pdfPath = `invoices / pdf / ${invoiceData.invoice_number}.pdf`;
        const { error: pdfError } = await supabase.storage.from('site-assets').upload(pdfPath, pdfBlob, { upsert: true, contentType: 'application/pdf' });
        if (pdfError) throw new Error("Failed to upload invoice PDF.");

        const qrPath = `invoices / qr / ${invoiceData.invoice_number}.png`;
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

        const { data: currentOrder } = await supabase.from('orders').select('status_history').eq('id', id).single();
        const currentHistory = (currentOrder?.status_history as any[]) || [];
        const newHistory = [...currentHistory, { status, timestamp, description }];

        await supabase.from('orders').update({
            current_status: status,
            status_history: newHistory
        }).eq('id', id);
    };

    const adminBulkUpdateOrderStatus = async (ids: string[], status: string) => {
        for (const id of ids) {
            await updateOrderStatus(id, status);
        }
    };

    const adminUpdateReturnStatus = useCallback(async (returnId: string, data: { status: ReturnRequestStatus }) => {
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error("Unauthorized.");
        }

        const { data: currentReturn, error: fetchError } = await supabase
            .from('returns')
            .select('status_history, user_id, item_id')
            .eq('id', returnId)
            .single();

        if (fetchError) {
            console.error("Error fetching return details:", fetchError);
            throw new Error("Failed to fetch return details.");
        }

        const currentHistory = (currentReturn.status_history as any[]) || [];
        const newHistoryEntry: ReturnStatusUpdate = {
            status: data.status,
            timestamp: new Date().toISOString(),
            description: `Status updated to "${data.status}" by admin.`
        };
        const newHistory = [...currentHistory, newHistoryEntry];

        const { data: updatedReturnData, error: updateError } = await supabase
            .from('returns')
            .update({
                status: data.status,
                status_history: newHistory as any
            })
            .eq('id', returnId)
            .select('*, order:orders(*, profile:profiles(id,name,email)), user:profiles(id,name,email)')
            .single();

        if (updateError) {
            console.error("Error updating return status:", updateError);
            throw new Error("Failed to update return status.");
        }

        try {
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('notifications')
                .eq('id', currentReturn.user_id)
                .single();

            if (userProfile) {
                const currentNotifications = (userProfile.notifications as any[]) || [];
                const newNotification: Notification = {
                    id: crypto.randomUUID(),
                    type: 'return',
                    title: `Return Update`,
                    message: `Your return request status has been updated to: ${data.status} `,
                    timestamp: new Date().toISOString(),
                    read: false,
                    link: '/profile'
                };

                await supabase
                    .from('profiles')
                    .update({ notifications: [newNotification, ...currentNotifications] as any })
                    .eq('id', currentReturn.user_id);
            }
        } catch (notifError) {
            console.warn("Could not send notification (likely permission issue):", notifError);
        }

        if (updatedReturnData) {
            const orderItems: any[] = updatedReturnData.order?.items || [];
            const item = orderItems.find((i: any) => i.id === updatedReturnData.item_id);
            const mappedReturn = { ...updatedReturnData, item, user: updatedReturnData.user };

            setAdminData(prevData => {
                if (!prevData) return null;

                const returnExists = prevData.returns.some(r => r.id === mappedReturn.id);
                let newReturns;

                if (returnExists) {
                    newReturns = prevData.returns.map(r => r.id === mappedReturn.id ? mappedReturn : r);
                } else {
                    newReturns = [...prevData.returns, mappedReturn];
                }

                return {
                    ...prevData,
                    returns: newReturns.sort((a, b) => new Date(b.return_requested_at).getTime() - new Date(a.return_requested_at).getTime())
                };
            });
        } else {
            await loadAdminData();
        }
    }, [currentUser, loadAdminData]);

    const adminCreateUser = async (u: any) => { /* ... */ };
    const adminUpdateUser = async (u: any) => { /* ... */ };

    const updateUserStatus = async (id: string, status: string) => {
        if (adminData) {
            setAdminData({
                ...adminData,
                users: adminData.users.map(u => u.id === id ? { ...u, status: status as any } : u)
            });
        }
        await supabase.from('profiles').update({ status }).eq('id', id);
    };
    const adminChangeUserRole = async (id: string, role: string) => { /* ... */ };

    const updateReviewStatus = async (id: number, status: string) => {
        /* impl */
    };
    const deleteReview = async (id: number) => { /* ... */ };
    const adminUpdateReview = async (r: any) => { /* ... */ };
    const adminDeleteReviewImage = async (rid: number, path: string) => { /* ... */ };

    const getPendingChanges = () => [];
    const approveChange = async (id: string) => { };
    const rejectChange = async (id: string) => { };

    const updateSiteContent = async (content: SiteContent) => {
        const { error } = await supabase.from('site_content').upsert({ id: content.id, data: content.data });
        if (error) throw error;
        setSiteContent(prev => prev.map(c => c.id === content.id ? content : c));
        if (content.id === 'site_settings') setSiteSettings(content.data as any);
        if (content.id === 'contact_details') setContactDetailsState(content.data as any);
        if (content.id === 'announcement') setAnnouncement(content.data as any);
    };

    const updateSiteSettings = async (settings: SiteSettings) => {
        await updateSiteContent({ id: 'site_settings', data: settings });
        window.location.reload();
    };
    const updateContactDetails = async (details: ContactDetails) => {
        await updateSiteContent({ id: 'contact_details', data: details });
    };
    const updateAnnouncement = async (announcement: Announcement) => {
        await updateSiteContent({ id: 'announcement', data: announcement });
    };

    const updateSlides = async (newSlides: Slide[]) => {
        const { error: delError } = await supabase.from('slides').delete().neq('id', '0');
        if (delError) throw delError;

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
    const deleteSubscriber = async (id: number) => { /* ... */ };

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
        await supabase.from('returns').insert({
            order_id: data.orderId,
            item_id: data.itemId,
            user_id: currentUser?.id,
            reason: data.reason,
            comments: data.comments,
            images: data.images,
            type: data.type,
            status: 'Pending'
        });
    };

    const userCancelOrder = async (orderId: string) => {
        await updateOrderStatus(orderId, 'Cancelled by User');
    }

    const placeOrder = async (method: 'COD' | 'Online') => {
        return "order-id";
    };

    const contextValue: AppContextType = {
        categories,
        products,
        cart: currentUser?.cart || [],
        wishlist: currentUser?.wishlist || [],
        savedItems: currentUser?.savedItems || [],
        currentUser,
        session,
        isLoading,
        siteSettings,
        contactDetails,
        siteContent,
        slides,
        seasonalEditCards,
        announcement,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        checkoutState,
        setSelectedAddressForCheckout: (id) => setCheckoutState(p => ({ ...p, selectedAddressId: id })),
        applyPromotion: async (code) => { /* impl */ },
        removePromotion: () => setCheckoutState(p => ({ ...p, appliedPromotion: null, discount: 0 })),
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
            if (params?.categoryId) filtered = filtered.filter(p => p.category === params.categoryId);
            if (params?.limit) filtered = filtered.slice(0, params.limit);
            return { data: filtered, count: filtered.length };
        },
        getProductById: async (id) => products.find(p => p.id === Number(id)),
        searchProducts: async (q) => {
            return products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
        },
        getSearchSuggestions: async (q) => ({ suggestedQueries: [], suggestedCategories: [] }),
        lastProductUpdate,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
        getCategoryById: (id) => categories.find(c => c.id === id),
        reviews,
        addReview: async (r) => { /* impl */ },
        reviewModalState,
        openReviewModal: (p) => setReviewModalState({ isOpen: true, product: p }),
        closeReviewModal: () => setReviewModalState({ isOpen: false, product: null }),
        unreadNotificationCount: (currentUser?.notifications || []).filter(n => !n.read).length,
        markNotificationAsRead: async (id) => {
            if (!currentUser) return;
            const newNotifs = (currentUser.notifications || []).map(n => n.id === id ? { ...n, read: true } : n);
            setCurrentUser({ ...currentUser, notifications: newNotifs });
            await supabase.from('profiles').update({ notifications: newNotifs }).eq('id', currentUser.id);
        },
        markAllNotificationsAsRead: async () => {
            if (!currentUser) return;
            const newNotifs = (currentUser.notifications || []).map(n => ({ ...n, read: true }));
            setCurrentUser({ ...currentUser, notifications: newNotifs });
            await supabase.from('profiles').update({ notifications: newNotifs }).eq('id', currentUser.id);
        },
        adminData,
        isLoadingAdminData,
        loadAdminData,
        addProduct: async (p) => {
            const { data, error } = await supabase.from('products').insert(p).select().single();
            if (error) {
                console.error("Error adding product:", error);
                throw error;
            }
            if (data) setProducts(prev => [...prev, data]);
            window.location.reload();
        },
        updateProduct: async (p) => {
            await supabase.from('products').update(p).eq('id', p.id);
            setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, ...p } : prod));
            window.location.reload();
        },
        deleteProduct: async (id) => {
            await supabase.from('products').delete().eq('id', id);
            setProducts(prev => prev.filter(p => p.id !== id));
        },
        addCategory,
        updateCategory: async (cat) => {
            await supabase.from('categories').update(cat).eq('id', cat.id);
            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ...cat } : c));
            // await loadAdminData(); // Removed to prevent full reload
            window.location.reload();
        },
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
        updateSiteContent: async (content) => {
            await supabase.from('site_content').upsert(content);
            setSiteContent(prev => prev.map(c => c.id === content.id ? content : c));
            // await loadAdminData(); // Removed to prevent full reload
            window.location.reload();
        },
        updateSiteSettings,
        updateContactDetails,
        updateSlides: async (newSlides) => {
            const slidesForDb = newSlides.map(s => ({
                id: s.id,
                media: s.media,
                text: s.text,
                show_text: s.showText,
                ordering: 0 // Default ordering if not present
            }));
            await supabase.from('slides').upsert(slidesForDb);
            setSlides(newSlides);
            // await loadAdminData(); // Removed to prevent full reload
            window.location.reload();
        },
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
        animationItem,
        setAnimationItem,
        triggerFlyToCartAnimation: (p, e) => setAnimationItem({ product: p, startRect: e.getBoundingClientRect() }),
        confirmationState,
        showConfirmationModal: (opts: any) => setConfirmationState({ ...confirmationState, ...opts, isOpen: true }),
        closeConfirmationModal: () => setConfirmationState(p => ({ ...p, isOpen: false })),
        logout: async () => { await supabase.auth.signOut(); setSession(null); setCurrentUser(null); },
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
