-- SQL-based Tests for Growth Classification Logic
-- These tests use the actual SQL view logic from the application

-- Create test database and tables (matches script.js exactly)
DROP TABLE IF EXISTS monthly_data;
CREATE TABLE monthly_data (
    month_id INTEGER PRIMARY KEY,
    month_label TEXT,
    communicated_l28 INTEGER DEFAULT 0,
    date_value TEXT
);

-- Insert month data for 2021-2024 (48 months)
-- This matches the generateMonthLabels() function from script.js
WITH RECURSIVE months(month_id, year, month, month_name) AS (
  SELECT 1, 2021, 1, 'Jan'
  UNION ALL
  SELECT 
    month_id + 1,
    CASE WHEN month = 12 THEN year + 1 ELSE year END,
    CASE WHEN month = 12 THEN 1 ELSE month + 1 END,
    CASE (CASE WHEN month = 12 THEN 1 ELSE month + 1 END)
      WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar' WHEN 4 THEN 'Apr'
      WHEN 5 THEN 'May' WHEN 6 THEN 'Jun' WHEN 7 THEN 'Jul' WHEN 8 THEN 'Aug' 
      WHEN 9 THEN 'Sep' WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dec'
    END
  FROM months WHERE month_id < 48
)
INSERT INTO monthly_data (month_id, month_label, communicated_l28, date_value)
SELECT 
    month_id, 
    month_name || ' ' || substr(year, 3, 2) as month_label,
    0 as communicated_l28,
    date(year || '-' || printf('%02d', month) || '-01') as date_value
FROM months;

-- Create the exact growth_states view from script.js
DROP VIEW IF EXISTS growth_states;
CREATE VIEW growth_states AS
WITH monthly_with_history AS (
    SELECT 
        m.month_id,
        m.month_label,
        m.communicated_l28,
        m.date_value,
        LAG(m.communicated_l28, 12) OVER (ORDER BY m.month_id) as prev_year_same_month,
        SUM(m.communicated_l28) OVER (
            ORDER BY m.month_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
        ) as total_activations_before,
        SUM(CASE WHEN m2.month_id < (m.month_id - 12) THEN m2.communicated_l28 ELSE 0 END) as activations_before_prev_year,
        0 as is_current_month
    FROM monthly_data m
    LEFT JOIN monthly_data m2 ON 1=1
    GROUP BY m.month_id, m.month_label, m.communicated_l28, m.date_value
)
SELECT 
    month_id,
    month_label,
    communicated_l28,
    date_value,
    is_current_month,
    prev_year_same_month,
    total_activations_before,
    activations_before_prev_year,
    CASE 
        WHEN communicated_l28 = 1 AND prev_year_same_month = 1 THEN 'Returning'
        WHEN communicated_l28 = 1 AND prev_year_same_month = 0 AND activations_before_prev_year > 0 THEN 'Resurrected'
        WHEN communicated_l28 = 1 AND (prev_year_same_month IS NULL OR prev_year_same_month = 0) THEN 'New'
        WHEN communicated_l28 = 0 AND prev_year_same_month = 1 THEN 'Churned'
        WHEN (total_activations_before IS NULL OR total_activations_before = 0) AND communicated_l28 = 0 THEN 'Never_activated'
        WHEN communicated_l28 = 0 AND total_activations_before > 0 AND month_id <= 24 THEN 'Dormant'
        ELSE 'At_Risk'
    END as state
FROM monthly_with_history
ORDER BY month_id;

-- ===========================================
-- TEST 1: Consecutive Month Scenario (The Bug)
-- ===========================================
.print "=== TEST 1: Consecutive Month Scenario ==="
.print "Testing Jan 22 (month 13) → Feb 22 (month 14) consecutive activations"

-- Reset all data
UPDATE monthly_data SET communicated_l28 = 0;

-- Set up scenario: Jan 22 active, Feb 22 active
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 13; -- Jan 22
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 14; -- Feb 22

-- Test the results
SELECT 
    month_id,
    month_label,
    communicated_l28,
    prev_year_same_month,
    total_activations_before,
    activations_before_prev_year,
    state,
    CASE 
        WHEN month_id = 13 AND state = 'New' THEN '✓ PASS'
        WHEN month_id = 14 AND state = 'New' THEN '✓ PASS'
        ELSE '✗ FAIL - Expected New, got ' || state
    END as test_result
FROM growth_states 
WHERE month_id IN (13, 14);

-- ===========================================
-- TEST 2: Resurrected Scenario  
-- ===========================================
.print ""
.print "=== TEST 2: Resurrected Scenario ==="
.print "Testing: L28 now + not L28 same month last year + L28 prior to same month last year"

