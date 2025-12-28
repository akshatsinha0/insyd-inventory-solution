/*
 * 1.) Express Server Entry Point.
 * 2.) Configured CORS and JSON middleware.
 * 3.) Registered all API route handlers.
 * 4.) Added health check endpoint.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const inventoryRoutes = require('./routes/inventory');
const transactionRoutes = require('./routes/transactions');
const warehouseRoutes = require('./routes/warehouses');
const skuRoutes = require('./routes/skus');
const analyticsRoutes = require('./routes/analytics');
const shipmentRoutes = require('./routes/shipments');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const grnRoutes = require('./routes/grns');
const invoiceRoutes = require('./routes/invoices');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://insyd-inventory-solution.vercel.app',
    /\.vercel\.app$/  // Allow any Vercel preview deployments
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/grns', grnRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
