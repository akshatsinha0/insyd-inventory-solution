-- Add Procurement Tables for 3-Way Matching
-- Run this in Supabase SQL Editor if you already have existing data

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
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
CREATE TABLE IF NOT EXISTS po_line_items (
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
CREATE TABLE IF NOT EXISTS grns (
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
CREATE TABLE IF NOT EXISTS grn_line_items (
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
CREATE TABLE IF NOT EXISTS invoices (
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
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    quantity_invoiced INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity_invoiced * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3-Way Match Results
CREATE TABLE IF NOT EXISTS three_way_matches (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_grn_po ON grns(po_id);
CREATE INDEX IF NOT EXISTS idx_invoice_po ON invoices(po_id);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoices(status);

-- Add triggers
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_three_way_matches_updated_at
    BEFORE UPDATE ON three_way_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
