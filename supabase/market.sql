-- imMBA marketplace. Listings, prices, carts, and orders live in Supabase.
-- The browser uses the publishable key and these functions only.
-- Passwords are stored as hashes and are never returned to the page.

create extension if not exists pgcrypto;

create table if not exists public.market_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  roles text[] not null,
  shop_name text,
  seller_status text,
  suspended boolean not null default false,
  platform_owner boolean not null default false,
  address jsonb,
  cart jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint market_users_seller_status_chk check (seller_status is null or seller_status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.market_products (
  id text primary key,
  seller_id text not null references public.market_users (id),
  name jsonb not null,
  category text not null,
  description jsonb not null,
  price numeric not null check (price >= 0),
  quantity integer not null check (quantity >= 0),
  purchased integer not null default 0 check (purchased >= 0),
  image text not null default '',
  listing_status text not null check (listing_status in ('active', 'hidden', 'removed')),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_orders (
  id text primary key,
  buyer_id text not null references public.market_users (id),
  seller_id text not null references public.market_users (id),
  items jsonb not null,
  total numeric not null check (total >= 0),
  status text not null,
  payment_status text not null,
  prepared boolean not null default false,
  shipment_note text not null default '',
  address jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  completed_at timestamptz,
  timeline jsonb not null default '[]'::jsonb
);

create table if not exists public.market_activity (
  id text primary key,
  at timestamptz not null,
  type text not null,
  actor_name text not null,
  order_id text,
  message jsonb not null
);

create table if not exists public.market_meta (
  id text primary key,
  order_seq integer not null,
  product_seq integer not null,
  activity_seq integer not null
);

create table if not exists public.market_sessions (
  token text primary key,
  user_id text not null references public.market_users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.market_bootstrap (
  id text primary key,
  state jsonb not null
);

alter table public.market_users enable row level security;
alter table public.market_products enable row level security;
alter table public.market_orders enable row level security;
alter table public.market_activity enable row level security;
alter table public.market_meta enable row level security;
alter table public.market_sessions enable row level security;
alter table public.market_bootstrap enable row level security;

revoke all on public.market_users, public.market_products, public.market_orders, public.market_activity, public.market_meta, public.market_sessions, public.market_bootstrap from public, anon, authenticated;

create or replace function public.market_roles(p_roles jsonb)
returns text[]
language sql
immutable
set search_path = public, extensions
as $$
  select coalesce(array_agg(value), '{}'::text[])
  from jsonb_array_elements_text(coalesce(p_roles, '[]'::jsonb)) as t(value)
$$;

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
    'platformOwner', u.platform_owner,
    'address', case when is_admin or u.id = uid then u.address else null end,
    'cart', case when is_admin or u.id = uid then u.cart else '[]'::jsonb end,
    'createdAt', u.created_at
  )
$$;

create or replace function public.market_replace(p_state jsonb, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  rec jsonb;
begin
  delete from public.market_sessions where token is not null;
  delete from public.market_activity where id is not null;
  delete from public.market_orders where id is not null;
  delete from public.market_products where id is not null;
  delete from public.market_users where id is not null;
  delete from public.market_meta where id is not null;

  insert into public.market_users (id, name, email, password_hash, roles, shop_name, seller_status, suspended, address, cart, created_at)
  select
    item->>'id',
    item->>'name',
    lower(item->>'email'),
    crypt(p_password, gen_salt('bf')),
    public.market_roles(item->'roles'),
    nullif(item->>'shopName', ''),
    nullif(item->>'sellerStatus', ''),
    coalesce((item->>'suspended')::boolean, false),
    item->'address',
    coalesce(item->'cart', '[]'::jsonb),
    coalesce((item->>'createdAt')::timestamptz, now())
  from jsonb_array_elements(p_state->'users') as item;

  insert into public.market_products (id, seller_id, name, category, description, price, quantity, purchased, image, listing_status, updated_at)
  select
    item->>'id',
    item->>'sellerId',
    item->'name',
    item->>'category',
    item->'description',
    (item->>'price')::numeric,
    (item->>'quantity')::integer,
    coalesce((item->>'purchased')::integer, 0),
    coalesce(item->>'image', ''),
    item->>'listingStatus',
    coalesce((item->>'updatedAt')::timestamptz, now())
  from jsonb_array_elements(p_state->'products') as item;

  insert into public.market_orders (id, buyer_id, seller_id, items, total, status, payment_status, prepared, shipment_note, address, created_at, updated_at, completed_at, timeline)
  select
    item->>'id',
    item->>'buyerId',
    item->>'sellerId',
    item->'items',
    (item->>'total')::numeric,
    item->>'status',
    item->>'paymentStatus',
    coalesce((item->>'prepared')::boolean, false),
    coalesce(item->>'shipmentNote', ''),
    coalesce(item->'address', '{}'::jsonb),
    (item->>'createdAt')::timestamptz,
    (item->>'updatedAt')::timestamptz,
    nullif(item->>'completedAt', '')::timestamptz,
    coalesce(item->'timeline', '[]'::jsonb)
  from jsonb_array_elements(p_state->'orders') as item;

  insert into public.market_activity (id, at, type, actor_name, order_id, message)
  select
    item->>'id',
    (item->>'at')::timestamptz,
    item->>'type',
    item->>'actorName',
    nullif(item->>'orderId', ''),
    item->'message'
  from jsonb_array_elements(p_state->'activity') as item;

  insert into public.market_meta (id, order_seq, product_seq, activity_seq)
  values (
    'main',
    coalesce((p_state->>'orderSeq')::integer, 18455),
    coalesce((p_state->>'productSeq')::integer, 20),
    coalesce((p_state->>'activitySeq')::integer, 8)
  );
end;
$$;

create or replace function public.market_seed()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  payload jsonb;
begin
  if exists (select 1 from public.market_meta where id = 'main') then
    return;
  end if;
  select state into payload from public.market_bootstrap where id = 'seed';
  if payload is null then
    return;
  end if;
  perform public.market_replace(payload, 'immba-demo');
end;
$$;

create or replace function public.market_load(p_token text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid text;
  is_admin boolean;
begin
  perform public.market_seed();
  select u.id, ('admin' = any(u.roles))
    into uid, is_admin
  from public.market_sessions s
  join public.market_users u on u.id = s.user_id
  where s.token = p_token
    and u.suspended = false;

  is_admin := coalesce(is_admin, false);

  return jsonb_build_object(
    'version', 1,
    'orderSeq', coalesce((select order_seq from public.market_meta where id = 'main'), 18455),
    'productSeq', coalesce((select product_seq from public.market_meta where id = 'main'), 20),
    'activitySeq', coalesce((select activity_seq from public.market_meta where id = 'main'), 8),
    'users', coalesce((
      select jsonb_agg(public.market_public_user(u, uid, is_admin) order by u.created_at)
      from public.market_users u
    ), '[]'::jsonb),
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'category', p.category,
        'description', p.description,
        'price', p.price,
        'quantity', p.quantity,
        'purchased', p.purchased,
        'image', p.image,
        'sellerId', p.seller_id,
        'listingStatus', p.listing_status,
        'updatedAt', p.updated_at
      ) order by p.updated_at desc)
      from public.market_products p
      where p.listing_status = 'active'
         or p.seller_id = uid
         or is_admin
    ), '[]'::jsonb),
    'orders', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id,
        'buyerId', o.buyer_id,
        'sellerId', o.seller_id,
        'items', o.items,
        'total', o.total,
        'status', o.status,
        'paymentStatus', o.payment_status,
        'prepared', o.prepared,
        'shipmentNote', o.shipment_note,
        'address', o.address,
        'createdAt', o.created_at,
        'updatedAt', o.updated_at,
        'completedAt', o.completed_at,
        'timeline', o.timeline
      ) order by o.created_at desc)
      from public.market_orders o
      where is_admin or o.buyer_id = uid or o.seller_id = uid
    ), '[]'::jsonb),
    'activity', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id,
        'at', a.at,
        'type', a.type,
        'actorName', a.actor_name,
        'orderId', a.order_id,
        'message', a.message
      ) order by a.at desc)
      from public.market_activity a
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.market_login(p_email text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  account public.market_users%rowtype;
  fresh text;
begin
  perform public.market_seed();
  select * into account
  from public.market_users
  where email = lower(trim(coalesce(p_email, '')));
  if not found or account.password_hash is distinct from crypt(coalesce(p_password, ''), account.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'credentials');
  end if;
  if account.suspended then
    return jsonb_build_object('ok', false, 'error', 'suspended');
  end if;
  fresh := encode(gen_random_bytes(24), 'hex');
  insert into public.market_sessions (token, user_id) values (fresh, account.id);
  return jsonb_build_object(
    'ok', true,
    'token', fresh,
    'activeRole', account.roles[1],
    'user', public.market_public_user(account, account.id, 'admin' = any(account.roles))
  );
end;
$$;

create or replace function public.market_register(p_input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  person_name text := trim(coalesce(p_input->>'name', ''));
  person_email text := lower(trim(coalesce(p_input->>'email', '')));
  person_password text := coalesce(p_input->>'password', '');
  person_role text := case when p_input->>'role' = 'seller' then 'seller' else 'buyer' end;
  shop text := trim(coalesce(p_input->>'shopName', ''));
  new_id text;
  activity_id text;
  assigned text[];
  fresh text;
  created public.market_users%rowtype;
begin
  perform public.market_seed();
  if char_length(person_name) < 2 then
    return jsonb_build_object('ok', false, 'error', 'name');
  end if;
  if person_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return jsonb_build_object('ok', false, 'error', 'email');
  end if;
  if char_length(person_password) < 4 then
    return jsonb_build_object('ok', false, 'error', 'password');
  end if;
  if exists (select 1 from public.market_users where email = person_email) then
    return jsonb_build_object('ok', false, 'error', 'taken');
  end if;
  if p_input->>'role' = 'admin' then
    return jsonb_build_object('ok', false, 'error', 'admin_only');
  end if;
  if person_role = 'seller' and char_length(shop) < 2 then
    return jsonb_build_object('ok', false, 'error', 'shop');
  end if;
  new_id := 'u_' || substr(encode(gen_random_bytes(9), 'hex'), 1, 12);
  assigned := case when person_role = 'seller' then array['buyer', 'seller'] else array['buyer'] end;
  insert into public.market_users (id, name, email, password_hash, roles, shop_name, seller_status, suspended, address, cart, created_at)
  values (
    new_id,
    person_name,
    person_email,
    crypt(person_password, gen_salt('bf')),
    assigned,
    case when person_role = 'seller' then shop else null end,
    case when person_role = 'seller' then 'pending' else null end,
    false,
    null,
    '[]'::jsonb,
    now()
  )
  returning * into created;
  if person_role = 'seller' then
    update public.market_meta
      set activity_seq = activity_seq + 1
      where id = 'main'
      returning 'a' || activity_seq into activity_id;
    insert into public.market_activity (id, at, type, actor_name, message)
    values (
      activity_id,
      now(),
      'seller_applied',
      person_name,
      jsonb_build_object(
        'en', person_name || ' applied to sell as ' || shop || ' and is waiting for approval.',
        'zh', person_name || ' 以 ' || shop || ' 申請成為賣家，等待核准。'
      )
    );
  end if;
  fresh := encode(gen_random_bytes(24), 'hex');
  insert into public.market_sessions (token, user_id) values (fresh, created.id);
  return jsonb_build_object(
    'ok', true,
    'token', fresh,
    'activeRole', person_role,
    'user', public.market_public_user(created, created.id, false)
  );
end;
$$;

create or replace function public.market_logout(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.market_sessions where token = p_token;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.market_save(p_token text, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid text;
  is_admin boolean;
  rec jsonb;
  old_user public.market_users%rowtype;
  old_product public.market_products%rowtype;
  old_order public.market_orders%rowtype;
  next_roles text[];
  seller_ok boolean;
begin
  select u.id, ('admin' = any(u.roles))
    into uid, is_admin
  from public.market_sessions s
  join public.market_users u on u.id = s.user_id
  where s.token = p_token
    and u.suspended = false;
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'sign_in');
  end if;

  for rec in select value from jsonb_array_elements(coalesce(p_state->'users', '[]'::jsonb)) as value
  loop
    select * into old_user from public.market_users where id = rec->>'id';
    if not found then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
    next_roles := public.market_roles(rec->'roles');
    if is_admin and 'admin' = any(next_roles) and not ('admin' = any(old_user.roles)) then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
    if old_user.platform_owner and uid is distinct from old_user.id and (
      old_user.roles is distinct from next_roles
      or old_user.suspended is distinct from coalesce((rec->>'suspended')::boolean, false)
      or old_user.email is distinct from lower(rec->>'email')
      or old_user.name is distinct from rec->>'name'
    ) then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
    if not is_admin and (
      old_user.roles is distinct from next_roles
      or old_user.seller_status is distinct from nullif(rec->>'sellerStatus', '')
      or old_user.suspended is distinct from coalesce((rec->>'suspended')::boolean, false)
      or old_user.email is distinct from lower(rec->>'email')
      or old_user.shop_name is distinct from nullif(rec->>'shopName', '')
      or old_user.name is distinct from rec->>'name'
    ) then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
  end loop;

  for rec in select value from jsonb_array_elements(coalesce(p_state->'products', '[]'::jsonb)) as value
  loop
    select * into old_product from public.market_products where id = rec->>'id';
    if not found then
      if rec->>'sellerId' is distinct from uid and not is_admin then
        return jsonb_build_object('ok', false, 'error', 'seller_only');
      end if;
      select (seller_status = 'approved' and 'seller' = any(roles)) or is_admin
        into seller_ok
      from public.market_users
      where id = rec->>'sellerId';
      if not coalesce(seller_ok, false) then
        return jsonb_build_object('ok', false, 'error', 'not_approved');
      end if;
    elsif not is_admin and old_product.seller_id is distinct from uid then
      if old_product.seller_id is distinct from rec->>'sellerId'
         or old_product.price is distinct from (rec->>'price')::numeric
         or old_product.name is distinct from rec->'name'
         or old_product.description is distinct from rec->'description'
         or old_product.image is distinct from coalesce(rec->>'image', '')
         or old_product.category is distinct from rec->>'category'
         or old_product.listing_status is distinct from rec->>'listingStatus'
         or (rec->>'quantity')::integer > old_product.quantity
         or coalesce((rec->>'purchased')::integer, 0) < old_product.purchased
         or (old_product.quantity - (rec->>'quantity')::integer)
            is distinct from (coalesce((rec->>'purchased')::integer, 0) - old_product.purchased)
      then
        return jsonb_build_object('ok', false, 'error', 'locked');
      end if;
    end if;
  end loop;

  for rec in select value from jsonb_array_elements(coalesce(p_state->'orders', '[]'::jsonb)) as value
  loop
    select * into old_order from public.market_orders where id = rec->>'id';
    if not found then
      if rec->>'buyerId' is distinct from uid and not is_admin then
        return jsonb_build_object('ok', false, 'error', 'buyer_only');
      end if;
      if rec->>'status' is distinct from 'waiting_payment' and not is_admin then
        return jsonb_build_object('ok', false, 'error', 'step');
      end if;
    elsif not is_admin and rec->>'buyerId' is distinct from uid and rec->>'sellerId' is distinct from uid then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
  end loop;

  for rec in select value from jsonb_array_elements(coalesce(p_state->'users', '[]'::jsonb)) as value
  loop
    update public.market_users
      set
        name = case when is_admin and not platform_owner then rec->>'name' else name end,
        roles = case when is_admin and not platform_owner then public.market_roles(rec->'roles') else roles end,
        shop_name = case when is_admin and not platform_owner then nullif(rec->>'shopName', '') else shop_name end,
        seller_status = case when is_admin and not platform_owner then nullif(rec->>'sellerStatus', '') else seller_status end,
        suspended = case when is_admin and not platform_owner then coalesce((rec->>'suspended')::boolean, false) else suspended end,
        address = case when id = uid then rec->'address' else address end,
        cart = case when id = uid then coalesce(rec->'cart', '[]'::jsonb) else cart end
      where id = rec->>'id';
  end loop;

  insert into public.market_products (id, seller_id, name, category, description, price, quantity, purchased, image, listing_status, updated_at)
  select
    item->>'id',
    item->>'sellerId',
    item->'name',
    item->>'category',
    item->'description',
    (item->>'price')::numeric,
    (item->>'quantity')::integer,
    coalesce((item->>'purchased')::integer, 0),
    coalesce(item->>'image', ''),
    item->>'listingStatus',
    coalesce((item->>'updatedAt')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_state->'products', '[]'::jsonb)) as item
  on conflict (id) do update set
    seller_id = excluded.seller_id,
    name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    price = excluded.price,
    quantity = excluded.quantity,
    purchased = excluded.purchased,
    image = excluded.image,
    listing_status = excluded.listing_status,
    updated_at = excluded.updated_at;

  insert into public.market_orders (id, buyer_id, seller_id, items, total, status, payment_status, prepared, shipment_note, address, created_at, updated_at, completed_at, timeline)
  select
    item->>'id',
    item->>'buyerId',
    item->>'sellerId',
    item->'items',
    (item->>'total')::numeric,
    item->>'status',
    item->>'paymentStatus',
    coalesce((item->>'prepared')::boolean, false),
    coalesce(item->>'shipmentNote', ''),
    coalesce(item->'address', '{}'::jsonb),
    coalesce((item->>'createdAt')::timestamptz, now()),
    coalesce((item->>'updatedAt')::timestamptz, now()),
    nullif(item->>'completedAt', '')::timestamptz,
    coalesce(item->'timeline', '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_state->'orders', '[]'::jsonb)) as item
  on conflict (id) do update set
    items = excluded.items,
    total = excluded.total,
    status = excluded.status,
    payment_status = excluded.payment_status,
    prepared = excluded.prepared,
    shipment_note = excluded.shipment_note,
    address = excluded.address,
    updated_at = excluded.updated_at,
    completed_at = excluded.completed_at,
    timeline = excluded.timeline;

  insert into public.market_activity (id, at, type, actor_name, order_id, message)
  select
    item->>'id',
    coalesce((item->>'at')::timestamptz, now()),
    coalesce(item->>'type', 'note'),
    coalesce(item->>'actorName', ''),
    nullif(item->>'orderId', ''),
    coalesce(item->'message', '{}'::jsonb)
  from jsonb_array_elements(coalesce(p_state->'activity', '[]'::jsonb)) as item
  on conflict (id) do nothing;

  update public.market_meta
    set
      order_seq = greatest(order_seq, coalesce((p_state->>'orderSeq')::integer, order_seq)),
      product_seq = greatest(product_seq, coalesce((p_state->>'productSeq')::integer, product_seq)),
      activity_seq = greatest(activity_seq, coalesce((p_state->>'activitySeq')::integer, activity_seq))
    where id = 'main';

  return jsonb_build_object('ok', true);
exception
  when others then
    return jsonb_build_object('ok', false, 'error', 'locked');
end;
$$;

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
begin
  select u.id into uid
  from public.market_sessions s
  join public.market_users u on u.id = s.user_id
  where s.token = p_token
    and 'admin' = any(u.roles)
    and u.suspended = false;
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'admin_only');
  end if;
  select state into payload from public.market_bootstrap where id = 'seed';
  if payload is null then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;
  perform public.market_replace(payload, 'immba-demo');
  fresh := encode(gen_random_bytes(24), 'hex');
  insert into public.market_sessions (token, user_id) values (fresh, 'u_wei');
  return jsonb_build_object('ok', true, 'token', fresh);
end;
$$;

revoke all on function public.market_roles(jsonb) from public, anon, authenticated;
revoke all on function public.market_public_user(public.market_users, text, boolean) from public, anon, authenticated;
revoke all on function public.market_replace(jsonb, text) from public, anon, authenticated;
revoke all on function public.market_seed() from public, anon, authenticated;

grant execute on function public.market_load(text) to anon, authenticated;
grant execute on function public.market_login(text, text) to anon, authenticated;
grant execute on function public.market_register(jsonb) to anon, authenticated;
grant execute on function public.market_logout(text) to anon, authenticated;
create or replace function public.market_install(p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if exists (select 1 from public.market_meta where id = 'main') then
    return jsonb_build_object('ok', true, 'skipped', true);
  end if;
  if p_state is null or jsonb_typeof(p_state->'users') <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;
  insert into public.market_bootstrap (id, state)
  values ('seed', p_state)
  on conflict (id) do update set state = excluded.state;
  perform public.market_replace(p_state, 'immba-demo');
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.market_save(text, jsonb) to anon, authenticated;
grant execute on function public.market_reset(text) to anon, authenticated;
grant execute on function public.market_install(jsonb) to anon, authenticated;

create or replace function public.market_enter_super()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  auth_id uuid := auth.uid();
  profile public.profiles%rowtype;
  market_id text;
  person_name text;
  fresh text;
  created public.market_users%rowtype;
begin
  if auth_id is null then
    return jsonb_build_object('ok', false, 'error', 'sign_in');
  end if;
  select * into profile
  from public.profiles
  where id = auth_id
    and role = 'super_admin';
  if profile.id is null then
    return jsonb_build_object('ok', false, 'error', 'admin_only');
  end if;

  person_name := nullif(trim(coalesce(profile.full_name, '')), '');
  if person_name is null then
    person_name := 'Super admin';
  end if;

  select id into market_id
  from public.market_users
  where email = lower(profile.email);
  if market_id is null then
    market_id := 'u_' || replace(auth_id::text, '-', '');
  end if;

  insert into public.market_users (
    id, name, email, password_hash, roles, shop_name, seller_status, suspended, platform_owner, address, cart
  )
  values (
    market_id,
    person_name,
    lower(profile.email),
    crypt(gen_random_uuid()::text, gen_salt('bf')),
    array['admin'],
    null,
    null,
    false,
    true,
    null,
    '[]'::jsonb
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    roles = array['admin'],
    suspended = false,
    platform_owner = true
  returning * into created;

  fresh := encode(gen_random_bytes(24), 'hex');
  insert into public.market_sessions (token, user_id) values (fresh, created.id);
  return jsonb_build_object(
    'ok', true,
    'token', fresh,
    'activeRole', 'admin',
    'user', public.market_public_user(created, created.id, true)
  );
end;
$$;

grant execute on function public.market_enter_super() to anon, authenticated;

create or replace function public.market_keep_platform_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.platform_owner then
    new.roles := old.roles;
    new.email := old.email;
    new.name := old.name;
    new.suspended := old.suspended;
    new.seller_status := old.seller_status;
    new.shop_name := old.shop_name;
    new.platform_owner := true;
    new.password_hash := old.password_hash;
  end if;
  return new;
end;
$$;

drop trigger if exists market_keep_platform_owner on public.market_users;
create trigger market_keep_platform_owner
before update on public.market_users
for each row execute function public.market_keep_platform_owner();
