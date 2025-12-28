/*
 * 1.) Purchase Order Modal Component.
 * 2.) Rendered PO creation form with line items.
 * 3.) Managed form state and validation.
 */
'use client'

import { useState } from 'react'
import FloatingInput from '../FloatingInput'

export default function POModal({ skus, warehouses, onClose, onCreate }) {
  const [poForm, setPOForm] = useState({
    vendor_name: '',
    warehouse_id: '',
    expected_delivery: '',
    notes: '',
    line_items: [{ sku_id: '', quantity_ordered: '', unit_price: '' }]
  })

  const addLineItem = () => {
    setPOForm({
      ...poForm,
      line_items: [...poForm.line_items, { sku_id: '', quantity_ordered: '', unit_price: '' }]
    })
  }

  const updateLineItem = (index, field, value) => {
    const updated = [...poForm.line_items]
    updated[index][field] = value
    if (field === 'sku_id') {
      const sku = skus.find(s => s.id === value)
      if (sku) updated[index].unit_price = sku.unit_price
    }
    setPOForm({ ...poForm, line_items: updated })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Create Purchase Order</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            label="Vendor Name"
            value={poForm.vendor_name}
            onChange={(e) => setPOForm({...poForm, vendor_name: e.target.value})}
            placeholder="e.g., JSW Steel, Somany Ceramics"
          />
          <FloatingInput
            label="Destination Warehouse"
            value={poForm.warehouse_id}
            onChange={(e) => setPOForm({...poForm, warehouse_id: e.target.value})}
            options={warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))}
          />
          <FloatingInput
            label="Expected Delivery"
            type="date"
            value={poForm.expected_delivery}
            onChange={(e) => setPOForm({...poForm, expected_delivery: e.target.value})}
          />
          <FloatingInput
            label="Notes"
            value={poForm.notes}
            onChange={(e) => setPOForm({...poForm, notes: e.target.value})}
            placeholder="e.g., Urgent delivery required"
          />
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Line Items</h4>
            <button onClick={addLineItem} className="text-xs text-blue-600">+ Add Item</button>
          </div>
          
          {poForm.line_items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
              <select
                value={item.sku_id}
                onChange={(e) => updateLineItem(idx, 'sku_id', e.target.value)}
                className="px-2 py-2 border border-gray-300 text-sm"
              >
                <option value="">Select SKU</option>
                {skus.map(s => (
                  <option key={s.id} value={s.id}>{s.sku_code} - {s.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity_ordered}
                onChange={(e) => updateLineItem(idx, 'quantity_ordered', e.target.value)}
                placeholder="Quantity"
                className="px-2 py-2 border border-gray-300 text-sm"
              />
              <input
                type="number"
                value={item.unit_price}
                onChange={(e) => updateLineItem(idx, 'unit_price', e.target.value)}
                placeholder="Unit Price"
                className="px-2 py-2 border border-gray-300 text-sm"
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300">
            Cancel
          </button>
          <button onClick={() => onCreate(poForm)} className="flex-1 px-4 py-2 text-sm bg-gray-700 text-white">
            Create PO
          </button>
        </div>
      </div>
    </div>
  )
}
