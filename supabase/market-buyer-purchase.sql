-- A buyer purchase saves the cart and the order without re-uploading every listing photo.
-- Photos the buyer does not own stay as they are stored.

do $migration$
declare
  def text;
begin
  def := pg_get_functiondef('public.market_save(text, jsonb)'::regprocedure);
  if position('or p.image is distinct from coalesce(item->>''image'', '''')' in def) > 0 then
    def := replace(
      def,
      'or p.image is distinct from coalesce(item->>''image'', '''')',
      'or (item ? ''image'' and p.image is distinct from coalesce(item->>''image'', ''''))'
    );
  end if;
  if position('or old_product.image is distinct from coalesce(rec->>''image'', '''')' in def) > 0 then
    def := replace(
      def,
      'or old_product.image is distinct from coalesce(rec->>''image'', '''')',
      'or (rec ? ''image'' and old_product.image is distinct from coalesce(rec->>''image'', ''''))'
    );
  end if;
  if position('image = excluded.image,' in def) = 0 then
    raise exception 'market_save image assignment was not found';
  end if;
  if position('image = case when is_admin or excluded.seller_id = uid then excluded.image else public.market_products.image end,' in def) = 0 then
    def := replace(
      def,
      'image = excluded.image,',
      'image = case when is_admin or excluded.seller_id = uid then excluded.image else public.market_products.image end,'
    );
  end if;
  execute def;
end
$migration$;
