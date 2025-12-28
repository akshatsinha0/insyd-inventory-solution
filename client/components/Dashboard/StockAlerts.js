/*
 * 1.) Stock Alerts Component.
 * 2.) Displayed critical stock alerts for out of stock and low stock items.
 */
export default function StockAlerts({ lowStockItems, outOfStockItems }) {
  return (
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
  )
}
