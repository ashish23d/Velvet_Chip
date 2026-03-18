import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { adminQueryOptions } from '../queryClient';

export const adminKeys = {
    all: ['admin'] as const,
    stats: () => [...adminKeys.all, 'stats'] as const,
    users: () => [...adminKeys.all, 'users'] as const,
    orders: () => [...adminKeys.all, 'orders'] as const,
};

export const useAdminStats = () => {
    return useQuery({
        queryKey: adminKeys.stats(),
        queryFn: async () => {
            // Run counts in parallel
            const [users, orders, products, returns] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }), // Corrected to 'profiles'
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('returns').select('*', { count: 'exact', head: true }),
            ]);

            return {
                totalUsers: users.count || 0,
                totalOrders: orders.count || 0,
                totalProducts: products.count || 0,
                activeReturns: returns.count || 0,
            };
        },
        ...adminQueryOptions // Aggressive 5s polling
    });
};

export const useAdminUsers = (page = 0, limit = 10) => {
    return useQuery({
        queryKey: [...adminKeys.users(), page, limit],
        queryFn: async () => {
            const from = page * limit;
            const to = from + limit - 1;

            const { data, error, count } = await supabase
                .from('profiles') // Corrected to 'profiles'
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return { users: data, count };
        },
        ...adminQueryOptions
    });
};

// New hook for Dashboard Charts
export const useAdminDashboardData = () => {
    return useQuery({
        queryKey: [...adminKeys.all, 'dashboard'],
        queryFn: async () => {
            const [ordersResponse, returns, users] = await Promise.all([
                supabase.from('orders').select('*'),
                supabase.from('returns').select('*'),
                supabase.from('profiles').select('*')
            ]);

            const mappedOrders = (ordersResponse.data || []).map(o => ({
                ...o,
                items: o.items,
                shippingAddress: o.shipping_address,
                orderDate: o.order_date,
                totalAmount: o.total_amount,
                currentStatus: o.current_status,
                statusHistory: o.status_history,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                promotionCode: o.promotion_code,
                userId: o.user_id,
            }));

            return {
                orders: mappedOrders,
                returns: returns.data || [],
                users: users.data || []
            };
        },
        ...adminQueryOptions
    });
};

// New hooks for Admin Lists with Real-Time Data

export const useAdminUsersList = () => {
    return useQuery({
        queryKey: [...adminKeys.users(), 'all'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data; // Returns raw profile data
        },
        ...adminQueryOptions // Real-time polling
    });
};

export const useAdminProductsList = () => {
    return useQuery({
        queryKey: [...adminKeys.all, 'products', 'list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        ...adminQueryOptions // Real-time polling
    });
};

export const useAdminRecentOrders = () => {
    return useQuery({
        queryKey: [...adminKeys.orders(), 'recent'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, user:users(name, email)') // Join if relations exist
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data;
        },
        ...adminQueryOptions
    });
};

// ----------------------------------------------------------------------
// 📦 PAGINATION HOOKS (Replaces loadAdminData)
// ----------------------------------------------------------------------

interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    viewMode?: 'all' | 'local' | 'pickup';
    storeCity?: string;
    statusFilter?: string;
}

interface PaginatedResponse<T> {
    data: T[];
    count: number;
}


// 📦 ORDERS Paginator
export const useAdminPaginatedOrders = ({ page, limit, search, viewMode, storeCity, statusFilter }: PaginationParams) => {
    return useQuery({
        queryKey: ['admin', 'orders', 'paginated', page, limit, search, viewMode, storeCity, statusFilter],
        queryFn: async (): Promise<PaginatedResponse<any>> => {
            // API page is 1-indexed for UI, but Supabase range is 0-indexed offset
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabase.from('orders').select('*', { count: 'exact' });

            if (search) {
                query = query.or(`id.ilike.%${search}%,customer_email.ilike.%${search}%`);
            }

            if (viewMode === 'pickup') {
                query = query.eq('delivery_type', 'pickup');
            } else if (viewMode === 'local' && storeCity) {
                // Approximate JSON query for city; assumes shipping_address is a JSONB column
                // ->> accesses the field as text
                query = query.ilike('shipping_address->>city', storeCity);
            }

            if (statusFilter && statusFilter !== 'all') {
                query = query.ilike('current_status', `%${statusFilter}%`);
            }

            const { data, error, count } = await query
                .order('order_date', { ascending: false })
                .range(from, to);

            if (error) throw error;

            // Transform DB raw data matching old Context format
            const formattedData = data.map(o => ({
                ...o,
                items: o.items,
                shippingAddress: o.shipping_address,
                orderDate: o.order_date,
                totalAmount: o.total_amount,
                currentStatus: o.current_status,
                statusHistory: o.status_history,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                promotionCode: o.promotion_code,
                userId: o.user_id,
            }));

            return { data: formattedData, count: count || 0 };
        },
        staleTime: 60 * 1000, // 1 minute
    });
};


