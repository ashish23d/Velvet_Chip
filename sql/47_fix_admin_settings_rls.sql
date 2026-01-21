-- Enable RLS for settings tables
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serviceable_rules ENABLE ROW LEVEL SECURITY;

-- 1. Tax Settings Policies
CREATE POLICY "Admins can manage tax settings"
ON public.tax_settings
FOR ALL
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Public can view tax settings"
ON public.tax_settings
FOR SELECT
USING (true);

-- 2. Delivery Settings Policies
CREATE POLICY "Admins can manage delivery settings"
ON public.delivery_settings
FOR ALL
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Public can view delivery settings"
ON public.delivery_settings
FOR SELECT
USING (true);

-- 3. Serviceable Rules Policies
CREATE POLICY "Admins can manage serviceable rules"
ON public.serviceable_rules
FOR ALL
USING (get_my_role() = 'admin')
WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Public can view serviceable rules"
ON public.serviceable_rules
FOR SELECT
USING (true);
