create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  role text not null check (role in ('buyer', 'supplier', 'admin')),
  company_name text,
  phone text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create table price_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id),
  material_category text not null,
  quantity_tonnes numeric not null,
  delivery_postcode text not null,
  delivery_address text,
  required_date date not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'quoted', 'accepted', 'paid', 'delivered', 'cancelled')),
  created_at timestamptz default now()
);
alter table price_requests enable row level security;
create policy "Buyers read own requests" on price_requests for select using (auth.uid() = buyer_id);
create policy "Buyers insert requests" on price_requests for insert with check (auth.uid() = buyer_id);
create policy "Suppliers read open requests" on price_requests for select using (status = 'open');

create table quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references price_requests(id),
  supplier_id uuid references profiles(id),
  price_per_tonne numeric not null,
  total_price numeric not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  ghost_bid boolean default false,
  ghost_supplier_name text,
  created_at timestamptz default now()
);
alter table quotes enable row level security;
create policy "Suppliers read own quotes" on quotes for select using (auth.uid() = supplier_id);
create policy "Suppliers insert quotes" on quotes for insert with check (auth.uid() = supplier_id);
create policy "Buyers read quotes on own requests" on quotes for select using (
  exists (select 1 from price_requests where id = request_id and buyer_id = auth.uid())
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references price_requests(id),
  quote_id uuid references quotes(id),
  buyer_id uuid references profiles(id),
  supplier_id uuid references profiles(id),
  supplier_price numeric not null,
  buyer_price numeric not null,
  platform_fee_buyer numeric not null,
  platform_fee_supplier numeric not null,
  supplier_payout numeric not null,
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  delivery_status text default 'pending' check (delivery_status in ('pending', 'in_progress', 'delivered')),
  created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "Buyers read own orders" on orders for select using (auth.uid() = buyer_id);
create policy "Suppliers read own orders" on orders for select using (auth.uid() = supplier_id);
