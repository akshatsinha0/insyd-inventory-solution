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
│   ├── components/        # React components
│   └── lib/               # Utilities
├── server/                # ExpressJS backend
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   └── middleware/        # Auth, validation
└── database/              # Supabase schema
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

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/signup` | Create new user account | `{ email, password, name }` | `{ user: { id, email, name }, token }` |
| POST | `/api/auth/login` | Authenticate user | `{ email, password }` | `{ user: { id, email, name }, token }` |
| POST | `/api/auth/logout` | End user session | - | `{ message: "Logged out successfully" }` |
| GET | `/api/auth/me` | Get current user | Header: `Authorization: Bearer <token>` | `{ user: { id, email, name } }` |

**Example Response (Login):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@insyd.ai",
    "name": "Akshat Sinha"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Inventory Endpoints

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/inventory` | List all inventory items | `warehouse_id`, `category` | Array of inventory objects with SKU, warehouse, bin details |
| GET | `/api/inventory/:id` | Get single inventory item | - | Single inventory object with full details |
| POST | `/api/inventory` | Add new inventory item | `{ sku_id, warehouse_id, bin_location_id, quantity, batch_number }` | Created inventory object |
| PUT | `/api/inventory/:id` | Update inventory quantity | `{ quantity, notes }` | Updated inventory object |
| POST | `/api/inventory/:id/allocate` | Soft allocate stock | `{ quantity, reference_number, expires_in_hours }` | Allocation object |
| POST | `/api/inventory/:id/receive` | Receive goods (GRN) | `{ quantity, reference_number, notes }` | Updated inventory object |

**Example Response (GET /api/inventory):**
```json
[
  {
    "id": 1,
    "sku_id": 1,
    "warehouse_id": 1,
    "bin_location_id": 1,
    "quantity": 100,
    "allocated_quantity": 20,
    "batch_number": "BATCH-2025-001",
    "sku": {
      "id": 1,
      "sku_code": "MAR-ITL-001",
      "name": "Italian Carrara Marble",
      "unit": "SQM",
      "unit_price": 15000.00,
      "category": {
        "code": "A",
        "name": "High Value"
      }
    },
    "warehouse": {
      "code": "WH01",
      "name": "Delhi Central Warehouse"
    },
    "bin_location": {
      "aisle": "ASL01",
      "rack": "RK01",
      "bin": "BN01",
      "zone": "FAST-PICK"
    }
  }
]
```

**Example Response (POST /api/inventory/:id/allocate):**
```json
{
  "id": 5,
  "inventory_id": 1,
  "quantity": 10,
  "reference_number": "SO-2025-001",
  "status": "PENDING",
  "expires_at": "2025-12-29T12:00:00Z",
  "created_at": "2025-12-28T12:00:00Z"
}
```

### Transaction Endpoints

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/transactions` | Get transaction log | `sku_id`, `warehouse_id`, `type`, `limit` | Array of transaction objects |
| GET | `/api/transactions/:id` | Get single transaction | - | Single transaction object |
| POST | `/api/transactions` | Create manual transaction | `{ inventory_id, sku_id, warehouse_id, type, quantity, reference_number, notes }` | Created transaction object |

**Example Response (GET /api/transactions):**
```json
[
  {
    "id": 1,
    "inventory_id": 1,
    "sku_id": 1,
    "warehouse_id": 1,
    "type": "RECEIVE",
    "quantity": 100,
    "reference_number": "GRN-2025-001",
    "notes": "Goods received from vendor",
    "performed_by": "warehouse@insyd.ai",
    "created_at": "2025-12-28T10:30:00Z",
    "sku": {
      "sku_code": "MAR-ITL-001",
      "name": "Italian Carrara Marble"
    },
    "warehouse": {
      "code": "WH01",
      "name": "Delhi Central Warehouse"
    }
  }
]
```

### Shipment Endpoints (3PL Integration)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/shipments` | List all shipments | Query: `status` | Array of shipment objects |
| POST | `/api/shipments` | Create ASN (Advanced Shipping Notice) | `{ sku_id, warehouse_id, quantity, vendor_name, tracking_number, expected_arrival }` | Created shipment object |
| POST | `/api/shipments/webhook` | Webhook for 3PL status updates | `{ tracking_number, status, location, timestamp }` | `{ success: true, shipment }` |
| PUT | `/api/shipments/:id/status` | Manual status update | `{ status, location }` | Updated shipment object |
| GET | `/api/shipments/in-transit` | Get in-transit summary | - | Summary with total shipments, units, value |

