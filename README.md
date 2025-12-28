# Insyd Inventory Solution

> A unified inventory management system for AEC (Architecture, Engineering, and Construction) material businesses. Built with NextJS + ExpressJS stack to eliminate data latency and enable real-time inventory visibility.

## Live Demo

- **Frontend (App)**: [https://insyd-inventory-solution.vercel.app](https://insyd-inventory-solution.vercel.app)
- **Backend (API)**: [https://insyd-inventory-api.onrender.com/api](https://insyd-inventory-api.onrender.com/api)
- **Database**: Supabase PostgreSQL (Cloud)
- **GitHub Repository**: [https://github.com/akshatsinha0/insyd-inventory-solution](https://github.com/akshatsinha0/insyd-inventory-solution)

## Screenshots (using eraser.io)

![Dashboard Overview](./images/FORREADME/1.png)

![Inventory Management](./images/FORREADME/2.png)

![Procurement & 3-Way Matching](./images/FORREADME/3.png)

---

## Problem Statement

Indian AEC material businesses face critical challenges:
- **Data Latency**: 24-48hr lag between physical movement and digital records
- **Overselling**: No concurrency control leads to inventory deficits
- **Phantom Inventory**: Poor SKU granularity causes materials to be "lost" digitally
- **Black Box Logistics**: No visibility into in-transit inventory

## Solution Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   NextJS PWA    │────▶│  ExpressJS API  │────▶│    Supabase     │
│  (Mobile-First) │     │  (REST + ACID)  │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Tech Stack

- **Frontend**: NextJS 14 (App Router), TailwindCSS
- **Backend**: ExpressJS, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Features

- [x] Real-time inventory tracking
- [x] ABC categorization (High/Medium/Low value)
- [x] Soft allocation with atomic transactions
- [x] Bin location mapping (WH-ASL-RK-BN format)
- [x] QR/Barcode scanning simulation
- [x] Transaction audit logging
- [x] Dead stock alerts
- [x] Multi-warehouse support
- [x] 3PL shipment tracking with ASN
- [x] Webhook integration for logistics providers
- [x] In-transit inventory visibility
- [x] Purchase Order management
- [x] Goods Received Note (GRN) processing
- [x] Supplier invoice entry
- [x] Automated 3-way matching (PO vs GRN vs Invoice)
- [x] Variance detection and approval workflows

## Project Structure

```
insyd-inventory-solution/
├── client/                 # NextJS frontend
│   ├── app/               # App router pages
│   ├── components/        # React components (modular, SOLID-compliant)
│   └── lib/               # Utilities
├── server/                # ExpressJS backend
│   ├── routes/            # API routes
│   └── lib/               # Supabase client
└── database/              # PostgreSQL schema & seed data
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/akshatsinha0/insyd-inventory-solution.git

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Server
PORT=3001
NODE_ENV=development
```

---

## API Documentation

### Overview: How APIs Solve Real AEC Business Problems

This API suite addresses the core pain points of Indian AEC material businesses by providing real-time data synchronization, preventing overselling through atomic transactions, and enabling end-to-end supply chain visibility.

---

### 1. SKU Endpoints — The Foundation of Inventory Granularity

**Problem Solved:** Indian material businesses often group items under vague categories ("White Marble") instead of specific SKUs, causing phantom inventory where materials exist physically but are "lost" digitally.

**Real-Life Scenario:** A Delhi marble dealer has 3 types of Italian marble (Carrara, Statuario, Calacatta) but tracks them all as "Italian Marble." When a client orders Carrara specifically, the dealer can't confirm availability.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/skus` | Retrieve all SKUs with ABC categorization |
| GET | `/api/skus/:id` | Get detailed SKU info including reorder levels |

**Workflow:**
1. Each material gets a unique SKU code (e.g., `MAR-ITL-001` for Italian Carrara Marble)
2. SKUs are categorized using ABC Analysis (Pareto Principle)
3. Category A items (Italian Marble, DeWalt tools) get daily audits
4. Category C items (screws, adhesives) use visual Two-Bin control

```json
{
  "sku_code": "MAR-ITL-001",
  "name": "Italian Carrara Marble",
  "category": { "code": "A", "name": "High Value" },
  "unit_price": 15000.00,
  "reorder_level": 50,
  "safety_stock": 20
}
```

---

### 2. Warehouse & Bin Location Endpoints — Eliminating "Tribal Knowledge"

**Problem Solved:** In most Indian MSMEs, only senior warehouse workers know where specific batches are stored. New hires waste hours searching, and materials get "lost" in large warehouses.

**Real-Life Scenario:** A 50,000 sq.ft. warehouse in Okhla stores 500+ SKUs. Without bin mapping, finding a specific batch of 12mm steel rebar takes 30+ minutes of searching.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/warehouses` | List all warehouses (Delhi, Mumbai, Bangalore) |
| GET | `/api/warehouses/:id/bins` | Get bin locations with zone filtering |
| POST | `/api/warehouses` | Register new warehouse |

**Bin Location Format:** `WH01-ASL02-RK04-BN10` (Warehouse-Aisle-Rack-Bin)

**Workflow:**
1. Warehouse is divided into zones (FAST-PICK for Category A, BULK for Category C)
2. Each bin has a unique alphanumeric code
3. High-velocity items placed near loading dock (Smart Slotting)
4. New hire can locate any pallet in under 2 minutes using the app

```json
{
  "warehouse": { "code": "WH01", "name": "Delhi Central Warehouse" },
  "bin_location": {
    "aisle": "ASL01",
    "rack": "RK01", 
    "bin": "BN01",
    "zone": "FAST-PICK"
  }
}
```

---

### 3. Inventory Endpoints — Real-Time Stock Visibility with Atomic Transactions

**Problem Solved:** Data latency (24-48hr lag) and lack of concurrency control cause overselling. A sales executive in the city office sells 50 units while a walk-in customer at the warehouse buys 10 of the same stock.

**Real-Life Scenario:** A granite dealer's Excel sheet shows 50 slabs available. Sales team closes a ₹7.5L contract for all 50. Meanwhile, a contractor at the depot buys 10 slabs. Result: Inventory deficit, emergency procurement at higher prices, damaged reputation.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/inventory` | Real-time stock levels across all warehouses |
| POST | `/api/inventory/:id/allocate` | **Soft Allocation** — Atomic lock preventing overselling |
| POST | `/api/inventory/:id/receive` | Record goods receipt with batch tracking |
| PUT | `/api/inventory/:id` | Adjust quantities (cycle count corrections) |

**Soft Allocation Workflow (Prevents Overselling):**
1. Sales executive creates quote for 50 units
2. System performs `POST /allocate` — creates atomic lock on those 50 units
3. `allocated_quantity` increases, `available_quantity` decreases
4. Walk-in customer sees only 40 available (50 total - 10 allocated)
5. If sale doesn't close in 24hrs, allocation auto-expires

```json
// POST /api/inventory/:id/allocate
{
  "quantity": 10,
  "reference_number": "SO-2025-001",
  "expires_in_hours": 24
}

// Response — Stock is now "locked"
{
  "quantity": 100,
  "allocated_quantity": 10,
  "available_quantity": 90,
  "status": "PENDING"
}
```

**Technical Implementation:** Uses PostgreSQL row-level locking via Supabase transactions to ensure ACID compliance. Two concurrent requests cannot allocate the same stock.

---

### 4. Transaction Endpoints — Complete Audit Trail for Compliance

**Problem Solved:** Without transaction logs, businesses can't identify shrinkage sources, perform cycle counts, or calculate accurate Inventory Turnover Ratios.

**Real-Life Scenario:** A warehouse reports 5% shrinkage annually (₹15L loss). Without audit trails, management can't determine if it's theft, damage, or data entry errors.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/transactions` | Full audit log with filtering |
| POST | `/api/transactions` | Manual adjustments (damage, returns) |

**Transaction Types:**
- `RECEIVE` — Goods received from vendor (green badge)
- `ALLOCATE` — Stock reserved for sales order (blue badge)
- `SHIP` — Goods dispatched to customer (orange badge)
- `ADJUST` — Cycle count corrections (purple badge)
- `TRANSFER` — Inter-warehouse movement
- `RETURN` — Customer returns

**Workflow:**
1. Every inventory movement auto-logs a transaction
2. Filter by SKU to see complete movement history
3. Identify slow-moving items (no transactions in 30+ days)
4. Calculate Inventory Turnover: `Cost of Goods Sold / Average Inventory`

```json
{
  "type": "RECEIVE",
  "quantity": 100,
  "reference_number": "GRN-2025-001",
  "notes": "Goods received from JSW Steel",
  "performed_by": "warehouse@insyd.ai",
  "created_at": "2025-12-28T10:30:00Z"
}
```

---

### 5. Shipment Endpoints — Eliminating the "Black Box" of In-Transit Inventory

**Problem Solved:** The gap between vendor dispatch and warehouse receipt is a "black box." Fragmented communication (WhatsApp/phone calls) causes loading dock bottlenecks and stockout panics.

**Real-Life Scenario:** A construction project needs 500 bags of cement by Monday. The vendor dispatched Friday, but the warehouse manager has no visibility. Truck arrives Monday at 5 PM — project delayed.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/shipments` | List all shipments with status |
| POST | `/api/shipments` | Create ASN (Advanced Shipping Notice) |
| POST | `/api/shipments/webhook` | **Webhook** — 3PL providers push status updates |
| GET | `/api/shipments/in-transit` | Dashboard summary of in-transit value |

**ASN (Advanced Shipping Notice) Workflow:**
1. Vendor dispatches goods, creates ASN with tracking number
2. System flags inventory as "In-Transit" (not yet available for sale)
3. Warehouse manager gets 48-hour advance notice to clear floor space
4. 3PL provider (Delhivery, BlueDart) sends webhook updates at each checkpoint
5. On `DELIVERED` status, inventory auto-updates and transaction logs

**Webhook Integration:**
```json
// POST /api/shipments/webhook (called by 3PL provider)
{
  "tracking_number": "DEL-2025-001",
  "status": "IN_TRANSIT",
  "location": "Transit Hub Delhi",
  "timestamp": "2025-12-28T14:00:00Z"
}

// When status = "DELIVERED", system automatically:
// 1. Updates inventory quantity
// 2. Logs RECEIVE transaction
// 3. Clears shipment from in-transit dashboard
```

**In-Transit Summary:** Shows total value of goods in transit — critical for working capital planning.

```json
{
  "total_shipments": 3,
  "total_units": 150,
  "total_value": 975000.00
}
```

---

### 6. Procurement Endpoints — 3-Way Matching for Financial Integrity

**Problem Solved:** Without systematic verification, vendor errors (short-shipping, overbilling) go undetected. Finance pays invoices without confirming goods were actually received.

**Real-Life Scenario:** Vendor invoices for 100 units at ₹500 each (₹50,000). Warehouse received only 90 units. Without 3-way matching, finance pays full amount — ₹5,000 loss.

#### 6.1 Purchase Orders (PO)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/purchase-orders` | List all POs with status |
| POST | `/api/purchase-orders` | Create new PO with line items |
| POST | `/api/purchase-orders/:id/approve` | Manager approval workflow |
| POST | `/api/purchase-orders/:id/send` | Mark as sent to vendor |

**PO Workflow:**
1. Procurement creates PO specifying SKUs, quantities, prices
2. Manager approves (status: DRAFT → APPROVED)
3. PO sent to vendor (status: APPROVED → SENT)
4. System tracks expected delivery date

```json
{
  "po_number": "PO-1735380000000",
  "vendor_name": "JSW Steel Ltd",
  "total_amount": 650000.00,
  "status": "SENT",
  "line_items": [
    { "sku_code": "STL-JSW-002", "quantity_ordered": 100, "unit_price": 6500.00 }
  ]
}
```

#### 6.2 Goods Received Notes (GRN)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/grns` | List all GRNs |
| POST | `/api/grns` | Create GRN against PO |
| POST | `/api/grns/:id/approve` | Approve and update inventory |

**GRN Workflow (Gate-Level Verification):**
1. Goods arrive at warehouse gate
2. Staff creates GRN linked to original PO
3. Physical count recorded: `quantity_received`, `quantity_rejected`
4. Batch numbers assigned for traceability
5. Discrepancies flagged immediately (received 90 vs ordered 100)

```json
{
  "grn_number": "GRN-1735380100000",
  "po_id": "uuid-of-po",
  "line_items": [
    { 
      "sku_id": "uuid", 
      "quantity_received": 90, 
      "quantity_rejected": 5,
      "batch_number": "BATCH-JSW-2025-001"
    }
  ]
}
```

#### 6.3 Invoices & 3-Way Matching

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/invoices` | List all invoices |
| POST | `/api/invoices` | Enter invoice, triggers auto-matching |
| GET | `/api/invoices/matches` | View match results with variances |
| POST | `/api/invoices/:id/approve` | Approve for payment |

**3-Way Match Workflow:**
1. Vendor sends invoice
2. Finance enters invoice details
3. System automatically compares:
   - **PO Total:** What we ordered (₹6,50,000)
   - **GRN Total:** What we received (₹5,85,000 for 90 units)
   - **Invoice Total:** What vendor is charging (₹6,50,000)
4. Variance detected: ₹65,000 discrepancy
5. Status: `DISCREPANCY` — requires investigation before payment

```json
{
  "match_status": "DISCREPANCY",
  "po_total": 650000.00,
  "grn_total": 585000.00,
  "invoice_total": 650000.00,
  "amount_variance": 65000.00,
  "discrepancy_notes": "Vendor invoiced for 100 units, only 90 received"
}
```

**Business Impact:** Prevents payment leakage, ensures vendor accountability, maintains accurate cost records.

---

### 7. Authentication Endpoints — Secure Access Control

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/login` | Authenticate and get JWT token |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Get current user profile |

**Implementation:** Uses Supabase Auth with JWT tokens. In production, tokens should be stored in httpOnly cookies for security.

---

### Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Descriptive error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (authentication required) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Assumptions & Hardcoded Values

### Authentication
- Default user emails: `user@insyd.ai`, `procurement@insyd.ai`
- No email verification (development mode)
- Session tokens in localStorage (production: httpOnly cookies)

### Procurement
- PO numbers: `PO-{timestamp}`
- GRN numbers: `GRN-{timestamp}`
- Invoice matching tolerance: ₹0.01

### Inventory
- Batch format: `BATCH-2025-001`
- Bin format: `WH01-ASL01-RK01-BN01`
- ABC thresholds: A (70-80% value), B (15-25%), C (5-10%)

### Seed Data
- 3 warehouses: Delhi (WH01), Mumbai (WH02), Bangalore (WH03)
- 15 SKUs: 6 AEC materials + 9 Stanley Black & Decker tools
- Vendors: JSW Steel, Somany Ceramics, DeWalt, Craftsman, Stanley

### Business Logic
- Soft allocation prevents overselling (24hr expiry, not enforced in prototype)
- Dead stock: No transactions in last 50 records
- Overstocked: 2x (safety_stock + reorder_level)

---

## Author

Akshat Sinha - [GitHub](https://github.com/akshatsinha0)

---

*Built for Insyd SDE Intern Assignment - December 2025*
