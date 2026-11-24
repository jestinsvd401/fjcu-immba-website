-- A sale moves one step at a time:
-- waiting_payment -> payment_confirmed (seller confirms the payment)
-- payment_confirmed or legacy ready_to_ship -> shipped (seller confirms shipping)
-- shipped -> completed (buyer confirms receipt)
-- The seller cannot close the sale, and the buyer cannot confirm receipt before shipping.

do $migration$
declare
  def text;
  old_rule text := $old$(old_order.status = 'waiting_payment' and rec->>'status' in ('payment_confirmed', 'shipped') and rec->>'paymentStatus' = 'received' and rec->>'sellerId' = uid)
        or (old_order.status = 'payment_confirmed' and rec->>'status' in ('ready_to_ship', 'shipped') and rec->>'sellerId' = uid)
        or (old_order.status = 'ready_to_ship' and rec->>'status' = 'shipped' and rec->>'sellerId' = uid)
        or (old_order.status in ('ready_to_ship', 'shipped') and rec->>'status' = 'completed' and (rec->>'buyerId' = uid or rec->>'sellerId' = uid))$old$;
  new_rule text := $new$(old_order.status = 'waiting_payment' and rec->>'status' = 'payment_confirmed' and rec->>'paymentStatus' = 'received' and rec->>'sellerId' = uid)
        or (old_order.status in ('payment_confirmed', 'ready_to_ship') and rec->>'status' = 'shipped' and rec->>'sellerId' = uid)
        or (old_order.status = 'shipped' and rec->>'status' = 'completed' and rec->>'buyerId' = uid)$new$;
begin
  def := pg_get_functiondef('public.market_save(text, jsonb)'::regprocedure);
  if position(old_rule in def) = 0 then
    raise exception 'market_save transition block was not found';
  end if;
  execute replace(def, old_rule, new_rule);
end
$migration$;
