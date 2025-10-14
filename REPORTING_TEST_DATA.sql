-- ============================================================================
-- REPORTING FEATURE - TEST DATA
-- Description: Sample data to test the Master Price Report functionality
-- ============================================================================

-- This script creates sample products, vendors, customers, costs, and pricing
-- to fully test the reporting feature before using with real data.

-- ============================================================================
-- 1. CLEANUP (Optional - only if you want to start fresh)
-- ============================================================================
-- Uncomment these lines if you want to delete existing test data
-- DELETE FROM product_customer_pricing WHERE customer_id IN (SELECT id FROM customers WHERE customer_code LIKE 'TEST%');
-- DELETE FROM product_vendor_costs WHERE vendor_id IN (SELECT id FROM vendors WHERE vendor_code LIKE 'TEST%');
-- DELETE FROM import_costs WHERE product_id IN (SELECT id FROM products WHERE item_number LIKE 'TEST%');
-- DELETE FROM products WHERE item_number LIKE 'TEST%';
-- DELETE FROM customers WHERE customer_code LIKE 'TEST%';
-- DELETE FROM vendors WHERE vendor_code LIKE 'TEST%';

-- ============================================================================
-- 2. CREATE TEST VENDORS
-- ============================================================================
INSERT INTO vendors (vendor_name, vendor_code, country_origin, facility_name, facility_address, payment_terms, contact_person, contact_email, is_active)
VALUES
('Test Supplier A', 'TEST-VENDOR-A', 'China', 'Guangzhou Plant', '123 Industrial Rd, Guangzhou, China', 'Net 30', 'John Chen', 'john@testsupplier.com', true),
('Test Supplier B', 'TEST-VENDOR-B', 'Vietnam', 'Ho Chi Minh Factory', '456 Export St, HCMC, Vietnam', 'Net 45', 'Mai Nguyen', 'mai@testsupplier.com', true),
('Test Domestic Supplier', 'TEST-VENDOR-C', 'USA', 'California Warehouse', '789 Commerce Blvd, Los Angeles, CA', 'Net 60', 'Mike Johnson', 'mike@domesticsupplier.com', true);

-- ============================================================================
-- 3. CREATE TEST CUSTOMERS
-- ============================================================================
INSERT INTO customers (customer_name, customer_code, region, warehouse_zip_code, payment_terms, sales_broker_name, contact_person, contact_email, annual_volume_cases, monthly_volume_cases, is_active)
VALUES
('Test Foods Inc', 'TEST-CUST-A', 'SE', '30303', 'Net 30', 'KATGO', 'Sarah Williams', 'sarah@testfoods.com', 120000, 10000, true),
('Test Retail Direct', 'TEST-CUST-B', 'NE', '10001', 'Net 45', 'Direct', 'Bob Smith', 'bob@retaildirect.com', 60000, 5000, true),
('Test Distribution Co', 'TEST-CUST-C', 'MW', '60601', 'COD', 'Sales Rep A', 'Linda Martinez', 'linda@distribution.com', 240000, 20000, true);

-- ============================================================================
-- 4. CREATE TEST PRODUCTS
-- ============================================================================
INSERT INTO products (
    master_list_number, item_number, product_type, status, category, brand, item_description,
    pack_size, units_per_case, product_of_country, hs_code,
    case_length_in, case_width_in, case_height_in, case_cube_ft, case_weight_lbs,
    unit_weight_oz, ti, hi, cases_per_pallet, pallet_weight_lbs,
    pallets_per_20ft, cases_per_20ft, pallets_per_40ft, cases_per_40ft, pallets_per_40hc, cases_per_40hc,
    stackable, lead_time_days, moq, is_active
)
VALUES
(1, 'TEST-001', 'I', 'C', 'Vegetables', 'Test Brand A', 'Premium Organic Soybeans', '12/2lb', 12, 'China', '2008.11.00',
 16, 12, 8, 0.9, 26.5, 32, 5, 7, 35, 935, 10, 350, 20, 700, 22, 770, true, 45, 350, true),

(2, 'TEST-002', 'I', 'C', 'Vegetables', 'Test Brand B', 'Deluxe Frozen Corn', '24/1lb', 24, 'Vietnam', '2004.10.00',
 18, 14, 10, 1.5, 28.0, 16, 6, 6, 36, 1020, 11, 396, 22, 792, 24, 864, true, 30, 396, true),

(3, 'TEST-003', 'D', 'C', 'Fruits', 'Test Brand C', 'Fresh Berry Mix', '6/2lb', 6, 'USA', '0810.40.00',
 12, 10, 6, 0.4, 14.0, 32, 8, 8, 64, 910, 15, 960, 30, 1920, 32, 2048, false, 7, 64, true),

