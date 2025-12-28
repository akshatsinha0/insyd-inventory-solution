/*
 * 1.) GRN Line Items Component.
 * 2.) Rendered list of items to receive with quantity inputs.
 * 3.) Handled quantity received, rejected, and batch number entry.
 */
'use client'

export default function GRNLineItems({ lineItems, skus, onUpdateLineItem }) {
  if (lineItems.length === 0) return null

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Items to Receive</h4>
      {lineItems.map((item, idx) => {
        const sku = skus.find(s => s.id === item.sku_id)
        return (
          <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-center">
            <span className="text-sm">{sku?.sku_code || 'Unknown'}</span>
            <input
              type="number"
              value={item.quantity_received}
              onChange={(e) => onUpdateLineItem(idx, 'quantity_received', e.target.value)}
              placeholder="Qty Received"
              className="px-2 py-2 border border-gray-300 text-sm"
            />
            <input
              type="number"
              value={item.quantity_rejected}
              onChange={(e) => onUpdateLineItem(idx, 'quantity_rejected', e.target.value)}
              placeholder="Rejected"
              className="px-2 py-2 border border-gray-300 text-sm"
            />
            <input
              type="text"
              value={item.batch_number}
              onChange={(e) => onUpdateLineItem(idx, 'batch_number', e.target.value)}
              placeholder="e.g., BATCH-2025-001"
              className="px-2 py-2 border border-gray-300 text-sm"
            />
          </div>
        )
      })}
    </div>
  )
}
