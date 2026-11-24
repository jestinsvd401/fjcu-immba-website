-- A removed account stays removed if a later save arrives.
-- Their session cannot write, new listings are refused, and existing listings stay off the floor.

do $migration$
declare
  def text;
begin
  def := pg_get_functiondef('public.market_save(text, jsonb)'::regprocedure);

  if position(E'where s.token = p_token\n    and u.suspended = false;' in def) = 0 then
    raise exception 'market_save session check was not found';
  end if;
  def := replace(
    def,
    E'where s.token = p_token\n    and u.suspended = false;',
    E'where s.token = p_token\n    and u.suspended = false\n    and u.removed_at is null;'
  );

  if position('listing_status = excluded.listing_status,' in def) = 0 then
    raise exception 'market_save listing assignment was not found';
  end if;
  def := replace(
    def,
    'listing_status = excluded.listing_status,',
    'listing_status = case when exists (select 1 from public.market_users removed_seller where removed_seller.id = public.market_products.seller_id and removed_seller.removed_at is not null) then ''removed'' else excluded.listing_status end,'
  );

  if position('select (seller_status = ''approved'' and ''seller'' = any(roles)) or is_admin' in def) = 0 then
    raise exception 'market_save seller check was not found';
  end if;
  def := replace(
    def,
    'select (seller_status = ''approved'' and ''seller'' = any(roles)) or is_admin',
    'select ((seller_status = ''approved'' and ''seller'' = any(roles)) or is_admin) and removed_at is null'
  );

  execute def;
end
$migration$;