**Example Response (GET /api/shipments):**
```json
[
  {
    "id": 1,
    "sku_id": 2,
    "warehouse_id": 1,
    "quantity": 50,
    "vendor_name": "JSW Steel",
    "tracking_number": "DEL-2025-001",
    "status": "IN_TRANSIT",
    "current_location": "Transit Hub Delhi",
    "expected_arrival": "2025-12-30",
    "created_at": "2025-12-28T08:00:00Z",
    "sku": {
      "sku_code": "STL-JSW-002",
      "name": "JSW Steel Rebar 12mm"
    },
    "warehouse": {
      "code": "WH01",
      "name": "Delhi Central Warehouse"
    }
  }
]
```

**Example Response (GET /api/shipments/in-transit):**
```json
{
  "total_shipments": 3,
  "total_units": 150,
  "total_value": 975000.00,
  "shipments": [...]
}
```

### Procurement Endpoints (3-Way Matching)

#### Purchase Orders

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/purchase-orders` | List all purchase orders | Query: `status` | Array of PO objects with line items |
| GET | `/api/purchase-orders/:id` | Get single PO | - | PO object with full details |
| POST | `/api/purchase-orders` | Create new PO | `{ vendor_name, warehouse_id, expected_delivery, notes, created_by, line_items }` | Created PO object |
| POST | `/api/purchase-orders/:id/approve` | Approve PO | `{ approved_by }` | Updated PO object |
| POST | `/api/purchase-orders/:id/send` | Send PO to vendor | - | Updated PO object |

**Example Response (POST /api/purchase-orders):**
```json
{
  "id": 1,
  "po_number": "PO-1735380000000",
  "vendor_name": "JSW Steel Ltd",
  "warehouse_id": 1,
  "total_amount": 650000.00,
  "status": "DRAFT",
  "expected_delivery": "2026-01-05",
  "created_by": "procurement@insyd.ai",
  "created_at": "2025-12-28T12:00:00Z"
}
```

#### Goods Received Notes (GRN)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/grns` | List all GRNs | - | Array of GRN objects |
| POST | `/api/grns` | Create GRN from PO | `{ po_id, warehouse_id, received_by, notes, line_items }` | Created GRN object |
| POST | `/api/grns/:id/approve` | Approve GRN and update inventory | - | Updated GRN object |

**Example Response (POST /api/grns):**
```json
{
  "id": 1,
  "grn_number": "GRN-1735380100000",
  "po_id": 1,
  "warehouse_id": 1,
  "received_by": "warehouse@insyd.ai",
  "status": "PENDING",
  "created_at": "2025-12-28T13:00:00Z"
}
```

#### Invoices

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/invoices` | List all invoices | Query: `status` | Array of invoice objects |
| POST | `/api/invoices` | Enter invoice and trigger 3-way match | `{ invoice_number, po_id, grn_id, vendor_name, invoice_date, due_date, tax_amount, line_items }` | Created invoice object |
| POST | `/api/invoices/:id/approve` | Approve matched invoice for payment | `{ approved_by }` | Updated invoice object |
| GET | `/api/invoices/matches` | Get 3-way match results | - | Array of match objects |

**Example Response (GET /api/invoices/matches):**
```json
[
  {
    "id": 1,
    "po_id": 1,
    "grn_id": 1,
    "invoice_id": 1,
    "match_status": "MATCHED",
    "po_total": 650000.00,
    "grn_total": 650000.00,
    "invoice_total": 650000.00,
    "quantity_variance": 0,
    "amount_variance": 0.00,
    "discrepancy_notes": null,
    "created_at": "2025-12-28T14:00:00Z",
    "po": {
      "po_number": "PO-1735380000000",
      "vendor_name": "JSW Steel Ltd"
    },
    "grn": {
      "grn_number": "GRN-1735380100000"
    },
    "invoice": {
      "invoice_number": "INV-JSW-2025-001",
      "total_amount": 650000.00
    }
  }
]
```

### Warehouse Endpoints

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/warehouses` | List all active warehouses | - | Array of warehouse objects |
| GET | `/api/warehouses/:id` | Get warehouse with bin locations | - | Warehouse object with bins |
| GET | `/api/warehouses/:id/bins` | Get bin locations for warehouse | `zone`, `available` | Array of bin location objects |
| POST | `/api/warehouses` | Create new warehouse | `{ code, name, address, city }` | Created warehouse object |

