import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Notification } from '../../types';
import { realTimeOptions } from '../queryClient';

export const notificationKeys = {
    all: ['notifications'] as const,
    list: (userId: string) => [...notificationKeys.all, 'list', userId] as const,
    unread: (userId: string) => [...notificationKeys.all, 'unread', userId] as const,
};

export const useNotifications = (userId: string | undefined) => {
    return useQuery({
        queryKey: notificationKeys.list(userId || ''),
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!userId,
        // Real-time polling
        ...realTimeOptions
    });
};

export const useUnreadCount = (userId: string | undefined) => {
    return useQuery({
        queryKey: notificationKeys.unread(userId || ''),
        queryFn: async () => {
            if (!userId) return 0;
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!userId,
        // Real-time polling
        ...realTimeOptions
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ notificationId, userId }: { notificationId: string, userId: string }) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(variables.userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unread(variables.userId) });
        },
    });
};
