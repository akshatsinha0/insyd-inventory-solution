/*
 * 1.) Create ASN Modal Component.
 * 2.) Form for creating Advanced Shipping Notices with floating inputs.
 */
'use client'

import { useState } from 'react'
import FloatingInput from '../FloatingInput'

export default function CreateASNModal({ skus, warehouses, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    sku_id: '',
    warehouse_id: '',
    quantity: '',
    vendor_name: '',
    tracking_number: '',
    expected_arrival: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        })
      })
      
      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      alert('Failed to create shipment')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-96 border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Create Advanced Shipping Notice</h3>
        
        <FloatingInput
          label="SKU"
          value={formData.sku_id}
          onChange={(e) => setFormData({...formData, sku_id: e.target.value})}
          options={skus.map(s => ({ value: s.id, label: `${s.sku_code} - ${s.name}` }))}
        />
        <FloatingInput
          label="Destination Warehouse"
          value={formData.warehouse_id}
          onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
          options={warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))}
        />
        <FloatingInput
          label="Quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          placeholder="e.g., 100"
        />
        <FloatingInput
          label="Vendor Name"
          value={formData.vendor_name}
          onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
          placeholder="e.g., JSW Steel, Somany Ceramics"
        />
        <FloatingInput
          label="Tracking Number"
          value={formData.tracking_number}
          onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
          placeholder="e.g., DEL-2025-001"
        />
        <FloatingInput
          label="Expected Arrival"
          type="date"
          value={formData.expected_arrival}
          onChange={(e) => setFormData({...formData, expected_arrival: e.target.value})}
        />
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 text-sm bg-gray-700 text-white"
          >
            Create ASN
          </button>
        </div>
      </div>
    </div>
  )
}
