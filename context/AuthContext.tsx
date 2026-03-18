import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { User, Order, ReturnRequest, Notification, SearchHistoryEntry, Product } from '../types.ts';
import { queryClient } from '../services/queryClient.ts';
import { useNotifications, useUnreadCount, useMarkAsRead } from '../services/api/notifications.api';

interface AuthContextType {
    session: any;
    currentUser: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    refreshProfile: () => Promise<void>;
    logout: () => Promise<void>;
    // User Management
    toggleWishlist: (product: Product) => Promise<void>;
    toggleSavedItem: (product: Product) => Promise<void>;
    addAddress: (addr: any) => Promise<void>;
    updateAddress: (addr: any) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;

    notifications: Notification[];
    unreadNotificationCount: number;
    markNotificationAsRead: (id: string) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    searchHistory: SearchHistoryEntry[];
    addToSearchHistory: (query: string) => Promise<void>;
    deleteSearchHistoryItem: (id: string) => Promise<void>;
    clearSearchHistory: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

    const fetchSearchHistory = async (userId?: string) => {
        if (!userId) {
            try {
                const local = localStorage.getItem('velvetchip_search_history');
                if (local) setSearchHistory(JSON.parse(local));
            } catch (e) { console.error("Error loading local history", e); }
            return;
        }

        try {
            const { data } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(8);

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const uniqueHistory: SearchHistoryEntry[] = [];
            const seenQueries = new Set<string>();

            (data || []).forEach((item: any) => {
                const q = item.query.toLowerCase().trim();
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

    const fetchUserProfile = async (userId: string) => {
        console.log('[Auth] Fetching profile for:', userId);
        try {
            const [profileRes, addressRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
                supabase.from('addresses').select('*').eq('user_id', userId)
            ]);

            if (profileRes.error) {
                console.error('[Auth] Profile fetch error:', profileRes.error);
            }

            if (!profileRes.data) {
                console.warn('[Auth] No profile found for user:', userId);
                return;
            }

            const profile = profileRes.data;
            console.log('[Auth] Profile loaded successfully');

            setCurrentUser({
                ...profile,
                cart: profile.cart || [],
                wishlist: profile.wishlist || [],
                savedItems: profile.saved_items || [],
                addresses: (addressRes.data || []).map((addr: any) => ({ ...addr, isDefault: addr.is_default })),
            });
        } catch (error) {
            console.error("[Auth] Error fetching user profile:", error);
        }
    };

    // --- Actions ---
    const refreshProfile = async () => {
        if (session?.user) {
            await fetchUserProfile(session.user.id);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setCurrentUser(null);
        setSearchHistory([]);
        queryClient.clear();
        window.location.href = '/';
    };

    const { data: notifications = [] } = useNotifications(session?.user?.id);
    const { data: unreadNotificationCount = 0 } = useUnreadCount(session?.user?.id);
    const markAsReadMutation = useMarkAsRead();

    // Context still exposes these functions so existing consumers don't break immediately
    const markNotificationAsRead = async (id: string) => {
        if (session?.user?.id) {
            await markAsReadMutation.mutateAsync({ notificationId: id, userId: session.user.id });
        }
    };

    const markAllNotificationsAsRead = async () => {
        if (!session?.user) return;
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id);
        // Force refetch on query client
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

        setSearchHistory(prev => {
            const filtered = prev.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());
            const updated = [newEntry, ...filtered].slice(0, 8);
            if (!userId) {
                localStorage.setItem('velvetchip_search_history', JSON.stringify(updated));
            }
            return updated;
        });

        if (userId) {
            await supabase.from('search_history').delete().eq('user_id', userId).ilike('query', trimmedQuery);
            await supabase.from('search_history').insert({ id: newEntry.id, user_id: userId, query: trimmedQuery });
        }
    };

    const deleteSearchHistoryItem = async (id: string) => {
        setSearchHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            if (!session?.user) localStorage.setItem('velvetchip_search_history', JSON.stringify(updated));
            return updated;
        });
        if (session?.user) await supabase.from('search_history').delete().eq('id', id);
    };

