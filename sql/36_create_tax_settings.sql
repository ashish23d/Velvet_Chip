-- Create tax_settings table
CREATE TABLE IF NOT EXISTS public.tax_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT false,
    mode TEXT CHECK (mode IN ('global', 'category')) DEFAULT 'global',
    global_rate NUMERIC DEFAULT 0,
    label TEXT DEFAULT 'GST',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings
INSERT INTO public.tax_settings (id, enabled, mode, global_rate, label)
VALUES (1, false, 'global', 18, 'GST')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- Policies for tax_settings
CREATE POLICY "Public Read Access" ON public.tax_settings FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.tax_settings USING (auth.role() = 'service_role' OR auth.email() = 'velvetchip2025@gmail.com'); -- Adjust admin check as needed or reuse existing admin logic

-- Add tax_rate to categories if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'tax_rate') THEN
        ALTER TABLE public.categories ADD COLUMN tax_rate NUMERIC DEFAULT 0;
    END IF;
END $$;
