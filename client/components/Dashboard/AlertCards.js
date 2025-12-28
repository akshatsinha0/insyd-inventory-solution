/*
 * 1.) Critical Alert Cards Component.
 * 2.) Displayed out of stock, low stock, dead stock, and overstocked alerts.
 */
export default function AlertCards({ metrics }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-red-50 p-4 border border-red-200">
        <p className="text-xs text-red-600 uppercase font-medium">Out of Stock</p>
        <p className="text-2xl font-semibold text-red-700">{metrics.outOfStockItems.length}</p>
        <p className="text-xs text-red-500 mt-1">Immediate action needed</p>
      </div>
      <div className="bg-yellow-50 p-4 border border-yellow-200">
        <p className="text-xs text-yellow-600 uppercase font-medium">Low Stock</p>
        <p className="text-2xl font-semibold text-yellow-700">{metrics.lowStockItems.length}</p>
        <p className="text-xs text-yellow-500 mt-1">Below reorder level</p>
      </div>
      <div className="bg-orange-50 p-4 border border-orange-200">
        <p className="text-xs text-orange-600 uppercase font-medium">Dead Stock</p>
        <p className="text-2xl font-semibold text-orange-700">{metrics.deadStockItems.length}</p>
        <p className="text-xs text-orange-500 mt-1">₹{(metrics.deadStockValue / 100000).toFixed(1)}L tied up</p>
      </div>
      <div className="bg-purple-50 p-4 border border-purple-200">
        <p className="text-xs text-purple-600 uppercase font-medium">Overstocked</p>
        <p className="text-2xl font-semibold text-purple-700">{metrics.overstockedItems.length}</p>
        <p className="text-xs text-purple-500 mt-1">Excess inventory</p>
      </div>
    </div>
  )
}