    const clearSearchHistory = async () => {
        setSearchHistory([]);
        if (!session?.user) {
            localStorage.removeItem('velvetchip_search_history');
        } else {
            await supabase.from('search_history').delete().eq('user_id', session.user.id);
        }
    };

    // --- User Mutations ---
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
        const { isDefault, ...dbPayload } = addr;

        const { data, error } = await supabase.from('addresses').insert({ ...dbPayload, user_id: currentUser.id }).select().maybeSingle();
        if (!error && data) {
            const newAddress = { ...data, isDefault: data.is_default };
            const newAddresses = [...(currentUser.addresses || []), newAddress];
            setCurrentUser({ ...currentUser, addresses: newAddresses });
        }
    };

    const updateAddress = async (addr: any) => {
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
        if (!error) {
            await refreshProfile();
        }
    };

    // --- Effects ---
    // BULLETPROOF AUTH INIT: Works on any Supabase v2 version.
    // Pattern: getSession() for initial load (sync + reliable),
    //          onAuthStateChange only for subsequent changes (login/logout/refresh)
    //          5-second hard safety timeout to prevent infinite loading in all edge cases
    useEffect(() => {
        let mounted = true;

        // Hard safety fallback — always unblock UI after 5 seconds
        const safetyTimeout = setTimeout(() => {
            if (mounted) {
                console.warn('[Auth] Safety timeout fired — unblocking UI');
                setIsLoading(false);
            }
        }, 5000);

        // Step 1: Get the initial session from localStorage (fast, no network needed for cached sessions)
        const initAuth = async () => {
            console.log('[Auth] Initializing auth...');
            try {
                // We use getSession() for the initial mount.
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth] getSession error:', error);
                }

                if (!mounted) return;
                console.log('[Auth] Session state:', session ? 'Authenticated' : 'Anonymous');
                setSession(session);

                if (session?.user) {
                    // Critical: Use Promise.all with individual catch blocks to prevent one failure from blocking everything
                    await Promise.all([
                        fetchUserProfile(session.user.id).catch(e => console.error('[Auth] Profile fetch failed:', e)),
                        fetchSearchHistory(session.user.id).catch(e => console.error('[Auth] Search history fetch failed:', e))
                    ]);
                } else {
                    await fetchSearchHistory().catch(e => console.error('[Auth] Search history fetch failed:', e));
                }
            } catch (e) {
                console.error('[Auth] Init error:', e);
            } finally {
                if (mounted) {
                    console.log('[Auth] Initialization complete. Unblocking UI.');
                    clearTimeout(safetyTimeout);
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        // Step 2: Listen for subsequent auth changes (login, logout, token refresh)
        // Note: onAuthStateChange may fire SIGNED_IN immediately on mount in some Supabase versions.
        // We guard against this with isLoading check — the initial load is handled by initAuth() above.
        let isInitialEvent = true;
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Skip the very first event that mirrors initAuth() to prevent double-fetch
            if (isInitialEvent) {
                isInitialEvent = false;
                return;
            }

            if (!mounted) return;
            setSession(session);

            if (event === 'SIGNED_IN' && session?.user) {
                try {
                    await fetchUserProfile(session.user.id);
                    if (mounted) await fetchSearchHistory(session.user.id);
                } catch (e) {
                    console.error('[Auth] Sign in data fetch error:', e);
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setSearchHistory([]);
                fetchSearchHistory();
            }
            // TOKEN_REFRESHED: session is already set above, no additional fetching needed
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        currentUser,
        isLoading,
        isAdmin: currentUser?.role === 'admin',
        refreshProfile,
        logout,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        searchHistory,
        addToSearchHistory,
        deleteSearchHistoryItem,
        clearSearchHistory,

        toggleWishlist,
        toggleSavedItem,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
