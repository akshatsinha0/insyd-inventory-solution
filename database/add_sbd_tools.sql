-- Add Stanley Black & Decker Tools to Inventory

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

-- Add inventory for these SKUs in WH01
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

-- Log initial transactions
INSERT INTO transactions (sku_id, warehouse_id, type, quantity, reference_number, notes)
SELECT 
    s.id,
    w.id,
    'RECEIVE',
    CASE 
        WHEN c.code = 'A' THEN 50
        WHEN c.code = 'B' THEN 150
        ELSE 300
    END,
    'PO-SBD-2025-001',
    'Initial stock - Stanley Black & Decker tools'
FROM skus s
JOIN categories c ON s.category_id = c.id
CROSS JOIN warehouses w
WHERE w.code = 'WH01'
AND s.sku_code IN (
    'DWT-DRL-001', 'DWT-SAW-002', 'DWT-GRN-003',
    'CRF-SET-001', 'CRF-HAM-002', 'BST-NAL-003',
    'STN-TPM-001', 'STN-SCR-002', 'BLK-BIT-003'
);
