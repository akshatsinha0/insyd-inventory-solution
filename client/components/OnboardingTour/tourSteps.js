/*
 * 1.) Tour Steps Configuration.
 * 2.) Defined all tour steps with positions and content.
 * 3.) Exported as reusable data structure.
 */

export const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Insyd Inventory',
    description: 'Your unified platform for AEC material management. Let us show you around.',
    subtext: 'This tour takes about 30 seconds',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null
  },
  {
    id: 'sidebar',
    title: 'Navigation Panel',
    description: 'Access all modules from here. Switch between Dashboard, Inventory, Transactions, and Scanner with a single click.',
    subtext: 'Tip: The active section is highlighted in blue',
    position: { top: '150px', left: '260px' },
    spotlight: { top: '60px', left: '0', width: '224px', height: '200px' },
    arrow: { type: 'left', top: '30px', left: '-50px' }
  },
  {
    id: 'dashboard-stats',
    title: 'Real-Time KPIs',
    description: 'Monitor your inventory health at a glance. Total SKUs, stock levels, allocations, and warehouse count update in real-time.',
    subtext: 'These metrics sync with your Supabase database instantly',
    position: { top: '120px', left: '400px' },
    spotlight: { top: '80px', left: '240px', width: '600px', height: '120px' },
    arrow: { type: 'up', top: '-45px', left: '120px' }
  },
  {
    id: 'abc-classification',
    title: 'ABC Classification',
    description: 'Materials are categorized by value. Category A (high-value) items like Italian Marble need daily audits, while Category C consumables use visual control.',
    subtext: 'Based on the Pareto Principle: 20% of items = 80% of value',
    position: { top: '280px', left: '300px' },
    spotlight: { top: '220px', left: '240px', width: '350px', height: '180px' },
    arrow: { type: 'up-right', top: '-40px', left: '50px' }
  },
  {
    id: 'inventory-table',
    title: 'Inventory Management',
    description: 'View all SKUs with bin locations, quantities, and allocation status. Filter by category or search by name.',
    subtext: 'Bin format: WH01-ASL01-RK01-BN01 (Warehouse-Aisle-Rack-Bin)',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'inventory'
  },
  {
    id: 'soft-allocation',
    title: 'Soft Allocation',
    description: 'Click "Allocate" to reserve stock for a sales order. This creates an atomic lock preventing overselling while the order is processed.',
    subtext: 'Allocations expire after 24 hours if not confirmed',
    position: { top: '200px', left: '500px' },
    spotlight: { top: '150px', left: '750px', width: '150px', height: '60px' },
    arrow: { type: 'right', top: '20px', left: '280px' }
  },
  {
    id: 'transactions',
    title: 'Audit Trail',
    description: 'Every inventory movement is logged here. Track RECEIVE, ALLOCATE, SHIP, and ADJUST transactions with timestamps.',
    subtext: 'Essential for cycle counting and compliance',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'transactions'
  },
  {
    id: 'transaction-types',
    title: 'Transaction Types',
    description: 'Color-coded badges help identify transaction types quickly. Green for receiving, blue for allocations, orange for shipments.',
    subtext: 'Filter by type to analyze specific movements',
    position: { top: '180px', left: '350px' },
    spotlight: { top: '130px', left: '240px', width: '200px', height: '200px' },
    arrow: { type: 'up', top: '-45px', left: '80px' }
  },
  {
    id: 'shipments',
    title: '3PL Shipment Tracking',
    description: 'Track in-transit inventory from vendors. Create Advanced Shipping Notices (ASN) and receive webhook updates from logistics providers.',
    subtext: 'Eliminates the "black box" between dispatch and delivery',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'shipments'
  },
  {
    id: 'shipments-asn',
    title: 'Advanced Shipping Notice',
    description: 'Create ASN when vendors dispatch goods. Track status from DISPATCHED to IN_TRANSIT to DELIVERED. Inventory auto-updates on delivery confirmation.',
    subtext: 'Simulate webhook updates using the status dropdown',
    position: { top: '200px', left: '400px' },
    spotlight: { top: '130px', left: '240px', width: '600px', height: '200px' },
    arrow: { type: 'up', top: '-45px', left: '120px' }
  },
  {
    id: 'scanner',
    title: 'QR/Barcode Scanner',
    description: 'Simulate warehouse floor operations. Enter a SKU code to receive goods or allocate stock, just like scanning a physical barcode.',
    subtext: 'Try: MAR-ITL-001, DWT-DRL-001, or STN-TPM-001',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'scanner'
  },
  {
    id: 'scanner-workflow',
    title: 'Receiving Workflow',
    description: 'When goods arrive, scan the SKU, select "Receive Goods", enter quantity and PO reference. The system updates inventory and logs the transaction.',
    subtext: 'Three-Way Match: PO vs Invoice vs Physical Count',
    position: { top: '200px', left: '450px' },
    spotlight: { top: '100px', left: '260px', width: '400px', height: '350px' },
    arrow: { type: 'up-left', top: '-40px', left: '150px' }
  },
  {
    id: 'complete',
    title: 'You are all set!',
    description: 'Start managing your inventory with confidence. The system ensures 99% accuracy through real-time sync and atomic transactions.',
    subtext: 'Need help? Check the README on GitHub',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'dashboard'
  }
]
