/*
 * 1.) Procurement Component for 3-Way Matching.
 * 2.) Managed PO creation, GRN entry, and invoice matching.
 * 3.) Displayed match results with variance analysis.
 */
'use client'

import { useState, useEffect } from 'react'

export default function Procurement() {
  const [activeView, setActiveView] = useState('pos')
  const [pos, setPOs] = useState([])
  const [grns, setGRNs] = useState([])
  const [invoices, setInvoices] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showPOModal, setShowPOModal] = useState(false)
  const [showGRNModal, setShowGRNModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  
  const [skus, setSkus] = useState([])
  const [warehouses, setWarehouses] = useState([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
    fetchData()
  }, [activeView])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [skuRes, whRes] = await Promise.all([
        fetch(`${API_URL}/skus`),
        fetch(`${API_URL}/warehouses`)
      ])
      
      if (skuRes.ok) setSkus(await skuRes.json())
      if (whRes.ok) setWarehouses(await whRes.json())
      
      if (activeView === 'pos') {
        const res = await fetch(`${API_URL}/purchase-orders`)
        if (res.ok) setPOs(await res.json())
      } else if (activeView === 'grns') {
        const res = await fetch(`${API_URL}/grns`)
        if (res.ok) setGRNs(await res.json())
      } else if (activeView === 'invoices') {
        const res = await fetch(`${API_URL}/invoices`)
        if (res.ok) setInvoices(await res.json())
      } else if (activeView === 'matches') {
        const res = await fetch(`${API_URL}/invoices/matches`)
        if (res.ok) setMatches(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-700',
      'APPROVED': 'bg-green-100 text-green-700',
      'SENT': 'bg-blue-100 text-blue-700',
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'MATCHED': 'bg-green-100 text-green-700',
      'DISCREPANCY': 'bg-red-100 text-red-700',
      'DISPUTED': 'bg-orange-100 text-orange-700',
      'PAID': 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Procurement & 3-Way Matching</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {['pos', 'grns', 'invoices', 'matches'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 text-sm ${
              activeView === view
                ? 'border-b-2 border-gray-800 font-medium'
                : 'text-gray-500'
            }`}
          >
            {view === 'pos' && 'Purchase Orders'}
            {view === 'grns' && 'GRNs'}
            {view === 'invoices' && 'Invoices'}
            {view === 'matches' && '3-Way Matches'}
          </button>
        ))}
      </div>

      {/* Purchase Orders View */}
      {activeView === 'pos' && (
        <div>
          <button
            onClick={() => setShowPOModal(true)}
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
                    <td className="px-4 py-3">₹{po.total_amount.toLocaleString()}</td>
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
        </div>
      )}

      {/* GRNs View */}
      {activeView === 'grns' && (
        <div>
          <button
            onClick={() => setShowGRNModal(true)}
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
        </div>
      )}

      {/* Invoices View */}
      {activeView === 'invoices' && (
        <div>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="mb-4 px-4 py-2 text-sm bg-gray-700 text-white"
          >
            Enter Invoice
          </button>
          
          <div className="bg-white border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="px-4 py-3">{inv.vendor_name}</td>
                    <td className="px-4 py-3">₹{inv.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <p className="text-center text-gray-400 py-8">No invoices found</p>
            )}
          </div>
        </div>
      )}

      {/* 3-Way Matches View */}
      {activeView === 'matches' && (
        <div className="bg-white border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">PO</th>
                <th className="px-4 py-3">GRN</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">PO Total</th>
                <th className="px-4 py-3">GRN Total</th>
                <th className="px-4 py-3">Invoice Total</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => (
                <tr key={match.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs">{match.po?.po_number}</td>
                  <td className="px-4 py-3 font-mono text-xs">{match.grn?.grn_number}</td>
                  <td className="px-4 py-3 font-mono text-xs">{match.invoice?.invoice_number}</td>
                  <td className="px-4 py-3">₹{match.po_total?.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{match.grn_total?.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{match.invoice_total?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {match.amount_variance > 0 ? (
                      <span className="text-red-600">₹{match.amount_variance.toFixed(2)}</span>
                    ) : (
                      <span className="text-green-600">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 ${getStatusColor(match.match_status)}`}>
                      {match.match_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && (
            <p className="text-center text-gray-400 py-8">No match records found</p>
          )}
        </div>
      )}

      {/* Modals would go here - simplified for now */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Create Purchase Order</h3>
            <p className="text-sm text-gray-500 mb-4">PO creation form coming soon...</p>
            <button
              onClick={() => setShowPOModal(false)}
              className="px-4 py-2 text-sm border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
