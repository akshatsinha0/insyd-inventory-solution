# Refactoring Notes

## Files Requiring Refactoring (>100 lines)

### Client Components

1. **Procurement.js** (555 lines)
   - Should be split into:
     - `Procurement/index.js` - Main component
     - `Procurement/POModal.js` - Purchase Order creation modal
     - `Procurement/GRNModal.js` - GRN creation modal
     - `Procurement/InvoiceModal.js` - Invoice entry modal
     - `Procurement/MatchesTable.js` - 3-way match results table
     - `Procurement/hooks/useProcurement.js` - Data fetching logic

2. **OnboardingTour.js** (387 lines)
   - Should be split into:
     - `OnboardingTour/index.js` - Main tour component
     - `OnboardingTour/TourSteps.js` - Step definitions
     - `OnboardingTour/CurvyArrow.js` - Arrow SVG component
     - `OnboardingTour/TourCard.js` - Tour card UI component

3. **Shipments.js** (252 lines)
   - Should be split into:
     - `Shipments/index.js` - Main component
     - `Shipments/ASNModal.js` - Advanced Shipping Notice modal
     - `Shipments/ShipmentsTable.js` - Shipments list table

4. **AuthModal.js** (226 lines)
   - Should be split into:
     - `Auth/AuthModal.js` - Main modal
     - `Auth/LoginForm.js` - Login form
     - `Auth/SignupForm.js` - Signup form
     - `Auth/EyeIcon.js` - Password visibility icon

5. **Dashboard.js** (221 lines)
   - Should be split into:
     - `Dashboard/index.js` - Main component
     - `Dashboard/KPICards.js` - Primary KPI cards
     - `Dashboard/AlertCards.js` - Critical alerts section
     - `Dashboard/CategoryBreakdown.js` - ABC classification
     - `Dashboard/WarehouseDistribution.js` - Warehouse stats
     - `Dashboard/RecentTransactions.js` - Transaction table

6. **InventoryList.js** (187 lines)
   - Should be split into:
     - `Inventory/InventoryList.js` - Main component
     - `Inventory/InventoryTable.js` - Table component
     - `Inventory/AllocationModal.js` - Soft allocation modal
     - `Inventory/hooks/useInventory.js` - Data fetching logic

7. **Scanner.js** (182 lines)
   - Should be split into:
     - `Scanner/index.js` - Main component
     - `Scanner/ScanResult.js` - Scan result display
     - `Scanner/ActionForm.js` - Receive/Allocate form

## Recommended Folder Structure

```
client/components/
├── Auth/
│   ├── AuthModal.js
│   ├── LoginForm.js
│   ├── SignupForm.js
│   └── EyeIcon.js
├── Dashboard/
│   ├── index.js
│   ├── KPICards.js
│   ├── AlertCards.js
│   ├── CategoryBreakdown.js
│   ├── WarehouseDistribution.js
│   └── RecentTransactions.js
├── Inventory/
│   ├── InventoryList.js
│   ├── InventoryTable.js
│   ├── AllocationModal.js
│   └── hooks/
│       └── useInventory.js
├── Procurement/
│   ├── index.js
│   ├── POModal.js
│   ├── GRNModal.js
│   ├── InvoiceModal.js
│   ├── MatchesTable.js
│   └── hooks/
│       └── useProcurement.js
├── Scanner/
│   ├── index.js
│   ├── ScanResult.js
│   └── ActionForm.js
├── Shipments/
│   ├── index.js
│   ├── ASNModal.js
│   └── ShipmentsTable.js
├── OnboardingTour/
│   ├── index.js
│   ├── TourSteps.js
│   ├── CurvyArrow.js
│   └── TourCard.js
├── shared/
│   ├── FloatingInput.js
│   ├── Sidebar.js
│   ├── StockAlert.js
│   └── Transactions.js
└── WarehouseSelector.js
```

## Benefits of Refactoring

1. **Maintainability**: Smaller files are easier to understand and modify
2. **Reusability**: Extracted components can be reused across the app
3. **Testing**: Smaller components are easier to unit test
4. **Performance**: Code splitting can improve initial load time
5. **Collaboration**: Multiple developers can work on different components simultaneously

## Priority

- **High**: Procurement.js (555 lines) - Most complex component
- **Medium**: OnboardingTour.js (387 lines) - Can be split into logical sections
- **Low**: Other components - Can be refactored incrementally

## Notes

This refactoring was deferred to maintain project timeline. The current monolithic structure works functionally but should be refactored for production deployment.
