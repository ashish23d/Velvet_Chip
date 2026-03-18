import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 10 minutes (increased for better cache hit rate across tabs)
            staleTime: 1000 * 60 * 10,

            // Keep unused data in cache for 1 hour
            gcTime: 1000 * 60 * 60,

            // Refetch on window focus is often good for ensuring data freshness, 
            // but for a "robust" ecommerce feel, we might want to rely on staleTime more 
            // to prevent constant spinning spinners when switching tabs.
            // Let's keep it true but the high staleTime will prevent actual refetches unless content is old.
            refetchOnWindowFocus: true,

            // Retry failed requests 3 times
            retry: 3,

            // Don't refetch on mount if data is already cached and fresh
            refetchOnMount: false,
        },
    },
});

// Admin-specific query options for real-time dashboards
export const adminQueryOptions = {
    // Admin data is always considered stale to force checks
    staleTime: 0,
    // Poll every 5 seconds
    refetchInterval: 5000,
    // Poll even when window is in background (optional, maybe too aggressive if tab is hidden)
    refetchIntervalInBackground: false,
};

// Real-time user data options (e.g. notifications)
export const realTimeOptions = {
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 10000, // 10 seconds
};
