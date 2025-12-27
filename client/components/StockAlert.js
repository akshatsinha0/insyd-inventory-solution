/*
 * 1.) Stock Alert Component.
 * 2.) Detected items below reorder level.
 * 3.) Flagged dead stock with no movement in 90+ days.
 */
'use client'

export default function StockAlert({ inventory }) {
  // Find items below reorder level
  const lowStock = inventory.filter(item => {
    const available = item.quantity - item.allocated_quantity
    const reorderLevel = item.sku?.reorder_level || 0
    return available <= reorderLevel && reorderLevel > 0
  })

  // Find dead stock (no movement in 90 days - simulated)
  const deadStock = inventory.filter(item => {
    const lastCounted = item.last_counted_at ? new Date(item.last_counted_at) : null
    if (!lastCounted) return false
    const daysSince = (Date.now() - lastCounted.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince > 90
  })

  if (lowStock.length === 0 && deadStock.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 mb-2">
          <p className="text-sm font-medium text-yellow-800">
            Low Stock Alert: {lowStock.length} item(s) below reorder level
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {lowStock.slice(0, 3).map(i => i.sku?.sku_code).join(', ')}
            {lowStock.length > 3 && ` +${lowStock.length - 3} more`}
          </p>
        </div>
      )}
      
      {deadStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-3">
          <p className="text-sm font-medium text-red-800">
            Dead Stock Alert: {deadStock.length} item(s) flagged as dead stock
          </p>
          <p className="text-xs text-red-600 mt-1">
            No movement in 90+ days. Consider liquidation.
          </p>
        </div>
      )}
    </div>
  )
}
