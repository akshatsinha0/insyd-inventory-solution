/*
 * 1.) Inventory Table Component.
 * 2.) Displayed inventory items with bin locations and allocation status.
 */
export default function InventoryTable({ inventory, onAllocate }) {
  const getBinCode = (item) => {
    if (!item.bin_location || !item.warehouse) return '-'
    const bin = item.bin_location
    return `${item.warehouse.code}-${bin.aisle}-${bin.rack}-${bin.bin}`
  }

  return (
    <div className="bg-white border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3">SKU Code</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Bin Location</th>
            <th className="px-4 py-3 text-right">Quantity</th>
            <th className="px-4 py-3 text-right">Allocated</th>
            <th className="px-4 py-3 text-right">Available</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-mono text-xs">{item.sku?.sku_code}</td>
              <td className="px-4 py-3">{item.sku?.name}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 ${
                  item.sku?.category?.code === 'A' ? 'bg-red-100 text-red-700' :
                  item.sku?.category?.code === 'B' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.sku?.category?.code || '-'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{getBinCode(item)}</td>
              <td className="px-4 py-3 text-right">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-blue-600">{item.allocated_quantity}</td>
              <td className="px-4 py-3 text-right font-medium">
                {item.quantity - item.allocated_quantity}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onAllocate(item)}
                  className="text-xs text-green-700 bg-green-100 px-3 py-1 border border-green-200"
                >
                  Allocate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
