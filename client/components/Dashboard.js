/*
 * 1.) Dashboard Component with Enhanced KPIs.
 * 2.) Displayed real-time metrics, inventory health, and financial insights.
 * 3.) Added dead stock detection, turnover rate, and allocation efficiency.
 * 4.) Showed critical alerts and warehouse-wise breakdown.
 */
export default function Dashboard({ inventory, transactions, warehouses }) {
  // Calculate core metrics
  const totalItems = inventory.length
  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const allocatedQuantity = inventory.reduce((sum, item) => sum + (item.allocated_quantity || 0), 0)
  const availableQuantity = totalQuantity - allocatedQuantity
  
  // Calculate inventory value
  const totalValue = inventory.reduce((sum, item) => {
    const qty = item.quantity || 0
    const price = item.sku?.unit_price || 0
    return sum + (qty * price)
  }, 0)
  
  // Calculate allocated value (capital locked)
  const allocatedValue = inventory.reduce((sum, item) => {
    const qty = item.allocated_quantity || 0
    const price = item.sku?.unit_price || 0
    return sum + (qty * price)
  }, 0)
  
  // Dead stock detection (no movement in recent transactions)
  const recentSkuIds = new Set(
    transactions.slice(0, 50).map(tx => tx.sku_id).filter(Boolean)
  )
  const deadStockItems = inventory.filter(item => 
    !recentSkuIds.has(item.sku_id) && item.quantity > 0
  )
  const deadStockValue = deadStockItems.reduce((sum, item) => 
    sum + ((item.quantity || 0) * (item.sku?.unit_price || 0)), 0
  )
  
  // Allocation efficiency (how much stock is actively allocated vs sitting idle)
  const allocationRate = totalQuantity > 0 
    ? ((allocatedQuantity / totalQuantity) * 100).toFixed(1)
    : 0
  
  // Category breakdown
  const categoryBreakdown = inventory.reduce((acc, item) => {
    const cat = item.sku?.category?.code || 'Unknown'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  // Low stock items (below reorder level)
  const lowStockItems = inventory.filter(item => {
    const available = item.quantity - item.allocated_quantity
    return available <= (item.sku?.reorder_level || 0) && available > 0
  })
  
  // Out of stock items
  const outOfStockItems = inventory.filter(item => 
    (item.quantity - item.allocated_quantity) <= 0
  )
  
  // Overstocked items (above safety stock + reorder level)
  const overstockedItems = inventory.filter(item => {
    const available = item.quantity - item.allocated_quantity
    const threshold = (item.sku?.safety_stock || 0) + (item.sku?.reorder_level || 0)
    return available > threshold * 2
  })

  // Recent transactions
  const recentTx = transactions.slice(0, 5)
  
  // Warehouse-wise breakdown
  const warehouseStats = warehouses.map(wh => {
    const whInventory = inventory.filter(item => item.warehouse_id === wh.id)
    const whQty = whInventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
    return { name: wh.code, quantity: whQty }
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      
      {/* Primary KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Total SKUs</p>
          <p className="text-2xl font-semibold">{totalItems}</p>
          <p className="text-xs text-gray-400 mt-1">Unique items tracked</p>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Total Stock</p>
          <p className="text-2xl font-semibold">{totalQuantity.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">{availableQuantity.toLocaleString()} available</p>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Allocated</p>
          <p className="text-2xl font-semibold">{allocatedQuantity.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">{allocationRate}% utilization</p>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Inventory Value</p>
          <p className="text-2xl font-semibold">₹{(totalValue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-gray-400 mt-1">₹{(allocatedValue / 100000).toFixed(1)}L locked</p>
        </div>
      </div>
      
      {/* Critical Alerts */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 border border-red-200">
          <p className="text-xs text-red-600 uppercase font-medium">Out of Stock</p>
          <p className="text-2xl font-semibold text-red-700">{outOfStockItems.length}</p>
          <p className="text-xs text-red-500 mt-1">Immediate action needed</p>
        </div>
        <div className="bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 uppercase font-medium">Low Stock</p>
          <p className="text-2xl font-semibold text-yellow-700">{lowStockItems.length}</p>
          <p className="text-xs text-yellow-500 mt-1">Below reorder level</p>
        </div>
        <div className="bg-orange-50 p-4 border border-orange-200">
          <p className="text-xs text-orange-600 uppercase font-medium">Dead Stock</p>
          <p className="text-2xl font-semibold text-orange-700">{deadStockItems.length}</p>
          <p className="text-xs text-orange-500 mt-1">₹{(deadStockValue / 100000).toFixed(1)}L tied up</p>
        </div>
        <div className="bg-purple-50 p-4 border border-purple-200">
          <p className="text-xs text-purple-600 uppercase font-medium">Overstocked</p>
          <p className="text-2xl font-semibold text-purple-700">{overstockedItems.length}</p>
          <p className="text-xs text-purple-500 mt-1">Excess inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* ABC Category Breakdown */}
        <div className="bg-white p-4 border border-gray-200">
          <h3 className="text-sm font-medium mb-3">ABC Classification</h3>
          <div className="space-y-2">
            {['A', 'B', 'C'].map(cat => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm">
                  Category {cat}
                  <span className="text-xs text-gray-400 ml-2">
                    {cat === 'A' ? '(High Value)' : cat === 'B' ? '(Medium)' : '(Low Value)'}
                  </span>
                </span>
                <span className="font-medium">{categoryBreakdown[cat] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Distribution */}
        <div className="bg-white p-4 border border-gray-200">
          <h3 className="text-sm font-medium mb-3">Warehouse Distribution</h3>
          <div className="space-y-2">
            {warehouseStats.map(wh => (
              <div key={wh.name} className="flex items-center justify-between">
                <span className="text-sm">{wh.name}</span>
                <span className="font-medium">{wh.quantity.toLocaleString()} units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 border border-gray-200">
          <h3 className="text-sm font-medium mb-3">Critical Stock Alerts</h3>
          {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
            <p className="text-sm text-gray-400">All stock levels healthy</p>
          ) : (
            <div className="space-y-2">
              {outOfStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-red-600">{item.sku?.sku_code}</span>
                  <span className="text-red-700 font-medium text-xs">OUT</span>
                </div>
              ))}
              {lowStockItems.slice(0, 2).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.sku?.sku_code}</span>
                  <span className="text-yellow-600 font-medium">
                    {item.quantity - item.allocated_quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-4 border border-gray-200">
        <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="pb-2">Type</th>
              <th className="pb-2">SKU</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Reference</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentTx.map(tx => (
              <tr key={tx.id} className="border-t border-gray-100">
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 ${
                    tx.type === 'RECEIVE' ? 'bg-green-100 text-green-700' :
                    tx.type === 'ALLOCATE' ? 'bg-blue-100 text-blue-700' :
                    tx.type === 'SHIP' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-2 font-mono text-xs">{tx.sku?.sku_code || '-'}</td>
                <td className="py-2">{tx.quantity}</td>
                <td className="py-2 text-gray-500 text-xs">{tx.reference_number || '-'}</td>
                <td className="py-2 text-gray-400 text-xs">
                  {new Date(tx.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
