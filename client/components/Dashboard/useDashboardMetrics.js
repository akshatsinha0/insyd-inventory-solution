/*
 * 1.) Custom Hook for Dashboard Metrics Calculation.
 * 2.) Computed all KPIs, alerts, and breakdowns.
 * 3.) Separated business logic from presentation.
 */
export function useDashboardMetrics(inventory, transactions, warehouses) {
  const totalItems = inventory.length
  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const allocatedQuantity = inventory.reduce((sum, item) => sum + (item.allocated_quantity || 0), 0)
  const availableQuantity = totalQuantity - allocatedQuantity
  
  const totalValue = inventory.reduce((sum, item) => {
    const qty = item.quantity || 0
    const price = item.sku?.unit_price || 0
    return sum + (qty * price)
  }, 0)
  
  const allocatedValue = inventory.reduce((sum, item) => {
    const qty = item.allocated_quantity || 0
    const price = item.sku?.unit_price || 0
    return sum + (qty * price)
  }, 0)
  
  const recentSkuIds = new Set(
    transactions.slice(0, 50).map(tx => tx.sku_id).filter(Boolean)
  )
  const deadStockItems = inventory.filter(item => 
    !recentSkuIds.has(item.sku_id) && item.quantity > 0
  )
  const deadStockValue = deadStockItems.reduce((sum, item) => 
    sum + ((item.quantity || 0) * (item.sku?.unit_price || 0)), 0
  )
  
  const allocationRate = totalQuantity > 0 
    ? ((allocatedQuantity / totalQuantity) * 100).toFixed(1)
    : 0
  
  const categoryBreakdown = inventory.reduce((acc, item) => {
    const cat = item.sku?.category?.code || 'Unknown'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const lowStockItems = inventory.filter(item => {
    const available = item.quantity - item.allocated_quantity
    return available <= (item.sku?.reorder_level || 0) && available > 0
  })
  
  const outOfStockItems = inventory.filter(item => 
    (item.quantity - item.allocated_quantity) <= 0
  )
  
  const overstockedItems = inventory.filter(item => {
    const available = item.quantity - item.allocated_quantity
    const threshold = (item.sku?.safety_stock || 0) + (item.sku?.reorder_level || 0)
    return available > threshold * 2
  })

  const recentTx = transactions.slice(0, 5)
  
  const warehouseStats = warehouses.map(wh => {
    const whInventory = inventory.filter(item => item.warehouse_id === wh.id)
    const whQty = whInventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
    return { name: wh.code, quantity: whQty }
  })

  return {
    totalItems,
    totalQuantity,
    allocatedQuantity,
    availableQuantity,
    totalValue,
    allocatedValue,
    deadStockItems,
    deadStockValue,
    allocationRate,
    categoryBreakdown,
    lowStockItems,
    outOfStockItems,
    overstockedItems,
    recentTx,
    warehouseStats
  }
}