**Example Response (GET /api/warehouses):**
```json
[
  {
    "id": 1,
    "code": "WH01",
    "name": "Delhi Central Warehouse",
    "address": "123 Industrial Area, Okhla",
    "city": "Delhi",
    "is_active": true,
    "created_at": "2025-12-28T00:00:00Z"
  }
]
```

### SKU Endpoints

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/skus` | List all SKUs | `search`, `category` | Array of SKU objects |
| GET | `/api/skus/:id` | Get single SKU | - | SKU object with category details |

**Example Response (GET /api/skus):**
```json
[
  {
    "id": 1,
    "sku_code": "MAR-ITL-001",
    "name": "Italian Carrara Marble",
    "description": "Premium white marble from Carrara, Italy. 20mm thickness.",
    "category_id": 1,
    "unit": "SQM",
    "unit_price": 15000.00,
    "reorder_level": 50,
    "safety_stock": 20,
    "category": {
      "code": "A",
      "name": "High Value",
      "description": "Premium materials requiring daily/weekly audits"
    }
  }
]
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

## Assumptions & Hardcoded Values

This prototype includes the following assumptions and hardcoded values for demonstration purposes:

### Authentication
- Default user email format: `user@insyd.ai` or `procurement@insyd.ai`
- No email verification required (Supabase Auth configured for development)
- Session tokens stored in localStorage (production should use httpOnly cookies)

### Procurement
- Default created_by: `procurement@insyd.ai`
- PO numbers auto-generated as: `PO-{timestamp}`
- GRN numbers auto-generated as: `GRN-{timestamp}`
- Invoice matching tolerance: ₹0.01 (1 paisa variance allowed)

### Inventory
- Default batch number format: `BATCH-2025-001` or `BATCH-SBD-2025`
- Bin location format: `WH01-ASL01-RK01-BN01` (Warehouse-Aisle-Rack-Bin)
- ABC categorization thresholds:
  - Category A: 70-80% of value, 20% of items
  - Category B: 15-25% of value, 30% of items
  - Category C: 5-10% of value, 50% of items

### Seed Data
- 3 warehouses: Delhi (WH01), Mumbai (WH02), Bangalore (WH03)
- 15 SKUs: 6 AEC materials + 9 Stanley Black & Decker tools
- Sample vendors: JSW Steel, Somany Ceramics, DeWalt, Craftsman, Stanley
- Initial stock quantities: Category A (100 units), B (500 units), C (1000 units)

### API & Database
- Backend API: `https://insyd-inventory-api.onrender.com/api`
- CORS origins: localhost:3000, localhost:3002, *.vercel.app
- Render free tier: Server spins down after 15 minutes of inactivity

### UI/UX
- Currency: Indian Rupees (₹)
- Date format: Locale-based (DD/MM/YYYY for India)
- Allocation expiry: 24 hours (not enforced in prototype)
- Onboarding tour: Shown once, stored in localStorage as `insyd_tour_completed`

### Business Logic
- Soft allocation prevents overselling but doesn't enforce time limits
- Dead stock detection: Items with no transactions in last 50 records
- Overstocked threshold: 2x (safety_stock + reorder_level)
- 3-way matching: Compares PO, GRN, and Invoice totals with variance tracking

## Author

Akshat Sinha - [GitHub](https://github.com/akshatsinha0)

---

*Built for Insyd SDE Intern Assignment - December 2025*
