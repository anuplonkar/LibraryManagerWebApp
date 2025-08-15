-- Enable UUIDs
create extension if not exists "uuid-ossp";

create table public.roles (
  id text primary key check (id in ('admin','staff'))
);

insert into public.roles (id) values ('admin'), ('staff') on conflict do nothing;

create table public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null references public.roles(id) default 'staff',
  created_at timestamptz default now()
);

create table public.members (
  id uuid primary key default uuid_generate_v4(),
  member_code text unique not null,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz default now()
);

create table public.books (
  id uuid primary key default uuid_generate_v4(),
  isbn text,
  title text not null,
  author text,
  publisher text,
  year int,
  tags text[] default '{}',
  total_copies int not null default 1 check (total_copies >= 0),
  created_at timestamptz default now()
);

alter table public.books add column if not exists copies_available int not null default 1 check (copies_available >= 0);

create table public.loans (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.members(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  issued_by uuid not null references public.app_users(user_id),
  issued_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  renewed_count int not null default 0
);

create index if not exists loans_member_id_idx on public.loans (member_id);
create index if not exists loans_book_id_idx on public.loans (book_id);
create index if not exists loans_due_at_idx on public.loans (due_at);

create table public.audit_log (
  id bigserial primary key,
  at timestamptz default now(),
  actor uuid references public.app_users(user_id),
  action text not null,
  details jsonb
);

alter table public.app_users enable row level security;
alter table public.members enable row level security;
alter table public.books enable row level security;
alter table public.loans enable row level security;
alter table public.audit_log enable row level security;

create policy if not exists "read_all_auth" on public.members for select using (auth.role() = 'authenticated');
create policy if not exists "read_all_auth_books" on public.books for select using (auth.role() = 'authenticated');
create policy if not exists "read_all_auth_loans" on public.loans for select using (auth.role() = 'authenticated');
create policy if not exists "read_all_auth_audit" on public.audit_log for select using (auth.role() = 'authenticated');
create policy if not exists "read_all_auth_users" on public.app_users for select using (auth.role() = 'authenticated');

create policy if not exists "write_members" on public.members for insert with check (auth.role() = 'authenticated');
create policy if not exists "update_members" on public.members for update using (auth.role() = 'authenticated');

create policy if not exists "write_books" on public.books for insert with check (auth.role() = 'authenticated');
create policy if not exists "update_books" on public.books for update using (auth.role() = 'authenticated');

create policy if not exists "write_loans" on public.loans for insert with check (auth.role() = 'authenticated');
create policy if not exists "update_loans" on public.loans for update using (auth.role() = 'authenticated');

create policy if not exists "write_audit" on public.audit_log for insert with check (auth.role() = 'authenticated');
