-- Buyer and seller password reset.
-- The person proves the email through Supabase Auth, then this function
-- stores a new marketplace password and records the change for the admin.

alter table public.market_users
  add column if not exists password_changed_at timestamptz;

do $$
declare
  def text;
begin
  select pg_get_functiondef('public.market_public_user(public.market_users, text, boolean)'::regprocedure) into def;
  if position('passwordChangedAt' in def) = 0 then
    def := replace(
      def,
      '''createdAt'', u.created_at',
      '''createdAt'', u.created_at, ''passwordChangedAt'', u.password_changed_at'
    );
    execute def;
  end if;
end;
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
  if coalesce(new.raw_user_meta_data ->> 'purpose', '') = 'market_reset' then
    return new;
  end if;
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

  if coalesce(auth.jwt() -> 'user_metadata' ->> 'purpose', '') = 'market_reset' then
    select * into result from public.profiles where id = auth.uid();
    return result;
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

create or replace function public.market_password_reset_request(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  account public.market_users%rowtype;
  activity_id text;
begin
  select * into account
  from public.market_users
  where email = lower(trim(coalesce(p_email, '')))
    and removed_at is null;

  if not found
     or account.suspended
     or not ('buyer' = any(account.roles) or 'seller' = any(account.roles)) then
    return jsonb_build_object('ok', true, 'eligible', false);
  end if;

  update public.market_meta
    set activity_seq = activity_seq + 1
    where id = 'main'
    returning 'a' || activity_seq into activity_id;

  insert into public.market_activity (id, at, type, actor_name, message)
  values (
    activity_id,
    now(),
    'password_reset_requested',
    account.name,
    jsonb_build_object(
      'en', account.name || ' (' || account.email || ') asked to reset the marketplace password.',
      'zh', account.name || '（' || account.email || '）申請重設市集密碼。'
    )
  );

  return jsonb_build_object('ok', true, 'eligible', true);
end;
$$;

create or replace function public.market_password_reset(p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  person_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  account public.market_users%rowtype;
  activity_id text;
begin
  if auth.uid() is null or person_email = '' then
    return jsonb_build_object('ok', false, 'error', 'verify');
  end if;
  if char_length(coalesce(p_password, '')) < 4 then
    return jsonb_build_object('ok', false, 'error', 'password');
  end if;

  select * into account
  from public.market_users
  where email = person_email
    and removed_at is null;

  if not found
     or account.suspended
     or not ('buyer' = any(account.roles) or 'seller' = any(account.roles)) then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;

  update public.market_users
    set password_hash = crypt(p_password, gen_salt('bf')),
        password_changed_at = now()
    where id = account.id;

  delete from public.market_sessions where user_id = account.id;

  update public.market_meta
    set activity_seq = activity_seq + 1
    where id = 'main'
    returning 'a' || activity_seq into activity_id;

  insert into public.market_activity (id, at, type, actor_name, message)
  values (
    activity_id,
    now(),
    'password_changed',
    account.name,
    jsonb_build_object(
      'en', account.name || ' (' || account.email || ') verified the email and set a new marketplace password.',
      'zh', account.name || '（' || account.email || '）已驗證電子郵件並設定新的市集密碼。'
    )
  );

  begin
    delete from auth.users
    where id = auth.uid()
      and coalesce(raw_user_meta_data ->> 'purpose', '') = 'market_reset'
      and not exists (select 1 from public.profiles where id = auth.uid());
  exception when others then
    null;
  end;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.market_password_reset_request(text) from public;
revoke all on function public.market_password_reset(text) from public, anon;
grant execute on function public.market_password_reset_request(text) to anon, authenticated;
grant execute on function public.market_password_reset(text) to authenticated;
