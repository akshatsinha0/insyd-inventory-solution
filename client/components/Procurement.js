/*
 * 1.) Procurement Component for 3-Way Matching.
 * 2.) Implemented full PO and GRN creation workflows.
 * 3.) Used floating label inputs with animated placeholders.
 * 4.) Displayed match results with variance analysis.
 */
'use client'

import { useState, useEffect } from 'react'
import FloatingInput from './FloatingInput'

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
  
  const [poForm, setPOForm] = useState({
    vendor_name: '',
    warehouse_id: '',
    expected_delivery: '',
    notes: '',
    line_items: [{ sku_id: '', quantity_ordered: '', unit_price: '' }]
  })
  
  const [grnForm, setGRNForm] = useState({
    po_id: '',
    warehouse_id: '',
    received_by: '',
    notes: '',
    line_items: []
  })

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

  const handleCreatePO = async () => {
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
        setShowPOModal(false)
        setPOForm({
          vendor_name: '',
          warehouse_id: '',
          expected_delivery: '',
          notes: '',
          line_items: [{ sku_id: '', quantity_ordered: '', unit_price: '' }]
        })
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create PO')
      }
    } catch (error) {
      alert('Failed to create PO')
    }
  }


  const handleCreateGRN = async () => {
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
        setShowGRNModal(false)
        setGRNForm({
          po_id: '',
          warehouse_id: '',
          received_by: '',
          notes: '',
          line_items: []
        })
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create GRN')
      }
    } catch (error) {
      alert('Failed to create GRN')
    }
  }

  const handlePOSelect = async (poId) => {
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

  const addPOLineItem = () => {
    setPOForm({
      ...poForm,
      line_items: [...poForm.line_items, { sku_id: '', quantity_ordered: '', unit_price: '' }]
    })
  }

  const updatePOLineItem = (index, field, value) => {
    const updated = [...poForm.line_items]
    updated[index][field] = value
    if (field === 'sku_id') {
      const sku = skus.find(s => s.id === value)
      if (sku) updated[index].unit_price = sku.unit_price
    }
    setPOForm({ ...poForm, line_items: updated })
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
                    <td className="px-4 py-3">₹{Number(inv.total_amount).toLocaleString()}</td>
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
                  <td className="px-4 py-3">₹{Number(match.po_total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">₹{Number(match.grn_total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">₹{Number(match.invoice_total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {match.amount_variance > 0 ? (
                      <span className="text-red-600">₹{Number(match.amount_variance).toFixed(2)}</span>
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


      {/* Create PO Modal */}
      {showPOModal && (
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
                <button onClick={addPOLineItem} className="text-xs text-blue-600">+ Add Item</button>
              </div>
              
              {poForm.line_items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={item.sku_id}
                    onChange={(e) => updatePOLineItem(idx, 'sku_id', e.target.value)}
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
                    onChange={(e) => updatePOLineItem(idx, 'quantity_ordered', e.target.value)}
                    placeholder="Quantity"
                    className="px-2 py-2 border border-gray-300 text-sm"
                  />
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updatePOLineItem(idx, 'unit_price', e.target.value)}
                    placeholder="Unit Price"
                    className="px-2 py-2 border border-gray-300 text-sm"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowPOModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300">
                Cancel
              </button>
              <button onClick={handleCreatePO} className="flex-1 px-4 py-2 text-sm bg-gray-700 text-white">
                Create PO
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Create GRN Modal */}
      {showGRNModal && (
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

            {grnForm.line_items.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Items to Receive</h4>
                {grnForm.line_items.map((item, idx) => {
                  const sku = skus.find(s => s.id === item.sku_id)
                  return (
                    <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-center">
                      <span className="text-sm">{sku?.sku_code || 'Unknown'}</span>
                      <input
                        type="number"
                        value={item.quantity_received}
                        onChange={(e) => {
                          const updated = [...grnForm.line_items]
                          updated[idx].quantity_received = parseInt(e.target.value) || 0
                          updated[idx].quantity_accepted = parseInt(e.target.value) || 0
                          setGRNForm({...grnForm, line_items: updated})
                        }}
                        placeholder="Qty Received"
                        className="px-2 py-2 border border-gray-300 text-sm"
                      />
                      <input
                        type="number"
                        value={item.quantity_rejected}
                        onChange={(e) => {
                          const updated = [...grnForm.line_items]
                          updated[idx].quantity_rejected = parseInt(e.target.value) || 0
                          updated[idx].quantity_accepted = updated[idx].quantity_received - (parseInt(e.target.value) || 0)
                          setGRNForm({...grnForm, line_items: updated})
                        }}
                        placeholder="Rejected"
                        className="px-2 py-2 border border-gray-300 text-sm"
                      />
                      <input
                        type="text"
                        value={item.batch_number}
                        onChange={(e) => {
                          const updated = [...grnForm.line_items]
                          updated[idx].batch_number = e.target.value
                          setGRNForm({...grnForm, line_items: updated})
                        }}
                        placeholder="e.g., BATCH-2025-001"
                        className="px-2 py-2 border border-gray-300 text-sm"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            <FloatingInput
              label="Notes"
              value={grnForm.notes}
              onChange={(e) => setGRNForm({...grnForm, notes: e.target.value})}
              placeholder="e.g., 5 units damaged during transit"
              className="mt-4"
            />
            
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowGRNModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300">
                Cancel
              </button>
              <button onClick={handleCreateGRN} className="flex-1 px-4 py-2 text-sm bg-gray-700 text-white">
                Create GRN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
