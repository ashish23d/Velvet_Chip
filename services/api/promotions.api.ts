import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient.ts';

export const usePromotions = () => {
    return useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useAddPromotion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (p: any) => {
            const dbPayload = {
                code: p.code, type: p.type, value: p.value, min_purchase: p.minPurchase,
                usage_limit: p.usageLimit, expires_at: p.expiresAt, is_active: p.isActive
            };
            const { error } = await supabase.from('promotions').insert(dbPayload);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    });
};

export const useUpdatePromotion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (p: any) => {
            const dbPayload = {
                code: p.code, type: p.type, value: p.value, min_purchase: p.minPurchase,
                usage_limit: p.usageLimit, expires_at: p.expiresAt, is_active: p.isActive
            };
            const { error } = await supabase.from('promotions').update(dbPayload).eq('id', p.id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    });
};

export const useDeletePromotion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('promotions').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    });
};
