-- Administrators can export every buyer and seller transaction.
-- The function refuses any session that is not a platform admin.

create or replace function public.market_csv_cell(p_value text)
returns text
language sql
immutable
as $$
  select case
    when p_value is null then ''
    when p_value ~ '[",\n\r]' then '"' || replace(p_value, '"', '""') || '"'
    else p_value
  end;
$$;

revoke all on function public.market_csv_cell(text) from public, anon, authenticated;

create or replace function public.market_admin_csv(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean := false;
  body text := 'Order ID,Buyer,Buyer email,Seller,Seller shop,Seller email,Products,Total amount,Payment status,Transaction status,Order date,Completed at' || E'\n';
  rec record;
  products text;
  row_count integer := 0;
begin
  select ('admin' = any(u.roles))
    into is_admin
  from public.market_sessions s
  join public.market_users u on u.id = s.user_id
  where s.token = p_token
    and u.suspended = false;

  if not coalesce(is_admin, false) then
    return jsonb_build_object('ok', false, 'error', 'admin_only');
  end if;

  for rec in
    select
      o.id,
      b.name as buyer_name,
      b.email as buyer_email,
      s.name as seller_name,
      coalesce(s.shop_name, '') as shop_name,
      s.email as seller_email,
      o.items,
      o.total,
      o.payment_status,
      o.status,
      o.created_at,
      o.completed_at
    from public.market_orders o
    left join public.market_users b on b.id = o.buyer_id
    left join public.market_users s on s.id = o.seller_id
    order by o.created_at desc
  loop
    select coalesce(string_agg(
      coalesce(item->'name'->>'en', item->>'name', '') || ' x ' || coalesce(item->>'quantity', '1'),
      '; '
    ), '')
      into products
    from jsonb_array_elements(coalesce(rec.items, '[]'::jsonb)) as item;

    body := body || concat_ws(',',
      public.market_csv_cell(rec.id),
      public.market_csv_cell(rec.buyer_name),
      public.market_csv_cell(rec.buyer_email),
      public.market_csv_cell(rec.seller_name),
      public.market_csv_cell(rec.shop_name),
      public.market_csv_cell(rec.seller_email),
      public.market_csv_cell(products),
      public.market_csv_cell(to_char(rec.total, 'FM999999990.00')),
      public.market_csv_cell(rec.payment_status),
      public.market_csv_cell(rec.status),
      public.market_csv_cell(to_char(rec.created_at at time zone 'Asia/Taipei', 'YYYY-MM-DD HH24:MI:SS')),
      public.market_csv_cell(case when rec.completed_at is null then '' else to_char(rec.completed_at at time zone 'Asia/Taipei', 'YYYY-MM-DD HH24:MI:SS') end)
    ) || E'\n';
    row_count := row_count + 1;
  end loop;

  return jsonb_build_object('ok', true, 'csv', body, 'rows', row_count);
end;
$$;

revoke all on function public.market_admin_csv(text) from public;
grant execute on function public.market_admin_csv(text) to anon, authenticated;
