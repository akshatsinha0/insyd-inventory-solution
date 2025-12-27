-- Seed data for Insyd Inventory Solution
-- Safe to run multiple times

-- Clean up existing data (for re-running seed)
-- Using DO block to handle tables that might not exist yet
DO $$ 
BEGIN
    -- Truncate tables if they exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'three_way_matches') THEN
        TRUNCATE TABLE three_way_matches CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoice_line_items') THEN
        TRUNCATE TABLE invoice_line_items CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        TRUNCATE TABLE invoices CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grn_line_items') THEN
        TRUNCATE TABLE grn_line_items CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grns') THEN
        TRUNCATE TABLE grns CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'po_line_items') THEN
        TRUNCATE TABLE po_line_items CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'purchase_orders') THEN
        TRUNCATE TABLE purchase_orders CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shipments') THEN
        TRUNCATE TABLE shipments CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'allocations') THEN
        TRUNCATE TABLE allocations CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        TRUNCATE TABLE transactions CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory') THEN
        TRUNCATE TABLE inventory CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bin_locations') THEN
        TRUNCATE TABLE bin_locations CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'skus') THEN
        TRUNCATE TABLE skus CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'warehouses') THEN
        TRUNCATE TABLE warehouses CASCADE;
    END IF;
END $$;

-- Reset categories to default
DELETE FROM categories WHERE code IN ('A', 'B', 'C');
INSERT INTO categories (code, name, description, audit_frequency, value_percentage) VALUES
('A', 'High Value', 'Premium materials requiring daily/weekly audits', 'Daily/Weekly', '70-80%'),
('B', 'Medium Value', 'Standard materials requiring monthly audits', 'Monthly', '15-25%'),
('C', 'Low Value', 'Consumables managed via visual control', 'Quarterly', '5-10%')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    audit_frequency = EXCLUDED.audit_frequency,
    value_percentage = EXCLUDED.value_percentage;

-- Insert sample warehouses
INSERT INTO warehouses (code, name, address, city) VALUES
('WH01', 'Delhi Central Warehouse', '123 Industrial Area, Okhla', 'Delhi'),
('WH02', 'Mumbai Distribution Center', '456 MIDC, Andheri East', 'Mumbai'),
('WH03', 'Bangalore Hub', '789 Electronic City', 'Bangalore');

-- Insert bin locations for WH01
INSERT INTO bin_locations (warehouse_id, aisle, rack, bin, zone)
SELECT 
    w.id,
    'ASL0' || a.n,
    'RK0' || r.n,
    'BN' || LPAD(b.n::text, 2, '0'),
    CASE WHEN a.n = 1 THEN 'FAST-PICK' ELSE 'STANDARD' END
FROM warehouses w
CROSS JOIN generate_series(1, 3) AS a(n)
CROSS JOIN generate_series(1, 4) AS r(n)
CROSS JOIN generate_series(1, 10) AS b(n)
WHERE w.code = 'WH01';

-- Insert sample SKUs
INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'MAR-ITL-001',
    'Italian Carrara Marble',
    'Premium white marble from Carrara, Italy. 20mm thickness.',
    c.id,
    'SQM',
    15000.00,
    50,
    20
FROM categories c WHERE c.code = 'A';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'STL-JSW-002',
    'JSW Steel Rebar 12mm',
    'High-grade TMT steel rebar, 12mm diameter, Fe500D grade.',
    c.id,
    'TON',
    65000.00,
    10,
    5
FROM categories c WHERE c.code = 'A';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'TIL-SOM-003',
    'Somany Ceramic Floor Tile',
    'Standard ceramic floor tile, 600x600mm, matte finish.',
    c.id,
    'BOX',
    850.00,
    200,
    50
FROM categories c WHERE c.code = 'B';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'FIX-JAQ-004',
    'Jaquar CP Basin Mixer',
    'Chrome plated basin mixer tap, single lever.',
    c.id,
    'PCS',
    4500.00,
    30,
    10
FROM categories c WHERE c.code = 'B';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'ADH-PID-005',
    'Pidilite Fevicol SH',
    'Synthetic resin adhesive, 5kg pack.',
    c.id,
    'PCS',
    450.00,
    100,
    30
FROM categories c WHERE c.code = 'C';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'SCR-GEN-006',
    'SS Screws Assorted Pack',
    'Stainless steel screws, mixed sizes, 500pcs pack.',
    c.id,
    'PACK',
    350.00,
    50,
    20
FROM categories c WHERE c.code = 'C';

-- Insert DeWalt Power Tools (Category A - High Value)
INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'DWT-DRL-001',
    'DeWalt 20V MAX Cordless Drill',
    'Professional grade cordless drill with brushless motor, 2-speed transmission.',
    c.id,
    'PCS',
    12500.00,
    20,
    10
FROM categories c WHERE c.code = 'A';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'DWT-SAW-002',
    'DeWalt Circular Saw 7.25"',
    'Industrial circular saw with 15-amp motor, electric brake.',
    c.id,
    'PCS',
    18000.00,
    15,
    5
FROM categories c WHERE c.code = 'A';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'DWT-GRN-003',
    'DeWalt Angle Grinder 4.5"',
    'Heavy-duty angle grinder with 11-amp motor, paddle switch.',
    c.id,
    'PCS',
    8500.00,
    25,
    10
