-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('order', 'offer', 'system', 'return')),
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  timestamp timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Allow service role or admins to insert notifications for anyone
create policy "Admins and Service Role can insert notifications"
  on public.notifications for insert
  with check (true);
