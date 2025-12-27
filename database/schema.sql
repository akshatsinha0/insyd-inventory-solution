-- Insyd Inventory Solution Database Schema
-- Supabase PostgreSQL
-- Safe to run multiple times - includes all DROP statements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers first (prevents "trigger already exists" errors)
DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses CASCADE;
DROP TRIGGER IF EXISTS update_skus_updated_at ON skus CASCADE;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory CASCADE;
DROP TRIGGER IF EXISTS update_allocations_updated_at ON allocations CASCADE;
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders CASCADE;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices CASCADE;
DROP TRIGGER IF EXISTS update_three_way_matches_updated_at ON three_way_matches CASCADE;

-- Drop existing function (prevents "function already exists" errors)
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Drop existing tables (in correct order to handle foreign key dependencies)
DROP TABLE IF EXISTS three_way_matches CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS grn_line_items CASCADE;
DROP TABLE IF EXISTS grns CASCADE;
DROP TABLE IF EXISTS po_line_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS allocations CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS bin_locations CASCADE;
DROP TABLE IF EXISTS skus CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;

-- Drop enum type if exists
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Warehouses table
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bin locations table (WH01-ASL02-RK04-BN10 format)
CREATE TABLE bin_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    aisle VARCHAR(10) NOT NULL,
    rack VARCHAR(10) NOT NULL,
    bin VARCHAR(10) NOT NULL,
    zone VARCHAR(20) DEFAULT 'STANDARD',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(warehouse_id, aisle, rack, bin)
);

-- Categories table (ABC classification)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code CHAR(1) NOT NULL UNIQUE CHECK (code IN ('A', 'B', 'C')),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    audit_frequency VARCHAR(20) NOT NULL,
    value_percentage VARCHAR(20)
);

-- Insert default ABC categories
INSERT INTO categories (code, name, description, audit_frequency, value_percentage) VALUES
('A', 'High Value', 'Premium materials requiring daily/weekly audits', 'Daily/Weekly', '70-80%'),
('B', 'Medium Value', 'Standard materials requiring monthly audits', 'Monthly', '15-25%'),
('C', 'Low Value', 'Consumables managed via visual control', 'Quarterly', '5-10%');

-- SKU master table
CREATE TABLE skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
    unit_price DECIMAL(12, 2) DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table (current stock levels)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    bin_location_id UUID REFERENCES bin_locations(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    allocated_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - allocated_quantity) STORED,
    batch_number VARCHAR(50),
    expiry_date DATE,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sku_id, warehouse_id, bin_location_id, batch_number)
);

-- Transaction types enum
CREATE TYPE transaction_type AS ENUM (
    'RECEIVE',
    'ALLOCATE',
    'DEALLOCATE',
    'PICK',
    'SHIP',
    'ADJUST',
    'TRANSFER',
    'RETURN'
);

-- Transaction log table (audit trail)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id),
    sku_id UUID REFERENCES skus(id),
    warehouse_id UUID REFERENCES warehouses(id),
    type transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(50),
    notes TEXT,
    performed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allocations table (soft locks)
CREATE TABLE allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table (3PL tracking)
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_id UUID REFERENCES skus(id),
    warehouse_id UUID REFERENCES warehouses(id),
    quantity INTEGER NOT NULL,
    vendor_name VARCHAR(100),
    tracking_number VARCHAR(100) UNIQUE,
    status VARCHAR(30) DEFAULT 'DISPATCHED' CHECK (status IN ('DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
    current_location VARCHAR(200),
    expected_arrival DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    vendor_name VARCHAR(100) NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id),
    status VARCHAR(30) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
    total_amount DECIMAL(12, 2) DEFAULT 0,
    expected_delivery DATE,
    notes TEXT,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Line Items
CREATE TABLE po_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goods Received Notes (GRN)
CREATE TABLE grns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(50) NOT NULL UNIQUE,
    po_id UUID REFERENCES purchase_orders(id),
    warehouse_id UUID REFERENCES warehouses(id),
    received_by VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUALITY_CHECK', 'APPROVED', 'REJECTED')),
    notes TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GRN Line Items
CREATE TABLE grn_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id UUID REFERENCES grns(id) ON DELETE CASCADE,
    po_line_item_id UUID REFERENCES po_line_items(id),
    sku_id UUID REFERENCES skus(id),
    quantity_received INTEGER NOT NULL,
    quantity_accepted INTEGER,
    quantity_rejected INTEGER DEFAULT 0,
    batch_number VARCHAR(50),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    po_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES grns(id),
    vendor_name VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'MATCHED', 'APPROVED', 'PAID', 'DISPUTED', 'REJECTED')),
    payment_terms VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    quantity_invoiced INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity_invoiced * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3-Way Match Results
CREATE TABLE three_way_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES grns(id),
    invoice_id UUID REFERENCES invoices(id),
    match_status VARCHAR(30) DEFAULT 'PENDING' CHECK (match_status IN ('PENDING', 'MATCHED', 'DISCREPANCY', 'APPROVED', 'REJECTED')),
    po_total DECIMAL(12, 2),
    grn_total DECIMAL(12, 2),
    invoice_total DECIMAL(12, 2),
    quantity_variance INTEGER DEFAULT 0,
    amount_variance DECIMAL(12, 2) DEFAULT 0,
    discrepancy_notes TEXT,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_inventory_sku ON inventory(sku_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_transactions_sku ON transactions(sku_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_allocations_status ON allocations(status);
CREATE INDEX idx_allocations_expires ON allocations(expires_at);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_grn_po ON grns(po_id);
CREATE INDEX idx_invoice_po ON invoices(po_id);
CREATE INDEX idx_invoice_status ON invoices(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_skus_updated_at
    BEFORE UPDATE ON skus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_allocations_updated_at
    BEFORE UPDATE ON allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_three_way_matches_updated_at
    BEFORE UPDATE ON three_way_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
