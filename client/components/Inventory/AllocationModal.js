/*
 * 1.) Allocation Modal Component.
 * 2.) Handled soft allocation of inventory items.
 */
'use client'

import { useState } from 'react'

export default function AllocationModal({ item, onClose, onSuccess }) {
  const [allocateQty, setAllocateQty] = useState('')
  const [allocateRef, setAllocateRef] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleAllocate = async () => {
    if (!allocateQty || !allocateRef) return
    
    try {
      const res = await fetch(`${API_URL}/inventory/${item.id}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(allocateQty),
          reference_number: allocateRef
        })
      })
      
      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.json()
        alert(error.error || 'Allocation failed')
      }
    } catch (error) {
      alert('Failed to allocate')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 w-96 border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Soft Allocate Stock</h3>
        <p className="text-sm text-gray-600 mb-4">
          {item.sku?.name}<br />
          <span className="text-xs text-gray-400">
            Available: {item.quantity - item.allocated_quantity} {item.sku?.unit}
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
              max={item.quantity - item.allocated_quantity}
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
            onClick={onClose}
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
  )
}
