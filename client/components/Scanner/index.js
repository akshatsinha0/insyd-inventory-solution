/*
 * 1.) Scanner Main Component.
 * 2.) Simulated QR/barcode scanning via SKU input.
 */
'use client'

import { useState } from 'react'
import ScanInput from './ScanInput'
import ScanResult from './ScanResult'
import QuickReference from './QuickReference'

export default function Scanner({ onScan }) {
  const [scanInput, setScanInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleScan = async () => {
    if (!scanInput) return
    setLoading(true)
    
    try {
      const res = await fetch(`${API_URL}/skus?search=${encodeURIComponent(scanInput)}`)
      if (res.ok) {
        const skus = await res.json()
        if (skus.length > 0) {
          const invRes = await fetch(`${API_URL}/inventory`)
          if (invRes.ok) {
            const inventory = await invRes.json()
            const item = inventory.find(i => i.sku?.sku_code === skus[0].sku_code)
            setScanResult({ sku: skus[0], inventory: item })
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

  const handleSuccess = () => {
    setScanInput('')
    setScanResult(null)
    onScan()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">QR/Barcode Scanner</h2>
      <p className="text-sm text-gray-500 mb-6">
        Simulate scanning by entering SKU code below
      </p>

      <div className="bg-white border border-gray-200 p-6 max-w-md">
        <ScanInput
          scanInput={scanInput}
          setScanInput={setScanInput}
          onScan={handleScan}
          loading={loading}
        />

        {scanResult && (
          <ScanResult
            scanResult={scanResult}
            onSuccess={handleSuccess}
          />
        )}
      </div>

      <QuickReference />
    </div>
  )
}
