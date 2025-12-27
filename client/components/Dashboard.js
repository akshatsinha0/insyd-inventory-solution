/*
 * 1.) Dashboard Component.
 * 2.) Displayed KPI metrics and category breakdown.
 * 3.) Showed low stock alerts and recent transactions.
 */
export default function Dashboard({ inventory, transactions, warehouses }) {
  // Calculate metrics
  const totalItems = inventory.length
  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const allocatedQuantity = inventory.reduce((sum, item) => sum + (item.allocated_quantity || 0), 0)
  
  // Category breakdown
  const categoryBreakdown = inventory.reduce((acc, item) => {
    const cat = item.sku?.category?.code || 'Unknown'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  // Low stock items (below reorder level)
  const lowStockItems = inventory.filter(item => {
    const available = item.quantity - item.allocated_quantity
    return available <= (item.sku?.reorder_level || 0)
  })

  // Recent transactions
  const recentTx = transactions.slice(0, 5)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Total SKUs</p>
          <p className="text-2xl font-semibold">{totalItems}</p>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Total Stock</p>
          <p className="text-2xl font-semibold">{totalQuantity.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Allocated</p>
          <p className="text-2xl font-semibold">{allocatedQuantity.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Warehouses</p>
          <p className="text-2xl font-semibold">{warehouses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
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

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 border border-gray-200">
          <h3 className="text-sm font-medium mb-3">Low Stock Alerts</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-gray-400">No low stock items</p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.sku?.name || item.sku?.sku_code}</span>
                  <span className="text-red-600 font-medium">
                    {item.quantity - item.allocated_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6 bg-white p-4 border border-gray-200">
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
                <td className="py-2">{tx.sku?.sku_code || '-'}</td>
                <td className="py-2">{tx.quantity}</td>
                <td className="py-2 text-gray-500">{tx.reference_number || '-'}</td>
                <td className="py-2 text-gray-400">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
