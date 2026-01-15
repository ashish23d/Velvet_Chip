    -- Enable Row Level Security
    ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies to ensure a clean slate and avoid conflicts
    DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
    DROP POLICY IF EXISTS "Users can insert their own search history" ON public.search_history;
    DROP POLICY IF EXISTS "Users can delete their own search history" ON public.search_history;
    DROP POLICY IF EXISTS "Users manage own search history" ON public.search_history;

    -- Create specific policies
    -- 1. View Policy
    CREATE POLICY "Users can view their own search history" 
    ON public.search_history 
    FOR SELECT 
    USING (auth.uid() = user_id);

    -- 2. Insert Policy
    CREATE POLICY "Users can insert their own search history" 
    ON public.search_history 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    -- 3. Delete Policy
    CREATE POLICY "Users can delete their own search history" 
    ON public.search_history 
    FOR DELETE 
    USING (auth.uid() = user_id);
