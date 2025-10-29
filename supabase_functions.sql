-- ============================================
-- SUPABASE RPC FUNCTIONS FOR ANALYTICS
-- ============================================
-- Run these functions in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run
-- ============================================

-- 1. Get Business Summary Statistics
-- Returns: total sales, purchases, unpaid amounts, inventory count, profit
CREATE OR REPLACE FUNCTION get_business_summary(business_id_arg INT)
RETURNS JSON AS $$
DECLARE
  total_sales_amount NUMERIC;
  total_purchases_amount NUMERIC;
  unpaid_sales_amount NUMERIC;
  unpaid_purchases_amount NUMERIC;
  inventory_items_count INT;
  total_sold_items INT;
  total_purchased_items INT;
  net_profit_amount NUMERIC;
  result JSON;
BEGIN
  -- Calculate total sales
  SELECT COALESCE(SUM(line_total), 0) 
  INTO total_sales_amount
  FROM sales 
  WHERE business_id = business_id_arg 
    AND is_deleted = false
    AND reversal = false;

  -- Calculate total purchases
  SELECT COALESCE(SUM(line_total), 0) 
  INTO total_purchases_amount
  FROM purchases 
  WHERE business_id = business_id_arg 
    AND is_deleted = false
    AND reversal = false;

  -- Calculate unpaid sales (receivables)
  SELECT COALESCE(SUM(unpaid_amount), 0) 
  INTO unpaid_sales_amount
  FROM sales 
  WHERE business_id = business_id_arg 
    AND is_deleted = false
    AND reversal = false;

  -- Calculate unpaid purchases (payables)
  SELECT COALESCE(SUM(unpaid_amount), 0) 
  INTO unpaid_purchases_amount
  FROM purchases 
  WHERE business_id = business_id_arg 
    AND is_deleted = false
    AND reversal = false;

  -- Count inventory items
  SELECT COUNT(*) 
  INTO inventory_items_count
  FROM items 
  WHERE business_id = business_id_arg 
    AND is_deleted = false;

  -- Calculate total items sold
  SELECT COALESCE(SUM(number_of_items), 0) 
  INTO total_sold_items
  FROM sales 
  WHERE business_id = business_id_arg 
    AND is_deleted = false
    AND reversal = false;

  -- Calculate total items purchased
  SELECT COALESCE(SUM(number_of_items), 0) 
  INTO total_purchased_items
  FROM purchases 
  WHERE business_id = business_id_arg 
    AND is_deleted = false
    AND reversal = false;

  -- Calculate net profit (sales - purchases)
  net_profit_amount := total_sales_amount - total_purchases_amount;

  -- Build JSON result
  SELECT json_build_object(
    'total_sales', total_sales_amount,
    'total_purchases', total_purchases_amount,
    'unpaid_sales', unpaid_sales_amount,
    'unpaid_purchases', unpaid_purchases_amount,
    'inventory_count', inventory_items_count,
    'net_profit', net_profit_amount,
    'total_items_sold', total_sold_items,
    'total_items_purchased', total_purchased_items
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;


-- 2. Get Weekly Revenue Data (Last 7 Days)
-- Returns: day name and total revenue for each day
CREATE OR REPLACE FUNCTION get_weekly_revenue(business_id_arg INT)
RETURNS TABLE(day_name TEXT, total_revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  WITH last_7_days AS (
    SELECT 
      generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::INTERVAL
      )::DATE AS day
  )
  SELECT 
    TO_CHAR(d.day, 'Dy') AS day_name,
    COALESCE(SUM(s.line_total), 0) AS total_revenue
  FROM last_7_days d
  LEFT JOIN sales s ON 
    DATE(s.created_at) = d.day 
    AND s.business_id = business_id_arg
    AND s.is_deleted = false
    AND s.reversal = false
  GROUP BY d.day, TO_CHAR(d.day, 'Dy')
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql;


-- 3. Get Weekly Orders/Transactions Count (Last 7 Days)
-- Returns: day name and count of orders for each day
CREATE OR REPLACE FUNCTION get_weekly_orders(business_id_arg INT)
RETURNS TABLE(day_name TEXT, order_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH last_7_days AS (
    SELECT 
      generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::INTERVAL
      )::DATE AS day
  )
  SELECT 
    TO_CHAR(d.day, 'Dy') AS day_name,
    COUNT(s.id) AS order_count
  FROM last_7_days d
  LEFT JOIN sales s ON 
    DATE(s.created_at) = d.day 
    AND s.business_id = business_id_arg
    AND s.is_deleted = false
    AND s.reversal = false
  GROUP BY d.day, TO_CHAR(d.day, 'Dy')
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- USAGE EXAMPLES (for testing)
-- ============================================
-- Test business summary:
-- SELECT get_business_summary(1);

-- Test weekly revenue:
-- SELECT * FROM get_weekly_revenue(1);

-- Test weekly orders:
-- SELECT * FROM get_weekly_orders(1);
