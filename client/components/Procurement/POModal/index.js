/*
 * 1.) Purchase Order Modal Component.
 * 2.) Rendered PO creation form with line items.
 * 3.) Managed form state and validation.
 */
'use client'

import { useState } from 'react'
import FloatingInput from '../../FloatingInput'
import POLineItems from './POLineItems'

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

        <POLineItems
          lineItems={poForm.line_items}
          skus={skus}
          onAddLineItem={addLineItem}
          onUpdateLineItem={updateLineItem}
        />
        
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
