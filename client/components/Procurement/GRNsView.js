/*
 * 1.) Goods Received Notes View Component.
 * 2.) Displayed GRN list and creation modal.
 * 3.) Handled GRN creation workflow.
 */
'use client'

import { useState } from 'react'
import GRNModal from './GRNModal'
import { getStatusColor } from './statusUtils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function GRNsView({ grns, pos, skus, warehouses, onRefresh }) {
  const [showModal, setShowModal] = useState(false)

  const handleCreateGRN = async (grnForm) => {
    try {
      const res = await fetch(`${API_URL}/grns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...grnForm,
          line_items: grnForm.line_items.filter(li => li.quantity_received > 0)
        })
      })
      
      if (res.ok) {
        setShowModal(false)
        onRefresh()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create GRN')
      }
    } catch (error) {
      alert('Failed to create GRN')
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 text-sm bg-gray-700 text-white"
      >
        Create GRN
      </button>
      
      <div className="bg-white border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">GRN Number</th>
              <th className="px-4 py-3">PO Number</th>
              <th className="px-4 py-3">Received By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {grns.map(grn => (
              <tr key={grn.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{grn.grn_number}</td>
                <td className="px-4 py-3 font-mono text-xs">{grn.po?.po_number}</td>
                <td className="px-4 py-3">{grn.received_by}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 ${getStatusColor(grn.status)}`}>
                    {grn.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(grn.received_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {grns.length === 0 && (
          <p className="text-center text-gray-400 py-8">No GRNs found</p>
        )}
      </div>

      {showModal && (
        <GRNModal
          pos={pos}
          skus={skus}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateGRN}
        />
      )}
    </div>
  )
}
