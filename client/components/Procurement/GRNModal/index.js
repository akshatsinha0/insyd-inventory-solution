/*
 * 1.) GRN Modal Component.
 * 2.) Rendered GRN creation form with line items.
 * 3.) Managed form state and PO selection.
 */
'use client'

import { useState } from 'react'
import FloatingInput from '../../FloatingInput'
import GRNLineItems from './GRNLineItems'

export default function GRNModal({ pos, skus, onClose, onCreate }) {
  const [grnForm, setGRNForm] = useState({
    po_id: '',
    warehouse_id: '',
    received_by: '',
    notes: '',
    line_items: []
  })

  const handlePOSelect = (poId) => {
    const selectedPO = pos.find(p => p.id === poId)
    if (selectedPO) {
      setGRNForm({
        ...grnForm,
        po_id: poId,
        warehouse_id: selectedPO.warehouse_id,
        line_items: selectedPO.line_items?.map(li => ({
          po_line_item_id: li.id,
          sku_id: li.sku_id,
          quantity_received: li.quantity_ordered - (li.quantity_received || 0),
          quantity_accepted: li.quantity_ordered - (li.quantity_received || 0),
          quantity_rejected: 0,
          batch_number: ''
        })) || []
      })
    }
  }

  const updateLineItem = (index, field, value) => {
    const updated = [...grnForm.line_items]
    updated[index][field] = value
    if (field === 'quantity_rejected') {
      updated[index].quantity_accepted = updated[index].quantity_received - (parseInt(value) || 0)
    }
    setGRNForm({ ...grnForm, line_items: updated })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Create Goods Received Note</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            label="Select Purchase Order"
            value={grnForm.po_id}
            onChange={(e) => handlePOSelect(e.target.value)}
            options={pos.filter(p => p.status === 'SENT' || p.status === 'APPROVED').map(p => ({ 
              value: p.id, 
              label: `${p.po_number} - ${p.vendor_name}` 
            }))}
          />
          <FloatingInput
            label="Received By"
            value={grnForm.received_by}
            onChange={(e) => setGRNForm({...grnForm, received_by: e.target.value})}
            placeholder="e.g., Warehouse Manager"
          />
        </div>

        <GRNLineItems 
          lineItems={grnForm.line_items}
          skus={skus}
          onUpdateLineItem={updateLineItem}
        />

        <FloatingInput
          label="Notes"
          value={grnForm.notes}
          onChange={(e) => setGRNForm({...grnForm, notes: e.target.value})}
          placeholder="e.g., 5 units damaged during transit"
          className="mt-4"
        />
        
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300">
            Cancel
          </button>
          <button onClick={() => onCreate(grnForm)} className="flex-1 px-4 py-2 text-sm bg-gray-700 text-white">
            Create GRN
          </button>
        </div>
      </div>
    </div>
  )
}
