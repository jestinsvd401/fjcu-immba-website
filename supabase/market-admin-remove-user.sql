-- Super admin can remove a seller or buyer.
-- The account cannot sign in and its listings leave the floor.
-- Past orders stay so the transaction ledger remains intact.

alter table public.market_users
  add column if not exists removed_at timestamptz;

create or replace function public.market_public_user(u public.market_users, uid text, is_admin boolean)
returns jsonb
language sql
stable
set search_path = public, extensions
as $$
  select jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'roles', to_jsonb(u.roles),
    'shopName', u.shop_name,
    'sellerStatus', u.seller_status,
    'suspended', u.suspended,
    'removedAt', u.removed_at,
    'platformOwner', u.platform_owner,
    'address', case when is_admin or u.id = uid then u.address else null end,
    'cart', case when is_admin or u.id = uid then u.cart else '[]'::jsonb end,
    'createdAt', u.created_at
  );
$$;

do $migration$
declare
  def text;
begin
  def := pg_get_functiondef('public.market_login(text, text)'::regprocedure);
  if position('if account.suspended then' in def) = 0 then
    raise exception 'market_login suspended check was not found';
  end if;
  execute replace(def, 'if account.suspended then', 'if account.suspended or account.removed_at is not null then');

  def := pg_get_functiondef('public.market_save(text, jsonb)'::regprocedure);
  if position('suspended = case when is_admin and not platform_owner then coalesce((rec->>''suspended'')::boolean, false) else suspended end' in def) = 0 then
    raise exception 'market_save suspended assignment was not found';
  end if;
  execute replace(
    def,
    'suspended = case when is_admin and not platform_owner then coalesce((rec->>''suspended'')::boolean, false) else suspended end',
    'suspended = case when removed_at is not null then true when is_admin and not platform_owner then coalesce((rec->>''suspended'')::boolean, false) else suspended end'
  );
end
$migration$;

create or replace function public.market_admin_remove_user(p_token text, p_user_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id text;
  actor_name text;
  is_admin boolean := false;
  target public.market_users%rowtype;
begin
  select u.id, u.name, ('admin' = any(u.roles))
    into actor_id, actor_name, is_admin
  from public.market_sessions s
  join public.market_users u on u.id = s.user_id
  where s.token = p_token
    and u.suspended = false
    and u.removed_at is null;

  if actor_id is null or not coalesce(is_admin, false) then
    return jsonb_build_object('ok', false, 'error', 'admin_only');
  end if;

  select * into target from public.market_users where id = p_user_id;
  if not found or target.platform_owner or ('admin' = any(target.roles)) or target.id = actor_id then
    return jsonb_build_object('ok', false, 'error', 'locked');
  end if;
  if target.removed_at is not null then
    return jsonb_build_object('ok', false, 'error', 'step');
  end if;

  update public.market_users
    set suspended = true,
        removed_at = now(),
        cart = '[]'::jsonb
    where id = target.id;

  update public.market_products
    set listing_status = 'removed',
        updated_at = now()
    where seller_id = target.id
      and listing_status is distinct from 'removed';

  delete from public.market_sessions where user_id = target.id;

  insert into public.market_activity (id, at, type, actor_name, message)
  values (
    'a' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    now(),
    'user_removed',
    actor_name,
    jsonb_build_object(
      'en', actor_name || ' removed ' || target.name || ' (' || target.email || '). Past transactions stay on record.',
      'zh', actor_name || ' 已移除 ' || target.name || '（' || target.email || '）。過去的交易仍保留。'
    )
  );

  return jsonb_build_object('ok', true, 'id', target.id);
end;
$$;

revoke all on function public.market_admin_remove_user(text, text) from public;
grant execute on function public.market_admin_remove_user(text, text) to anon, authenticated;
