-- Auth + authorization for the back office.
-- Roles: pending, admin, super_admin, rejected
-- Flow: Register → Verify Email → pending → Super Admin Review → admin
-- First account becomes super_admin (so someone can approve later signups).
-- Also set Authentication → URL Configuration:
--   Site URL: production origin
--   Redirect URLs: {origin}/auth.html and http://127.0.0.1:8765/auth.html
-- Enable Confirm email so Register includes Email Verification.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'pending'
    check (role in ('pending', 'admin', 'super_admin', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists reviewed_at timestamptz;

alter table public.profiles enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count integer;
begin
  select count(*) into admin_count from public.profiles where role = 'super_admin';
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when admin_count = 0 then 'super_admin' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_super on public.profiles;
drop policy if exists profiles_update_super on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_select_super on public.profiles
  for select to authenticated using (public.is_super_admin());
create policy profiles_update_super on public.profiles
  for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

grant select, update on public.profiles to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

create or replace function public.ensure_own_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
  admin_count integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into result from public.profiles where id = auth.uid();
  select count(*) into admin_count from public.profiles where role = 'super_admin';

  if result.id is null then
    insert into public.profiles (id, email, full_name, role)
    values (
      auth.uid(),
      coalesce(auth.jwt() ->> 'email', ''),
      coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', ''),
      case when admin_count = 0 then 'super_admin' else 'pending' end
    )
    returning * into result;
  else
    if admin_count = 0 and result.role is distinct from 'super_admin' then
      update public.profiles
        set role = 'super_admin'
        where id = auth.uid()
      returning * into result;
    end if;
    if coalesce(result.full_name, '') = '' then
      update public.profiles
        set full_name = coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', result.full_name)
        where id = auth.uid()
      returning * into result;
    end if;
  end if;

  return result;
end;
$$;

grant execute on function public.ensure_own_profile() to authenticated;

drop policy if exists faculty_write on public.faculty;
create policy faculty_write on public.faculty
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
