import { createClient } from '@supabase/supabase-js';
import { Database } from '../types.ts';

// ---
// --- IMPORTANT: ACTION REQUIRED ---
// ---
// You must replace the placeholder values below with your actual Supabase project URL and Public Anon Key.
// You can find these in your Supabase project dashboard under "Settings" > "API".
// The application will not work until you do this.
// ---

// TODO: Replace with your Supabase Project URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Debug:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    keyStart: supabaseAnonKey?.slice(0, 5) + '...'
});

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be defined in .env file');
}

// --- END OF ACTION REQUIRED ---

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'apikey': supabaseAnonKey
        }
    }
}) as any;