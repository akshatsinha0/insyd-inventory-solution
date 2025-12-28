/*
 * 1.) Inventory List Main Component.
 * 2.) Managed filtering, allocation modal, and data refresh.
 */
'use client'

import { useState } from 'react'
import InventoryFilters from './InventoryFilters'
import InventoryTable from './InventoryTable'
import AllocationModal from './AllocationModal'

export default function InventoryList({ inventory, onRefresh }) {
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !filter || 
      item.sku?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      item.sku?.sku_code?.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = !categoryFilter || item.sku?.category?.code === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <button 
          onClick={onRefresh}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-300"
        >
          Refresh
        </button>
      </div>

      <InventoryFilters
        filter={filter}
        setFilter={setFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <InventoryTable
        inventory={filteredInventory}
        onAllocate={setSelectedItem}
      />

      {selectedItem && (
        <AllocationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={() => {
            setSelectedItem(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