FROM categories c WHERE c.code = 'A';

-- Insert Craftsman Tool Sets (Category B - Medium Value)
INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'CRF-SET-001',
    'Craftsman 230-Piece Mechanics Tool Set',
    'Complete mechanics tool set with ratchets, sockets, wrenches.',
    c.id,
    'SET',
    15000.00,
    30,
    15
FROM categories c WHERE c.code = 'B';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'CRF-HAM-002',
    'Craftsman Fiberglass Hammer 16oz',
    'Claw hammer with fiberglass handle, anti-vibration grip.',
    c.id,
    'PCS',
    850.00,
    50,
    20
FROM categories c WHERE c.code = 'B';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'BST-NAL-003',
    'Bostitch Pneumatic Nailer',
    'Brad nailer for finish carpentry, 18-gauge.',
    c.id,
    'PCS',
    9500.00,
    20,
    8
FROM categories c WHERE c.code = 'B';

-- Insert Stanley Hand Tools (Category C - Low Value)
INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'STN-TPM-001',
    'Stanley PowerLock Tape Measure 25ft',
    'Professional tape measure with blade armor coating.',
    c.id,
    'PCS',
    450.00,
    100,
    40
FROM categories c WHERE c.code = 'C';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'STN-SCR-002',
    'Stanley Screwdriver Set 6-Piece',
    'Multi-tip screwdriver set with cushion grip handles.',
    c.id,
    'SET',
    650.00,
    80,
    30
FROM categories c WHERE c.code = 'C';

INSERT INTO skus (sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock)
SELECT 
    'BLK-BIT-003',
    'BLACK+DECKER Drill Bit Set 100-Piece',
    'Comprehensive drill bit set for wood, metal, masonry.',
    c.id,
    'SET',
    1200.00,
    60,
    25
FROM categories c WHERE c.code = 'C';

-- Insert initial inventory
INSERT INTO inventory (sku_id, warehouse_id, bin_location_id, quantity, batch_number)
SELECT 
    s.id,
    w.id,
    b.id,
    CASE 
        WHEN c.code = 'A' THEN 100
        WHEN c.code = 'B' THEN 500
        ELSE 1000
    END,
    'BATCH-2025-001'
FROM skus s
JOIN categories c ON s.category_id = c.id
CROSS JOIN warehouses w
JOIN bin_locations b ON b.warehouse_id = w.id
WHERE w.code = 'WH01'
AND b.aisle = 'ASL01' AND b.rack = 'RK01' AND b.bin = 'BN01';

-- Add Stanley Black & Decker tools inventory
INSERT INTO inventory (sku_id, warehouse_id, bin_location_id, quantity, batch_number)
SELECT 
    s.id,
    w.id,
    b.id,
    CASE 
        WHEN c.code = 'A' THEN 50
        WHEN c.code = 'B' THEN 150
        ELSE 300
    END,
    'BATCH-SBD-2025'
FROM skus s
JOIN categories c ON s.category_id = c.id
CROSS JOIN warehouses w
JOIN bin_locations b ON b.warehouse_id = w.id
WHERE w.code = 'WH01'
AND b.aisle = 'ASL01' AND b.rack = 'RK02' AND b.bin = 'BN01'
AND s.sku_code IN (
    'DWT-DRL-001', 'DWT-SAW-002', 'DWT-GRN-003',
    'CRF-SET-001', 'CRF-HAM-002', 'BST-NAL-003',
    'STN-TPM-001', 'STN-SCR-002', 'BLK-BIT-003'
);

-- Insert sample Purchase Orders
INSERT INTO purchase_orders (po_number, vendor_name, warehouse_id, status, total_amount, expected_delivery, created_by)
SELECT 
    'PO-2025-001',
    'JSW Steel Ltd',
    w.id,
    'APPROVED',
    650000.00,
    CURRENT_DATE + INTERVAL '7 days',
    'procurement@insyd.ai'
FROM warehouses w WHERE w.code = 'WH01';

INSERT INTO purchase_orders (po_number, vendor_name, warehouse_id, status, total_amount, expected_delivery, created_by)
SELECT 
    'PO-2025-002',
    'Somany Ceramics',
    w.id,
    'SENT',
    425000.00,
    CURRENT_DATE + INTERVAL '10 days',
    'procurement@insyd.ai'
FROM warehouses w WHERE w.code = 'WH01';

-- Insert PO Line Items for PO-2025-001
INSERT INTO po_line_items (po_id, sku_id, quantity_ordered, unit_price)
SELECT 
    po.id,
    s.id,
    10,
    65000.00
FROM purchase_orders po
CROSS JOIN skus s
WHERE po.po_number = 'PO-2025-001'
AND s.sku_code = 'STL-JSW-002';

-- Insert PO Line Items for PO-2025-002
INSERT INTO po_line_items (po_id, sku_id, quantity_ordered, unit_price)
SELECT 
    po.id,
    s.id,
    500,
    850.00
FROM purchase_orders po
CROSS JOIN skus s
WHERE po.po_number = 'PO-2025-002'
AND s.sku_code = 'TIL-SOM-003';
