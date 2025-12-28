/*
 * 1.) Inventory Filters Component.
 * 2.) Provided search and category filtering controls.
 */
export default function InventoryFilters({ filter, setFilter, categoryFilter, setCategoryFilter }) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        placeholder="Search SKU..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 w-64"
      />
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300"
      >
        <option value="">All Categories</option>
        <option value="A">Category A (High Value)</option>
        <option value="B">Category B (Medium)</option>
        <option value="C">Category C (Low Value)</option>
      </select>
    </div>
  )
}
