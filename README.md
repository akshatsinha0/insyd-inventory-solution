# Insyd Inventory Solution

> A unified inventory management system for AEC (Architecture, Engineering, and Construction) material businesses. Built with NextJS + ExpressJS stack to eliminate data latency and enable real-time inventory visibility.

## 🚀 Live Demo

- **Frontend (App)**: [https://insyd-inventory-solution.vercel.app](https://insyd-inventory-solution.vercel.app)
- **Backend (API)**: [https://insyd-inventory-api.onrender.com/api](https://insyd-inventory-api.onrender.com/api)
- **Database**: Supabase PostgreSQL (Cloud)
- **GitHub Repository**: [https://github.com/akshatsinha0/insyd-inventory-solution](https://github.com/akshatsinha0/insyd-inventory-solution)

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

### Inventory Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all inventory items |
| POST | `/api/inventory` | Add new inventory item |
| PUT | `/api/inventory/:id` | Update inventory item |
| POST | `/api/inventory/:id/allocate` | Soft allocate stock |
| POST | `/api/inventory/:id/receive` | Receive goods (GRN) |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get transaction log |
| POST | `/api/transactions` | Log new transaction |

### Shipment Endpoints (3PL Integration)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipments` | List all shipments |
| POST | `/api/shipments` | Create ASN (Advanced Shipping Notice) |
| POST | `/api/shipments/webhook` | Webhook for 3PL status updates |
| PUT | `/api/shipments/:id/status` | Manual status update |
| GET | `/api/shipments/in-transit` | Get in-transit summary |

### Procurement Endpoints (3-Way Matching)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders` | List all purchase orders |
| POST | `/api/purchase-orders` | Create new PO |
| POST | `/api/purchase-orders/:id/approve` | Approve PO |
| GET | `/api/grns` | List all GRNs |
| POST | `/api/grns` | Create GRN from PO |
| POST | `/api/grns/:id/approve` | Approve GRN and update inventory |
| GET | `/api/invoices` | List all invoices |
| POST | `/api/invoices` | Enter invoice and trigger 3-way match |
| POST | `/api/invoices/:id/approve` | Approve matched invoice for payment |
| GET | `/api/invoices/matches` | Get 3-way match results |

## License

MIT License - See LICENSE file for details.

## Author

Akshat Sinha - [GitHub](https://github.com/akshatsinha0)

---

*Built for Insyd SDE Intern Assignment - December 2025*