(4, 'TEST-004', 'I', 'N', 'Vegetables', 'Test Brand A', 'Organic Green Beans', '12/2lb', 12, 'China', '2004.90.20',
 16, 12, 8, 0.9, 26.0, 32, 5, 7, 35, 920, 10, 350, 20, 700, 22, 770, true, 45, 350, true),

(5, 'TEST-005', 'I', 'T', 'Fruits', 'Test Brand B', 'Tropical Fruit Blend', '12/1.5lb', 12, 'Vietnam', '0811.90.00',
 14, 12, 9, 0.9, 22.0, 24, 6, 6, 36, 810, 11, 396, 22, 792, 24, 864, true, 35, 396, true);

-- ============================================================================
-- 5. CREATE VENDOR COSTS
-- ============================================================================
-- Get IDs for our test data
DO $$
DECLARE
    v_vendor_a_id UUID;
    v_vendor_b_id UUID;
    v_vendor_c_id UUID;
    v_product_1_id UUID;
    v_product_2_id UUID;
    v_product_3_id UUID;
    v_product_4_id UUID;
    v_product_5_id UUID;
BEGIN
    -- Get vendor IDs
    SELECT id INTO v_vendor_a_id FROM vendors WHERE vendor_code = 'TEST-VENDOR-A';
    SELECT id INTO v_vendor_b_id FROM vendors WHERE vendor_code = 'TEST-VENDOR-B';
    SELECT id INTO v_vendor_c_id FROM vendors WHERE vendor_code = 'TEST-VENDOR-C';

    -- Get product IDs
    SELECT id INTO v_product_1_id FROM products WHERE item_number = 'TEST-001';
    SELECT id INTO v_product_2_id FROM products WHERE item_number = 'TEST-002';
    SELECT id INTO v_product_3_id FROM products WHERE item_number = 'TEST-003';
    SELECT id INTO v_product_4_id FROM products WHERE item_number = 'TEST-004';
    SELECT id INTO v_product_5_id FROM products WHERE item_number = 'TEST-005';

    -- Product 1 Costs (International - Vendor A)
    INSERT INTO product_vendor_costs (
        product_id, vendor_id, incoterm, shipment_size, loading_option,
        exw_cost_per_case, exw_cost_per_unit, exw_cost_per_lb, exw_previous_cost_per_case,
        fob_cost_per_case, fob_cost_per_unit, fob_cost_per_lb, fob_previous_cost_per_case,
        ddp_cost_per_case, factory_fee_percent, factory_fee_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_1_id, v_vendor_a_id, 'FOB', 'FCL', 'Palletized',
        10.50, 0.875, 5.25, 10.00,
        11.25, 0.9375, 5.625, 10.75,
        14.50, 0.05, 0.55,
        CURRENT_DATE - INTERVAL '30 days', true
    );

    -- Product 2 Costs (International - Vendor B)
    INSERT INTO product_vendor_costs (
        product_id, vendor_id, incoterm, shipment_size, loading_option,
        exw_cost_per_case, exw_cost_per_unit, exw_cost_per_lb, exw_previous_cost_per_case,
        fob_cost_per_case, fob_cost_per_unit, fob_cost_per_lb, fob_previous_cost_per_case,
        ddp_cost_per_case, factory_fee_percent, factory_fee_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_2_id, v_vendor_b_id, 'FOB', 'FCL', 'Palletized',
        8.75, 0.365, 3.75, 8.50,
        9.50, 0.396, 4.07, 9.25,
        12.75, 0.04, 0.38,
        CURRENT_DATE - INTERVAL '15 days', true
    );

    -- Product 3 Costs (Domestic - Vendor C)
    INSERT INTO product_vendor_costs (
        product_id, vendor_id, incoterm, shipment_size, loading_option,
        pickup_plant_cost_per_case, pickup_plant_cost_per_unit, pickup_plant_cost_per_lb, pickup_plant_previous_cost_per_case,
        ddp_cost_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_3_id, v_vendor_c_id, 'EXW', 'LTL', 'Palletized',
        6.50, 1.083, 3.25, 6.25,
        7.25,
        CURRENT_DATE - INTERVAL '7 days', true
    );

    -- Product 4 Costs (International - Vendor A)
    INSERT INTO product_vendor_costs (
        product_id, vendor_id, incoterm, shipment_size, loading_option,
        exw_cost_per_case, fob_cost_per_case, ddp_cost_per_case, factory_fee_percent, factory_fee_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_4_id, v_vendor_a_id, 'FOB', 'FCL', 'Palletized',
        10.75, 11.50, 14.75, 0.05, 0.58,
        CURRENT_DATE, true
    );

    -- Product 5 Costs (International - Vendor B)
    INSERT INTO product_vendor_costs (
        product_id, vendor_id, incoterm, shipment_size, loading_option,
        exw_cost_per_case, fob_cost_per_case, ddp_cost_per_case, factory_fee_percent, factory_fee_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_5_id, v_vendor_b_id, 'FOB', 'FCL', 'Floor Loaded',
        9.25, 10.00, 13.25, 0.04, 0.40,
        CURRENT_DATE - INTERVAL '20 days', true
    );
