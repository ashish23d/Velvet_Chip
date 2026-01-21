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
            const [orders, returns, users] = await Promise.all([
                supabase.from('orders').select('*'),
                supabase.from('returns').select('*'),
                supabase.from('profiles').select('*')
            ]);

            return {
                orders: orders.data || [],
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
