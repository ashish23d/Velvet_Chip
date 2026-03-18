import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Order, ReturnRequest } from '../../types';

export const userKeys = {
    all: ['user-data'] as const,
    orders: (userId: string) => [...userKeys.all, 'orders', userId] as const,
    returns: (userId: string) => [...userKeys.all, 'returns', userId] as const,
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

export const useUserOrders = (userId: string | undefined) => {
    return useQuery({
        queryKey: userKeys.orders(userId || ''),
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapDbOrderToAppOrder);
        },
        enabled: !!userId,
    });
};

export const useUserReturns = (userId: string | undefined) => {
    return useQuery({
        queryKey: userKeys.returns(userId || ''),
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('returns')
                .select('*')
                .eq('user_id', userId)
                .order('return_requested_at', { ascending: false });

            if (error) throw error;
            return data as ReturnRequest[];
        },
        enabled: !!userId,
    });
};