END $$;

-- ============================================================================
-- 6. CREATE CUSTOMER PRICING
-- ============================================================================
DO $$
DECLARE
    v_customer_a_id UUID;
    v_customer_b_id UUID;
    v_customer_c_id UUID;
    v_product_1_id UUID;
    v_product_2_id UUID;
    v_product_3_id UUID;
    v_product_4_id UUID;
    v_product_5_id UUID;
BEGIN
    -- Get customer IDs
    SELECT id INTO v_customer_a_id FROM customers WHERE customer_code = 'TEST-CUST-A';
    SELECT id INTO v_customer_b_id FROM customers WHERE customer_code = 'TEST-CUST-B';
    SELECT id INTO v_customer_c_id FROM customers WHERE customer_code = 'TEST-CUST-C';

    -- Get product IDs
    SELECT id INTO v_product_1_id FROM products WHERE item_number = 'TEST-001';
    SELECT id INTO v_product_2_id FROM products WHERE item_number = 'TEST-002';
    SELECT id INTO v_product_3_id FROM products WHERE item_number = 'TEST-003';
    SELECT id INTO v_product_4_id FROM products WHERE item_number = 'TEST-004';
    SELECT id INTO v_product_5_id FROM products WHERE item_number = 'TEST-005';

    -- Product 1 - Customer A (FOB pricing)
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        fob_price_per_case, fob_price_per_unit, fob_price_per_lb,
        fob_rebate_amount, fob_rebate_price_per_case,
        dap_cases_per_container, dap_vessel_freight_per_case, dap_price_per_case,
        ddp_inland_freight_per_case, ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_1_id, v_customer_a_id,
        14.00, 1.167, 7.00,
        0.50, 13.50,
        700, 1.50, 15.50,
        0.75, 16.25,
        CURRENT_DATE - INTERVAL '30 days', true
    );

    -- Product 1 - Customer B (FOB pricing different margin)
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        fob_price_per_case, fob_price_per_unit, fob_price_per_lb,
        ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_1_id, v_customer_b_id,
        13.50, 1.125, 6.75,
        16.00,
        CURRENT_DATE - INTERVAL '25 days', true
    );

    -- Product 2 - Customer A
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        fob_price_per_case, fob_price_per_unit, fob_price_per_lb,
        fob_rebate_amount, fob_rebate_price_per_case,
        dap_cases_per_container, dap_vessel_freight_per_case, dap_price_per_case,
        ddp_inland_freight_per_case, ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_2_id, v_customer_a_id,
        12.00, 0.50, 5.14,
        0.40, 11.60,
        792, 1.25, 13.25,
        0.65, 13.90,
        CURRENT_DATE - INTERVAL '15 days', true
    );

    -- Product 2 - Customer C
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        fob_price_per_case, fob_price_per_unit,
        ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_2_id, v_customer_c_id,
        11.75, 0.49,
        13.50,
        CURRENT_DATE - INTERVAL '10 days', true
    );

    -- Product 3 - Customer A (Domestic pricing)
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        exw_price_per_case, exw_price_per_unit, exw_price_per_lb,
        ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_3_id, v_customer_a_id,
        8.50, 1.417, 4.25,
        9.25,
        CURRENT_DATE - INTERVAL '7 days', true
    );

    -- Product 4 - Customer B (New product)
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        fob_price_per_case, fob_price_per_unit,
        ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_4_id, v_customer_b_id,
        14.25, 1.188,
        16.50,
        CURRENT_DATE, true
    );

    -- Product 5 - Customer C (Temporary)
    INSERT INTO product_customer_pricing (
        product_id, customer_id,
        fob_price_per_case, ddp_price_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_5_id, v_customer_c_id,
        12.50, 15.00,
        CURRENT_DATE - INTERVAL '20 days', true
    );
END $$;

-- ============================================================================
-- 7. CREATE IMPORT COSTS
-- ============================================================================
DO $$
DECLARE
    v_product_1_id UUID;
    v_product_2_id UUID;
    v_product_4_id UUID;
    v_product_5_id UUID;
