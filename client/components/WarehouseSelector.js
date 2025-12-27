'use client'

export default function WarehouseSelector({ warehouses, selected, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Warehouse:</span>
      <select
        value={selected || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="px-3 py-1.5 text-sm border border-gray-300"
      >
        <option value="">All Warehouses</option>
        {warehouses.map(wh => (
          <option key={wh.id} value={wh.id}>
            {wh.code} - {wh.name}
          </option>
        ))}
      </select>
    </div>
  )
}
