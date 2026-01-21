import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Product, Category } from '../../types';

// Keys for caching
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: string) => [...productKeys.lists(), { filters }] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
    categories: ['categories'] as const,
};

// --- Products ---

export const useProducts = () => {
    return useQuery({
        queryKey: productKeys.lists(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform snake_case to camelCase mapping if needed, 
            // but types seem to align well with DB or expected structure.
            // Adjusting based on types.ts and DB response.
            return data as Product[];
        },
    });
};

export const useProduct = (id: number) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Product;
        },
        enabled: !!id, // Only run if ID is provided
    });
};

export const useProductsByCategory = (categoryId: string) => {
    return useQuery({
        queryKey: productKeys.list(`category-${categoryId}`),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', categoryId);

            if (error) throw error;
            return data as Product[];
        },
        enabled: !!categoryId,
    });
};

// --- Categories ---

export const useCategories = () => {
    return useQuery({
        queryKey: productKeys.categories,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*');

            if (error) throw error;
            return data as Category[];
        },
    });
};
