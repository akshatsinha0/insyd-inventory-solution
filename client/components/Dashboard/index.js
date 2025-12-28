/*
 * 1.) Dashboard Main Component.
 * 2.) Orchestrated all dashboard sections and data flow.
 * 3.) Calculated metrics and distributed to child components.
 */
'use client'

import KPICards from './KPICards'
import AlertCards from './AlertCards'
import CategoryBreakdown from './CategoryBreakdown'
import WarehouseDistribution from './WarehouseDistribution'
import StockAlerts from './StockAlerts'
import RecentTransactions from './RecentTransactions'
import { useDashboardMetrics } from './useDashboardMetrics'

export default function Dashboard({ inventory, transactions, warehouses }) {
  const metrics = useDashboardMetrics(inventory, transactions, warehouses)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      
      <KPICards metrics={metrics} />
      <AlertCards metrics={metrics} />
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <CategoryBreakdown categoryBreakdown={metrics.categoryBreakdown} />
        <WarehouseDistribution warehouseStats={metrics.warehouseStats} />
        <StockAlerts 
          lowStockItems={metrics.lowStockItems}
          outOfStockItems={metrics.outOfStockItems}
        />
      </div>

      <RecentTransactions transactions={metrics.recentTx} />
    </div>
  )
}
