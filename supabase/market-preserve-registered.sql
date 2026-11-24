-- Restoring the sample floor must not delete people who registered.
-- Sample accounts use @immba.test. Everyone else, including their listings,
-- purchases, and the platform owner, is copied back after the sample replace.

create or replace function public.market_reset(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid text;
  payload jsonb;
  fresh text;
  actor_id text;
begin
  select u.id into uid
  from public.market_sessions s
  join public.market_users u on u.id = s.user_id
  where s.token = p_token
    and 'admin' = any(u.roles)
    and u.suspended = false
    and u.removed_at is null;
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'admin_only');
  end if;
  select state into payload from public.market_bootstrap where id = 'seed';
  if payload is null then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;

  create temp table keep_users on commit drop as
    select * from public.market_users
    where email not like '%@immba.test';
  create temp table keep_products on commit drop as
    select * from public.market_products
    where seller_id in (select id from keep_users);
  create temp table keep_orders on commit drop as
    select * from public.market_orders
    where buyer_id in (select id from keep_users)
       or seller_id in (select id from keep_users);
  create temp table keep_activity on commit drop as
    select * from public.market_activity
    where order_id in (select id from keep_orders);

  perform public.market_replace(payload, 'immba-demo');

  insert into public.market_users
  select * from keep_users
  on conflict (id) do nothing;
  insert into public.market_products
  select * from keep_products
  on conflict (id) do nothing;
  insert into public.market_orders
  select * from keep_orders
  on conflict (id) do nothing;
  insert into public.market_activity
  select * from keep_activity
  on conflict (id) do nothing;

  update public.market_meta
    set
      order_seq = greatest(order_seq, coalesce((
        select max(substring(id from 4)::integer)
        from public.market_orders
        where id ~ '^MK-[0-9]+$'
      ), order_seq)),
      product_seq = greatest(product_seq, coalesce((
        select max(substring(id from 2)::integer)
        from public.market_products
        where id ~ '^p[0-9]+$'
      ), product_seq));

  actor_id := case
    when exists (select 1 from public.market_users where id = uid) then uid
    else 'u_wei'
  end;
  fresh := encode(gen_random_bytes(24), 'hex');
  insert into public.market_sessions (token, user_id) values (fresh, actor_id);
  return jsonb_build_object('ok', true, 'token', fresh);
end;
$$;

revoke all on function public.market_reset(text) from public;
grant execute on function public.market_reset(text) to anon, authenticated;
