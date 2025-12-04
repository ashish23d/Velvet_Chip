-- Supabase RLS Policy Script
-- Generated automatically

-- Enable RLS
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.contacts enable row level security;
alter table public.invoices enable row level security;
alter table public.mail_templates enable row level security;
alter table public.offers enable row level security;
alter table public.orders enable row level security;
alter table public.pending_changes enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.promotions enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_items enable row level security;
alter table public.search_history enable row level security;
alter table public.seasonal_edit_cards enable row level security;
alter table public.site_content enable row level security;
alter table public.slides enable row level security;
alter table public.subscribers enable row level security;

-- Policies
create policy "Admins can manage all addresses"
on public.addresses
for all
using (get_my_role() = 'admin')
with check (get_my_role() = 'admin');

create policy "Users manage own addresses"
on public.addresses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins manage categories"
on public.categories
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Public can view categories"
on public.categories
for select
using (true);

create policy "Admins can delete contact submissions"
on public.contact_submissions
for delete
using (get_user_role() = 'admin');

create policy "Admins can view contact submissions"
on public.contact_submissions
for select
using (get_user_role() = 'admin');

create policy "Public can insert contact submissions"
on public.contact_submissions
for insert
with check (true);

create policy "Admins manage contacts"
on public.contacts
for all
using (get_my_role() = 'admin');

create policy "Public can insert contact"
on public.contacts
for insert
with check (true);

create policy "Admins manage invoices"
on public.invoices
for all
using ((select role from profiles where id = auth.uid()) = 'admin')
with check ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Users can view own invoices"
on public.invoices
for select
using (auth.uid() = user_id);

create policy "Admins manage mail templates"
on public.mail_templates
for all
using ((select role from profiles where id = auth.uid()) = 'admin')
with check ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admins manage offers"
on public.offers
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Public can view active offers"
on public.offers
for select
using (is_active = true AND (end_date IS NULL OR end_date > now()));

create policy "Admins manage orders"
on public.orders
for all
using (get_my_role() = 'admin')
with check (get_my_role() = 'admin');

create policy "Users view own orders"
on public.orders
for select
using (auth.uid() = user_id);

create policy "Users insert own orders"
on public.orders
for insert
with check (auth.uid() = user_id);

create policy "Admins manage pending_changes"
on public.pending_changes
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Admins manage products"
on public.products
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Public can view products"
on public.products
for select
using (true);

create policy "Admins manage profiles"
on public.profiles
for all
using (get_my_role() = 'admin')
with check (get_my_role() = 'admin');

create policy "Users manage own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins manage promotions"
on public.promotions
for all
using (get_my_role() = 'admin')
with check (get_my_role() = 'admin');

create policy "Public can view active promotions"
on public.promotions
for select
using (is_active = true AND expires_at > now());

create policy "Admins moderate reviews"
on public.reviews
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Users create reviews"
on public.reviews
for insert
with check (auth.role() = 'authenticated');

create policy "Public view approved reviews"
on public.reviews
for select
using (status = 'approved');

create policy "Users view own pending reviews"
on public.reviews
for select
using (auth.uid() = user_id);

create policy "Users manage own saved items"
on public.saved_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own search history"
on public.search_history
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins manage seasonal cards"
on public.seasonal_edit_cards
for all
using ((select role from profiles where id = auth.uid()) = 'admin')
with check ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Public read seasonal cards"
on public.seasonal_edit_cards
for select
using (true);

create policy "Admins manage site content"
on public.site_content
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Public view site content"
on public.site_content
for select
using (true);

create policy "Admins manage slides"
on public.slides
for all
using (get_user_role() = 'admin')
with check (get_user_role() = 'admin');

create policy "Public can view slides"
on public.slides
for select
using (true);

create policy "Admins can view subscribers"
on public.subscribers
for select
using (get_user_role() = 'admin');

create policy "Admins can delete subscribers"
on public.subscribers
for delete
using (get_user_role() = 'admin');

create policy "Public can subscribe"
on public.subscribers
for insert
with check (true);