BEGIN
    -- Get product IDs (only international products need import costs)
    SELECT id INTO v_product_1_id FROM products WHERE item_number = 'TEST-001';
    SELECT id INTO v_product_2_id FROM products WHERE item_number = 'TEST-002';
    SELECT id INTO v_product_4_id FROM products WHERE item_number = 'TEST-004';
    SELECT id INTO v_product_5_id FROM products WHERE item_number = 'TEST-005';

    -- Product 1 Import Costs
    INSERT INTO import_costs (
        product_id,
        import_broker_fee_percent, import_broker_fee_per_case,
        duty_rate_percent, duty_per_case,
        previous_tariff_percent,
        gsp_margin_percent, gsp_profit_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_1_id,
        0.015, 0.17,
        0.06, 0.68,
        0.04,
        0.12, 1.35,
        CURRENT_DATE - INTERVAL '30 days', true
    );

    -- Product 2 Import Costs
    INSERT INTO import_costs (
        product_id,
        import_broker_fee_percent, import_broker_fee_per_case,
        duty_rate_percent, duty_per_case,
        previous_tariff_percent,
        effective_date, is_current
    ) VALUES (
        v_product_2_id,
        0.015, 0.14,
        0.05, 0.48,
        0.05,
        CURRENT_DATE - INTERVAL '15 days', true
    );

    -- Product 4 Import Costs
    INSERT INTO import_costs (
        product_id,
        import_broker_fee_per_case,
        duty_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_4_id,
        0.17,
        0.69,
        CURRENT_DATE, true
    );

    -- Product 5 Import Costs
    INSERT INTO import_costs (
        product_id,
        import_broker_fee_per_case,
        duty_per_case,
        effective_date, is_current
    ) VALUES (
        v_product_5_id,
        0.15,
        0.50,
        CURRENT_DATE - INTERVAL '20 days', true
    );
END $$;

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify your test data was created successfully

-- Check products
SELECT COUNT(*) as product_count FROM products WHERE item_number LIKE 'TEST%';
-- Expected: 5 products

-- Check vendors
SELECT COUNT(*) as vendor_count FROM vendors WHERE vendor_code LIKE 'TEST%';
-- Expected: 3 vendors

-- Check customers
SELECT COUNT(*) as customer_count FROM customers WHERE customer_code LIKE 'TEST%';
-- Expected: 3 customers

-- Check vendor costs
SELECT COUNT(*) as cost_count FROM product_vendor_costs
WHERE product_id IN (SELECT id FROM products WHERE item_number LIKE 'TEST%');
-- Expected: 5 records

-- Check customer pricing
SELECT COUNT(*) as pricing_count FROM product_customer_pricing
WHERE product_id IN (SELECT id FROM products WHERE item_number LIKE 'TEST%');
-- Expected: 7 records

-- Check import costs
SELECT COUNT(*) as import_cost_count FROM import_costs
WHERE product_id IN (SELECT id FROM products WHERE item_number LIKE 'TEST%');
-- Expected: 4 records

-- Check the report view
SELECT COUNT(*) as report_row_count FROM v_master_price_report
WHERE item_number LIKE 'TEST%';
-- Expected: 7 rows (one for each product-customer combination)

-- Sample report data
SELECT
    item_number,
    brand,
    vendor_name,
    customer_name,
    fob_cost_per_case,
    fob_price_per_case,
    fob_margin_percent,
    profit_per_40ft_fob
FROM v_master_price_report
WHERE item_number LIKE 'TEST%'
ORDER BY item_number, customer_name;

-- ============================================================================
-- 9. CLEANUP SCRIPT (Optional - use when done testing)
-- ============================================================================
/*
-- Run this when you want to remove all test data:

DELETE FROM product_customer_pricing WHERE customer_id IN (SELECT id FROM customers WHERE customer_code LIKE 'TEST%');
DELETE FROM product_vendor_costs WHERE vendor_id IN (SELECT id FROM vendors WHERE vendor_code LIKE 'TEST%');
DELETE FROM import_costs WHERE product_id IN (SELECT id FROM products WHERE item_number LIKE 'TEST%');
DELETE FROM products WHERE item_number LIKE 'TEST%';
DELETE FROM customers WHERE customer_code LIKE 'TEST%';
DELETE FROM vendors WHERE vendor_code LIKE 'TEST%';

-- Verify cleanup
SELECT COUNT(*) FROM products WHERE item_number LIKE 'TEST%'; -- Should be 0
SELECT COUNT(*) FROM vendors WHERE vendor_code LIKE 'TEST%';   -- Should be 0
SELECT COUNT(*) FROM customers WHERE customer_code LIKE 'TEST%'; -- Should be 0
*/

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Your test data is ready. You can now:
-- 1. Go to http://localhost:3000/reports
-- 2. Click "Generate Master Price Report"
-- 3. Generate and export your first report!
-- ============================================================================
