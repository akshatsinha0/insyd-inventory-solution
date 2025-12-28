/*
 * 1.) Purchase Orders View Component.
 * 2.) Displayed PO list and creation modal.
 * 3.) Handled PO creation workflow.
 */
'use client'

import { useState } from 'react'
import POModal from './POModal'
import { getStatusColor } from './statusUtils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function PurchaseOrdersView({ pos, skus, warehouses, onRefresh }) {
  const [showModal, setShowModal] = useState(false)

  const handleCreatePO = async (poForm) => {
    try {
      const res = await fetch(`${API_URL}/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...poForm,
          created_by: 'procurement@insyd.ai',
          line_items: poForm.line_items.filter(li => li.sku_id && li.quantity_ordered)
        })
      })
      
      if (res.ok) {
        setShowModal(false)
        onRefresh()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create PO')
      }
    } catch (error) {
      alert('Failed to create PO')
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 text-sm bg-gray-700 text-white"
      >
        Create PO
      </button>
      
      <div className="bg-white border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">PO Number</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{po.po_number}</td>
                <td className="px-4 py-3">{po.vendor_name}</td>
                <td className="px-4 py-3">₹{Number(po.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(po.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pos.length === 0 && (
          <p className="text-center text-gray-400 py-8">No purchase orders found</p>
        )}
      </div>

      {showModal && (
        <POModal
          skus={skus}
          warehouses={warehouses}
          onClose={() => setShowModal(false)}
          onCreate={handleCreatePO}
        />
      )}
    </div>
  )
}
