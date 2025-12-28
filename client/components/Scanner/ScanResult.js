/*
 * 1.) Scan Result Component.
 * 2.) Displayed scanned SKU details and action form.
 */
'use client'

import { useState } from 'react'

export default function ScanResult({ scanResult, onSuccess }) {
  const [action, setAction] = useState('receive')
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleAction = async () => {
    if (!scanResult?.inventory || !quantity) return
    setLoading(true)

    try {
      const endpoint = action === 'receive' 
        ? `${API_URL}/inventory/${scanResult.inventory.id}/receive`
        : `${API_URL}/inventory/${scanResult.inventory.id}/allocate`
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          reference_number: reference || `SCAN-${Date.now()}`
        })
      })

      if (res.ok) {
        alert(`${action === 'receive' ? 'Received' : 'Allocated'} successfully`)
        onSuccess()
      } else {
        const error = await res.json()
        alert(error.error || 'Action failed')
      }
    } catch (error) {
      alert('Action failed')
    }
    setLoading(false)
  }

  if (scanResult.error) {
    return (
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-red-600 text-sm">{scanResult.error}</p>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="mb-4">
        <p className="font-medium">{scanResult.sku?.name}</p>
        <p className="text-xs text-gray-500 font-mono">{scanResult.sku?.sku_code}</p>
        <p className="text-sm text-gray-600 mt-1">
          Category: {scanResult.sku?.category?.code} | 
          Unit: {scanResult.sku?.unit}
        </p>
        {scanResult.inventory && (
          <p className="text-sm mt-2">
            Current Stock: <span className="font-medium">{scanResult.inventory.quantity}</span>
            {scanResult.inventory.allocated_quantity > 0 && (
              <span className="text-blue-600 ml-2">
                ({scanResult.inventory.allocated_quantity} allocated)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          >
            <option value="receive">Receive Goods (GRN)</option>
            <option value="allocate">Soft Allocate</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="PO/GRN number"
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          />
        </div>
        <button
          onClick={handleAction}
          disabled={loading || !quantity}
          className="w-full px-4 py-2 bg-green-600 text-white text-sm mt-2"
        >
          {action === 'receive' ? 'Receive Stock' : 'Allocate Stock'}
        </button>
      </div>
    </div>
  )
}
