import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 5 minutes
            staleTime: 1000 * 60 * 5,

            // Keep unused data in cache for 30 minutes
            gcTime: 1000 * 60 * 30,

            // Refetch when window regains focus to ensure data is current
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
