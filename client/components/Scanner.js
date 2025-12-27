'use client'

import { useState } from 'react'

export default function Scanner({ onScan }) {
  const [scanInput, setScanInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [action, setAction] = useState('receive')
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleScan = async () => {
    if (!scanInput) return
    setLoading(true)
    
    try {
      // Search for SKU by code
      const res = await fetch(`${API_URL}/skus?search=${encodeURIComponent(scanInput)}`)
      if (res.ok) {
        const skus = await res.json()
        if (skus.length > 0) {
          // Get inventory for this SKU
          const invRes = await fetch(`${API_URL}/inventory`)
          if (invRes.ok) {
            const inventory = await invRes.json()
            const item = inventory.find(i => i.sku?.sku_code === skus[0].sku_code)
            setScanResult({
              sku: skus[0],
              inventory: item
            })
          }
        } else {
          setScanResult({ error: 'SKU not found' })
        }
      }
    } catch (error) {
      setScanResult({ error: 'Scan failed' })
    }
    setLoading(false)
  }

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
        setScanInput('')
        setScanResult(null)
        setQuantity('')
        setReference('')
        onScan()
      } else {
        const error = await res.json()
        alert(error.error || 'Action failed')
      }
    } catch (error) {
      alert('Action failed')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">QR/Barcode Scanner</h2>
      <p className="text-sm text-gray-500 mb-6">
        Simulate scanning by entering SKU code below
      </p>

      {/* Scanner Input */}
      <div className="bg-white border border-gray-200 p-6 max-w-md">
        <div className="mb-4">
          <label className="text-xs text-gray-500 uppercase">SKU Code</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value.toUpperCase())}
              placeholder="e.g., MAR-ITL-001"
              className="flex-1 px-3 py-2 border border-gray-300 text-sm font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm"
            >
              Scan
            </button>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            {scanResult.error ? (
              <p className="text-red-600 text-sm">{scanResult.error}</p>
            ) : (
              <div>
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

                {/* Action Form */}
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
            )}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="mt-6 text-xs text-gray-400">
        <p className="font-medium mb-1">Sample SKU Codes:</p>
        <p>MAR-ITL-001 (Italian Marble) | STL-JSW-002 (Steel Rebar) | TIL-SOM-003 (Ceramic Tiles)</p>
      </div>
    </div>
  )
}
