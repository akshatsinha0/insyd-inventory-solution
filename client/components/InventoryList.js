/*
 * 1.) Inventory List Component.
 * 2.) Rendered filterable inventory table.
 * 3.) Implemented soft allocation modal.
 * 4.) Displayed bin location codes.
 */
'use client'

import { useState } from 'react'

export default function InventoryList({ inventory, onRefresh }) {
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [allocateQty, setAllocateQty] = useState('')
  const [allocateRef, setAllocateRef] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !filter || 
      item.sku?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      item.sku?.sku_code?.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = !categoryFilter || item.sku?.category?.code === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAllocate = async () => {
    if (!selectedItem || !allocateQty || !allocateRef) return
    
    try {
      const res = await fetch(`${API_URL}/inventory/${selectedItem.id}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(allocateQty),
          reference_number: allocateRef
        })
      })
      
      if (res.ok) {
        setSelectedItem(null)
        setAllocateQty('')
        setAllocateRef('')
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Allocation failed')
      }
    } catch (error) {
      alert('Failed to allocate')
    }
  }

  const getBinCode = (item) => {
    if (!item.bin_location || !item.warehouse) return '-'
    const bin = item.bin_location
    return `${item.warehouse.code}-${bin.aisle}-${bin.rack}-${bin.bin}`
  }

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

      {/* Filters */}
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

      {/* Inventory Table */}
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
            {filteredInventory.map(item => (
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
                    onClick={() => setSelectedItem(item)}
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

      {/* Allocate Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 w-96 border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Soft Allocate Stock</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedItem.sku?.name}<br />
              <span className="text-xs text-gray-400">
                Available: {selectedItem.quantity - selectedItem.allocated_quantity} {selectedItem.sku?.unit}
              </span>
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Quantity</label>
                <input
                  type="number"
                  value={allocateQty}
                  onChange={(e) => setAllocateQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-sm"
                  max={selectedItem.quantity - selectedItem.allocated_quantity}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Reference Number</label>
                <input
                  type="text"
                  value={allocateRef}
                  onChange={(e) => setAllocateRef(e.target.value)}
                  placeholder="e.g., SO-2025-001"
                  className="w-full px-3 py-2 border border-gray-300 text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                className="flex-1 px-4 py-2 text-sm bg-gray-700 text-white"
              >
                Allocate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