// 👥 USERS Paginator
export const useAdminPaginatedUsers = ({ page, limit, search }: PaginationParams) => {
    return useQuery({
        queryKey: ['admin', 'users', 'paginated', page, limit, search],
        queryFn: async (): Promise<PaginatedResponse<any>> => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabase.from('profiles').select('*', { count: 'exact' });

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return { data: data, count: count || 0 };
        },
        staleTime: 5 * 60 * 1000,
    });
};


// 🛍️ PRODUCTS Paginator
export const useAdminPaginatedProducts = ({ page, limit, search }: PaginationParams) => {
    return useQuery({
        queryKey: ['admin', 'products', 'paginated', page, limit, search],
        queryFn: async (): Promise<PaginatedResponse<any>> => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabase.from('products').select('*', { count: 'exact' });

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return { data, count: count || 0 };
        },
        staleTime: 5 * 60 * 1000,
    });
};


// 🔄 RETURNS Paginator
export const useAdminPaginatedReturns = ({ page, limit, search }: PaginationParams) => {
    return useQuery({
        queryKey: ['admin', 'returns', 'paginated', page, limit, search],
        queryFn: async (): Promise<PaginatedResponse<any>> => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // Simplified raw return query
            let query = supabase.from('returns')
                .select('*', { count: 'exact' });

            const { data, error, count } = await query
                .order('return_requested_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return { data: data as any[], count: count || 0 };
        },
        staleTime: 60 * 1000,
    });
};

export const useAdminOrdersByUserId = (userId?: string) => {
    return useQuery({
        queryKey: ['admin', 'users', userId, 'orders'],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('order_date', { ascending: false });
            if (error) throw error;

            return data.map(o => ({
                ...o,
                items: o.items,
                shippingAddress: o.shipping_address,
                orderDate: o.order_date,
                totalAmount: o.total_amount,
                currentStatus: o.current_status,
                statusHistory: o.status_history,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                promotionCode: o.promotion_code,
                userId: o.user_id,
            }));
        },
        enabled: !!userId,
        staleTime: 60 * 1000,
    });
};

// ----------------------------------------------------------------------
// 🔍 INDIVIDUAL ITEM HOOKS (Replaces getOrderById, getUserById)
// ----------------------------------------------------------------------

export const useAdminOrderById = (id?: string) => {
    return useQuery({
        queryKey: ['admin', 'order', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
            if (error) throw error;

            // Format to match old Context format
            return {
                ...data,
                items: data.items,
                shippingAddress: data.shipping_address,
                orderDate: data.order_date,
                totalAmount: data.total_amount,
                currentStatus: data.current_status,
                statusHistory: data.status_history,
                customerName: data.customer_name,
                customerEmail: data.customer_email,
                promotionCode: data.promotion_code,
                userId: data.user_id,
            };
        },
        enabled: !!id,
        staleTime: 60 * 1000,
    });
};

export const useAdminUserById = (id?: string) => {
    return useQuery({
        queryKey: ['admin', 'user', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 60 * 1000,
    });
};

export const useAdminInvoiceByOrderId = (orderId?: string) => {
    return useQuery({
        queryKey: ['admin', 'invoice', orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const { data, error } = await supabase.from('invoices').select('*').eq('order_id', orderId).single();
            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                throw error;
            }
            return data || null;
        },
        enabled: !!orderId,
        staleTime: 60 * 1000,
    });
};

// ----------------------------------------------------------------------
// 📦 BULK / ALL DATA HOOKS (For InvoicesPage, Analytics, etc.)
// ----------------------------------------------------------------------

export const useAdminAllOrders = () => {
    return useQuery({
        queryKey: ['admin', 'orders', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
            if (error) throw error;

            return data.map(o => ({
                ...o,
                items: o.items,
                shippingAddress: o.shipping_address,
                orderDate: o.order_date,
                totalAmount: o.total_amount,
                currentStatus: o.current_status,
                statusHistory: o.status_history,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                promotionCode: o.promotion_code,
                userId: o.user_id,
            }));
        },
        staleTime: 60 * 1000,
    });
};

export const useAdminAllInvoices = () => {
    return useQuery({
        queryKey: ['admin', 'invoices', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase.from('invoices').select('*');
            if (error) throw error;
            return data;
        },
        staleTime: 60 * 1000, // 1 minute
    });
};

export const useAdminAllReturns = () => {
    return useQuery({
        queryKey: ['admin', 'returns', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase.from('returns').select('*');
            if (error) throw error;
            return data;
        },
        staleTime: 60 * 1000,
    });
};
