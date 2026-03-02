-- ============================================
-- Safe Stock Increment (for order cancellation / deletion)
-- ============================================
-- Atomically increments product stock. Used when restoring
-- inventory after order cancellation or admin deletion.
-- Unlike the old read-then-write pattern, this is safe under
-- concurrent requests.

-- Single-item safe increment
CREATE OR REPLACE FUNCTION increment_stock_safe(p_id UUID, qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE products
  SET stock = stock + qty
  WHERE id = p_id;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;
