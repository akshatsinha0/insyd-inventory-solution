/*
 * 1.) Warehouse Distribution Component.
 * 2.) Displayed inventory quantities across all warehouses.
 */
export default function WarehouseDistribution({ warehouseStats }) {
  return (
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
  )
}
