-- ============================================
-- Safe Stock Decrement with Race-Condition Guard
-- ============================================
-- Replaces the old decrement_stock function with one that FAILS
-- (returns false) if there isn't enough stock, using a
-- WHERE stock >= qty guard so concurrent transactions can't
-- oversell.
--
-- Also adds a transactional batch variant used by the order API.

-- 1. Single-item safe decrement
-- Returns TRUE if the row was updated, FALSE if insufficient stock.
CREATE OR REPLACE FUNCTION decrement_stock_safe(p_id UUID, qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE products
  SET stock = stock - qty
  WHERE id = p_id
    AND stock >= qty;          -- atomic guard: row only matches if enough stock

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- 2. Batch safe decrement (all-or-nothing in a single transaction)
-- Accepts a JSONB array of objects: [{ "id": "<uuid>", "qty": <int> }, …]
-- Returns a JSONB object: { "success": true } or
-- { "success": false, "failed_product_id": "<uuid>", "available": <int> }
CREATE OR REPLACE FUNCTION decrement_stock_batch_safe(updates JSONB)
RETURNS JSONB AS $$
DECLARE
  item        JSONB;
  p_id        UUID;
  p_qty       INTEGER;
  rows_aff    INTEGER;
  avail       INTEGER;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    p_id  := (item ->> 'id')::UUID;
    p_qty := (item ->> 'qty')::INTEGER;

    UPDATE products
    SET stock = stock - p_qty
    WHERE id = p_id
      AND stock >= p_qty;

    GET DIAGNOSTICS rows_aff = ROW_COUNT;

    IF rows_aff = 0 THEN
      -- Look up actual available stock for the error message
      SELECT stock INTO avail FROM products WHERE id = p_id;
      -- Rollback everything done so far in this function
      RAISE EXCEPTION 'insufficient_stock:%:%', p_id, COALESCE(avail, 0);
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    -- Parse our custom exception format
    IF SQLERRM LIKE 'insufficient_stock:%' THEN
      DECLARE
        parts TEXT[];
      BEGIN
        parts := string_to_array(SQLERRM, ':');
        RETURN jsonb_build_object(
          'success', false,
          'failed_product_id', parts[2],
          'available', parts[3]::INTEGER
        );
      END;
    END IF;
    -- Re-raise unexpected errors
    RAISE;
END;
$$ LANGUAGE plpgsql;
