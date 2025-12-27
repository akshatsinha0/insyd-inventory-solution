-- Insyd Inventory Solution Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for performance
CREATE INDEX idx_inventory_sku ON inventory(sku_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_transactions_sku ON transactions(sku_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_allocations_status ON allocations(status);
CREATE INDEX idx_allocations_expires ON allocations(expires_at);

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
