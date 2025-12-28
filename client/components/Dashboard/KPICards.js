/*
 * 1.) Primary KPI Cards Component.
 * 2.) Displayed total SKUs, stock, allocations, and inventory value.
 */
export default function KPICards({ metrics }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="bg-white p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase">Total SKUs</p>
        <p className="text-2xl font-semibold">{metrics.totalItems}</p>
        <p className="text-xs text-gray-400 mt-1">Unique items tracked</p>
      </div>
      <div className="bg-white p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase">Total Stock</p>
        <p className="text-2xl font-semibold">{metrics.totalQuantity.toLocaleString()}</p>
        <p className="text-xs text-green-600 mt-1">{metrics.availableQuantity.toLocaleString()} available</p>
      </div>
      <div className="bg-white p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase">Allocated</p>
        <p className="text-2xl font-semibold">{metrics.allocatedQuantity.toLocaleString()}</p>
        <p className="text-xs text-blue-600 mt-1">{metrics.allocationRate}% utilization</p>
      </div>
      <div className="bg-white p-4 border border-gray-200">
        <p className="text-xs text-gray-500 uppercase">Inventory Value</p>
        <p className="text-2xl font-semibold">₹{(metrics.totalValue / 100000).toFixed(1)}L</p>
        <p className="text-xs text-gray-400 mt-1">₹{(metrics.allocatedValue / 100000).toFixed(1)}L locked</p>
      </div>
    </div>
  )
}