-- Reset all data
UPDATE monthly_data SET communicated_l28 = 0;

-- Set up scenario: Active in Jan 21, NOT active Jan 22, Active Jan 23 = Resurrected
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 1;  -- Jan 21 (prior to same month last year)
UPDATE monthly_data SET communicated_l28 = 0 WHERE month_id = 13; -- Jan 22 (same month last year - inactive)
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 25; -- Jan 23 (now - active)

-- Test the results
SELECT 
    month_id,
    month_label,
    communicated_l28,
    prev_year_same_month,
    total_activations_before,
    activations_before_prev_year,
    state,
    CASE 
        WHEN month_id = 25 AND state = 'Resurrected' THEN '✓ PASS - Correctly identified Resurrected'
        WHEN month_id = 25 THEN '✗ FAIL - Expected Resurrected, got ' || state
        ELSE 'Other'
    END as test_result
FROM growth_states 
WHERE month_id = 25;

-- ===========================================
-- TEST 3: All Growth States
-- ===========================================
.print ""
.print "=== TEST 2: All Growth States ==="

-- Reset all data
UPDATE monthly_data SET communicated_l28 = 0;

-- New: First time activation
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 15; -- Mar 22

-- Returning: Active this month and same month last year
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 3;  -- Mar 21
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 15; -- Mar 22

-- Resurrected: Active now, not last year, but has history
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 10; -- Oct 21
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 25; -- Jan 23 (not Jan 22)

-- Churned: Not active now, but was active same month last year  
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 4;  -- Apr 21
UPDATE monthly_data SET communicated_l28 = 0 WHERE month_id = 16; -- Apr 22

-- Never_activated: Never been active
-- (Default state for most months)

-- Dormant: Not active now, has history, month <= 24
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 8;  -- Aug 21
UPDATE monthly_data SET communicated_l28 = 0 WHERE month_id = 20; -- Aug 22

-- At_Risk: Not active now, has history, month > 24
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id = 12; -- Dec 21  
UPDATE monthly_data SET communicated_l28 = 0 WHERE month_id = 30; -- Jun 23

-- Test results for key scenarios
SELECT 
    month_id,
    month_label,
    state,
    CASE month_id
        WHEN 15 THEN CASE WHEN state = 'New' OR state = 'Returning' THEN '✓ Expected New or Returning' ELSE '✗ FAIL' END
        WHEN 25 THEN CASE WHEN state = 'Resurrected' THEN '✓ Expected Resurrected' ELSE '✗ FAIL' END  
        WHEN 16 THEN CASE WHEN state = 'Churned' THEN '✓ Expected Churned' ELSE '✗ FAIL' END
        WHEN 1 THEN CASE WHEN state = 'Never_activated' THEN '✓ Expected Never_activated' ELSE '✗ FAIL' END
        WHEN 20 THEN CASE WHEN state = 'Dormant' THEN '✓ Expected Dormant' ELSE '✗ FAIL' END
        WHEN 30 THEN CASE WHEN state = 'At_Risk' THEN '✓ Expected At_Risk' ELSE '✗ FAIL' END
        ELSE 'Other'
    END as test_result
FROM growth_states 
WHERE month_id IN (15, 25, 16, 1, 20, 30)
ORDER BY month_id;

-- ===========================================
-- TEST 3: Window Function Verification
-- ===========================================
.print ""
.print "=== TEST 3: Window Function Behavior ==="
.print "Verifying LAG and SUM OVER window functions work correctly"

-- Reset and set up a clear pattern
UPDATE monthly_data SET communicated_l28 = 0;
UPDATE monthly_data SET communicated_l28 = 1 WHERE month_id IN (1, 13, 14, 25, 26); -- Jan 21, Jan 22, Feb 22, Jan 23, Feb 23

-- Show window function results
SELECT 
    month_id,
    month_label,
    communicated_l28,
    prev_year_same_month,
    total_activations_before,
    state,
    -- Manual verification
    CASE 
        WHEN month_id = 13 THEN 'Should be New (no prev year, no prior)'
        WHEN month_id = 14 THEN 'Should be New (no prev year Feb, has 1 prior)'
        WHEN month_id = 25 THEN 'Should be Returning (Jan 22 was active)'
        WHEN month_id = 26 THEN 'Should be Returning (Feb 22 was active)'
        ELSE 'Other scenario'
    END as expected_logic
FROM growth_states 
WHERE month_id IN (1, 13, 14, 25, 26)
ORDER BY month_id;

.print ""
.print "=== SQL TESTS COMPLETE ==="