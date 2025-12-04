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
const supabaseUrl = 'https://kkmqanhkffyllsmutllw.supabase.co'; 
// TODO: Replace with your Supabase Public Anon Key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbXFhbmhrZmZ5bGxzbXV0bGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NzkyMjAsImV4cCI6MjA2OTI1NTIyMH0.LQSnupFPBLpEZe20JVFLFeHrX-pmss9gtfOBEBBe0G4';

// --- END OF ACTION REQUIRED ---

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);