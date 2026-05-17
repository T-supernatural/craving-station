-- Menu Items
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text check (category in ('starters', 'mains', 'desserts', 'drinks')),
  image_url text,
  available boolean default true,
  created_at timestamp default now()
);

-- Reservations
create table reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  date date not null,
  time text not null,
  guests integer not null,
  special_requests text,
  status text default 'pending',
  created_at timestamp default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  items jsonb not null,
  total numeric not null,
  stripe_payment_id text,
  status text default 'pending',
  created_at timestamp default now()
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  delivery_address text,
  city text,
  landmark text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Customers can only read/update/insert their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id or auth.uid() is not null);

-- Allow authenticated users to view profiles (temporary for debugging)
create policy "Authenticated users can view profiles" on profiles
  for select using (auth.uid() is not null);

-- Admins can view all profiles
create policy "Admins can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Enable RLS for orders
alter table orders enable row level security;

-- Users can view their own orders, admins can view all
create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);
create policy "Authenticated users can view orders" on orders
  for select using (auth.uid() is not null);
create policy "Admins can view all orders" on orders
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
create policy "Anyone can insert orders" on orders
  for insert with check (true);

-- Enable RLS for reservations
alter table reservations enable row level security;

-- Users can view their own reservations, admins can view all
create policy "Users can view own reservations" on reservations
  for select using (auth.uid() = user_id);
create policy "Admins can view all reservations" on reservations
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
create policy "Anyone can insert reservations" on reservations
  for insert with check (true);

-- Enable RLS for menu_items
alter table menu_items enable row level security;

-- Anyone can view menu items, admins can manage them
create policy "Anyone can view menu items" on menu_items
  for select using (true);
create policy "Admins can manage menu items" on menu_items
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Enable RLS for restaurant_settings
alter table restaurant_settings enable row level security;

-- Admins can manage restaurant settings
create policy "Admins can manage restaurant settings" on restaurant_settings
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Update orders table to link to user
alter table orders add column user_id uuid references auth.users(id);
alter table orders add column customer_name text;
alter table orders add column customer_phone text;
alter table orders add column delivery_address text;
alter table orders add column city text;
alter table orders add column landmark text;
alter table orders add column delivery_notes text;
alter table orders add column delivery_fee numeric default 1500;
alter table orders add column paystack_reference text;

-- Update reservations table to optionally link to user
alter table reservations add column user_id uuid references auth.users(id);

-- Restaurant settings
create table restaurant_settings (
  id integer primary key default 1,
  restaurant_name text default 'Yakoyo Restaurant',
  restaurant_description text,
  restaurant_address text,
  restaurant_phone text,
  restaurant_email text,
  delivery_fee numeric default 1500,
  is_open boolean default true,
  opening_hours jsonb default '{
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"},
    "wednesday": {"open": "09:00", "close": "22:00"},
    "thursday": {"open": "09:00", "close": "22:00"},
    "friday": {"open": "09:00", "close": "22:00"},
    "saturday": {"open": "09:00", "close": "22:00"},
    "sunday": {"open": "09:00", "close": "22:00"}
  }',
  updated_at timestamp default now()
);

-- Gallery Images
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text check (category in ('Food', 'Ambiance', 'Events', 'Chef\'s Table')),
  storage_path text not null,
  created_at timestamp default now()
);

-- Newsletter Subscribers
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamp default now()
);

-- Enable RLS for gallery_images
alter table gallery_images enable row level security;

-- Anyone can view gallery images, admins can manage them
create policy "Anyone can view gallery images" on gallery_images
  for select using (true);
create policy "Admins can manage gallery images" on gallery_images
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Enable RLS for newsletter_subscribers
alter table newsletter_subscribers enable row level security;

-- Anyone can subscribe to newsletter
create policy "Anyone can subscribe to newsletter" on newsletter_subscribers
  for insert with check (true);

-- Admins can view subscribers
create policy "Admins can view newsletter subscribers" on newsletter_subscribers
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
