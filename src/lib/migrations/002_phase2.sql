-- Listings (surplus stock posted by sellers)
create table listings (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid references profiles(id) on delete cascade,
  material_type text not null,
  description text,
  quantity_tonnes numeric not null,
  original_quantity_tonnes numeric not null,
  min_order_collection numeric,
  min_order_delivery numeric,
  ex_works_price numeric not null,
  delivery_rate_per_mile numeric,
  delivery_radius_miles numeric default 50,
  bulk_discount_threshold numeric,
  bulk_discount_price numeric,
  images text[] default '{}',
  site_name text,
  location_postcode text not null,
  lat numeric,
  lng numeric,
  stock_threshold numeric,
  status text not null default 'active' check (status in ('active','sold','expired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table listings enable row level security;
create policy "Anyone can view active listings" on listings for select using (status = 'active');
create policy "Sellers manage own listings" on listings for all using (auth.uid() = posted_by);

-- Requirements (buyer requests distributed to suppliers)
create table requirements (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid references profiles(id),
  name text not null,
  email text not null,
  phone text not null,
  delivery_address text not null,
  material_type text not null,
  description text,
  quantity_tonnes numeric not null,
  delivery_postcode text not null,
  delivery_lat numeric,
  delivery_lng numeric,
  required_date date,
  flexible_date boolean default false,
  status text not null default 'open' check (status in ('open','quoted','fulfilled','cancelled')),
  created_at timestamptz default now()
);
alter table requirements enable row level security;
create policy "Anyone can insert requirements" on requirements for insert with check (true);
create policy "Owners read own requirements" on requirements for select using (auth.uid() = posted_by);
create policy "Suppliers read open requirements" on requirements for select using (status = 'open');

-- Requirement quotes (supplier responses)
create table requirement_quotes (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid references requirements(id) on delete cascade,
  supplier_id uuid references profiles(id),
  delivered_price_total numeric not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now()
);
alter table requirement_quotes enable row level security;
create policy "Suppliers manage own quotes" on requirement_quotes for all using (auth.uid() = supplier_id);
create policy "Requirement owners read quotes on their requirements" on requirement_quotes for select using (
  exists (select 1 from requirements where id = requirement_id and posted_by = auth.uid())
);

-- Orders
-- Phase 1 (001_initial.sql) created an `orders` table with a different schema and 0 rows.
-- Phase 2 replaces it with the canonical design below (drop is safe — no data).
drop table if exists orders cascade;
create table orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id),
  requirement_quote_id uuid references requirement_quotes(id),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  quantity_tonnes numeric not null,
  delivered_price numeric not null,
  platform_fee numeric not null,
  seller_payout numeric not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded','invoiced')),
  delivery_status text not null default 'pending' check (delivery_status in ('pending','in_progress','delivered')),
  credit_account boolean default false,
  stripe_payment_intent text,
  tipperlink_load_id text,
  created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "Buyers read own orders" on orders for select using (auth.uid() = buyer_id);
create policy "Sellers read own orders" on orders for select using (auth.uid() = seller_id);

-- Verified suppliers
create table verified_suppliers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade unique,
  verified_at timestamptz default now(),
  verified_by text
);
alter table verified_suppliers enable row level security;
create policy "Anyone can read verified suppliers" on verified_suppliers for select using (true);

-- Stripe Connect accounts
create table stripe_connect_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade unique,
  stripe_account_id text not null,
  onboarded boolean default false,
  created_at timestamptz default now()
);
alter table stripe_connect_accounts enable row level security;
create policy "Users manage own stripe account" on stripe_connect_accounts for all using (auth.uid() = profile_id);

-- Blocked sellers (competitor restriction)
create table blocked_sellers (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade,
  blocked_buyer_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(seller_id, blocked_buyer_id)
);
alter table blocked_sellers enable row level security;
create policy "Sellers manage own block list" on blocked_sellers for all using (auth.uid() = seller_id);
