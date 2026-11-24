-- The floor lists Jordan first, then sellers by the time an admin approved them.
-- Newer approvals come first. A seller's listings stay together.

alter table public.market_users
  add column if not exists seller_approved_at timestamptz;

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
    'sellerApprovedAt', u.seller_approved_at,
    'suspended', u.suspended,
    'removedAt', u.removed_at,
    'platformOwner', u.platform_owner,
    'address', case when is_admin or u.id = uid then u.address else null end,
    'cart', case when is_admin or u.id = uid then u.cart else '[]'::jsonb end,
    'createdAt', u.created_at
  );
$$;

update public.market_users u
  set seller_approved_at = sub.approved_at
  from (
    select substring(message->>'en' from 'approved (.+)\.$') as shop, max(at) as approved_at
    from public.market_activity
    where type = 'seller_approved'
    group by 1
  ) sub
  where u.seller_status = 'approved'
    and u.shop_name = sub.shop
    and sub.shop is not null;

update public.market_users
  set seller_approved_at = created_at
  where seller_status = 'approved'
    and seller_approved_at is null;

do $migration$
declare
  def text;
begin
  def := pg_get_functiondef('public.market_save(text, jsonb)'::regprocedure);
  if position('seller_status = case when is_admin and not platform_owner then nullif(rec->>''sellerStatus'', '''') else seller_status end,' in def) = 0 then
    raise exception 'market_save seller status assignment was not found';
  end if;
  if position('seller_approved_at = case' in def) = 0 then
    def := replace(
      def,
      'seller_status = case when is_admin and not platform_owner then nullif(rec->>''sellerStatus'', '''') else seller_status end,',
      'seller_status = case when is_admin and not platform_owner then nullif(rec->>''sellerStatus'', '''') else seller_status end,' || E'\n' ||
      '        seller_approved_at = case when is_admin and not platform_owner and nullif(rec->>''sellerStatus'', '''') = ''approved'' and seller_status is distinct from ''approved'' then now() else seller_approved_at end,'
    );
  end if;
  execute def;

  def := pg_get_functiondef('public.market_load(text)'::regprocedure);
  if position('order by case when p.seller_id = (select id from public.market_users where lower(email) = ''jestinsvd@outlook.com'') then 0 else 1 end, p.updated_at desc' in def) = 0 then
    raise exception 'market_load product order was not found';
  end if;
  def := replace(
    def,
    'order by case when p.seller_id = (select id from public.market_users where lower(email) = ''jestinsvd@outlook.com'') then 0 else 1 end, p.updated_at desc',
    'order by case when exists (select 1 from public.market_users jordan where jordan.id = p.seller_id and (lower(jordan.email) = ''jestinsvd@outlook.com'' or lower(jordan.name) = ''jordan'')) then 0 else 1 end, coalesce((select approved.seller_approved_at from public.market_users approved where approved.id = p.seller_id), ''-infinity''::timestamptz) desc, p.seller_id, p.updated_at desc'
  );
  execute def;
end
$migration$;
