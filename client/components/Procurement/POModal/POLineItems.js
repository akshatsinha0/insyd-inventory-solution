/*
 * 1.) PO Line Items Component.
 * 2.) Rendered list of line items with SKU, quantity, and price inputs.
 * 3.) Handled adding new line items and updating existing ones.
 */
'use client'

export default function POLineItems({ lineItems, skus, onAddLineItem, onUpdateLineItem }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Line Items</h4>
        <button onClick={onAddLineItem} className="text-xs text-blue-600">+ Add Item</button>
      </div>
      
      {lineItems.map((item, idx) => (
        <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
          <select
            value={item.sku_id}
            onChange={(e) => onUpdateLineItem(idx, 'sku_id', e.target.value)}
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
            onChange={(e) => onUpdateLineItem(idx, 'quantity_ordered', e.target.value)}
            placeholder="Quantity"
            className="px-2 py-2 border border-gray-300 text-sm"
          />
          <input
            type="number"
            value={item.unit_price}
            onChange={(e) => onUpdateLineItem(idx, 'unit_price', e.target.value)}
            placeholder="Unit Price"
            className="px-2 py-2 border border-gray-300 text-sm"
          />
        </div>
      ))}
    </div>
  )
}
