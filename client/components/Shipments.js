/*
 * 1.) Shipments Component for 3PL Tracking.
 * 2.) Displayed in-transit inventory from vendors.
 * 3.) Simulated webhook status updates.
 * 4.) Used floating label inputs for ASN creation.
 */
'use client'

import { useState, useEffect } from 'react'
import FloatingInput from './FloatingInput'

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    sku_id: '',
    warehouse_id: '',
    quantity: '',
    vendor_name: '',
    tracking_number: '',
    expected_arrival: ''
  })
  const [skus, setSkus] = useState([])
  const [warehouses, setWarehouses] = useState([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [shipRes, skuRes, whRes] = await Promise.all([
        fetch(`${API_URL}/shipments`),
        fetch(`${API_URL}/skus`),
        fetch(`${API_URL}/warehouses`)
      ])
      
      if (shipRes.ok) setShipments(await shipRes.json())
      if (skuRes.ok) setSkus(await skuRes.json())
      if (whRes.ok) setWarehouses(await whRes.json())
    } catch (error) {
      console.error('Failed to fetch:', error)
    }
    setLoading(false)
  }

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
        setShowCreateModal(false)
        setFormData({
          sku_id: '',
          warehouse_id: '',
          quantity: '',
          vendor_name: '',
          tracking_number: '',
          expected_arrival: ''
        })
        fetchData()
      }
    } catch (error) {
      alert('Failed to create shipment')
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/shipments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const simulateWebhook = async (trackingNumber, status) => {
    try {
      const res = await fetch(`${API_URL}/shipments/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          status,
          location: status === 'DELIVERED' ? 'Warehouse' : 'In Transit Hub',
          timestamp: new Date().toISOString()
        })
      })
      
      if (res.ok) {
        fetchData()
        if (status === 'DELIVERED') {
          alert('Goods received and inventory updated!')
        }
      }
    } catch (error) {
      alert('Webhook simulation failed')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPATCHED': return 'bg-yellow-100 text-yellow-700'
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-700'
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-700'
      case 'DELIVERED': return 'bg-green-100 text-green-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const inTransitCount = shipments.filter(s => 
    ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)
  ).length

  if (loading) return <p className="text-gray-500">Loading shipments...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Shipments (3PL Tracking)</h2>
          <p className="text-sm text-gray-500">{inTransitCount} shipments in transit</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm bg-gray-700 text-white"
        >
          Create ASN
        </button>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(shipment => (
              <tr key={shipment.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{shipment.tracking_number}</td>
                <td className="px-4 py-3">{shipment.sku?.name || shipment.sku?.sku_code}</td>
                <td className="px-4 py-3">{shipment.vendor_name}</td>
                <td className="px-4 py-3">{shipment.quantity}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {shipment.expected_arrival ? new Date(shipment.expected_arrival).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  {shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED' && (
                    <select
                      onChange={(e) => simulateWebhook(shipment.tracking_number, e.target.value)}
                      className="text-xs border border-gray-200 px-2 py-1"
                      defaultValue=""
                    >
                      <option value="" disabled>Update Status</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 && (
          <p className="text-center text-gray-400 py-8">No shipments found</p>
        )}
      </div>

      {/* Create ASN Modal */}
      {showCreateModal && (
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
                onClick={() => setShowCreateModal(false)}
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
      )}
    </div>
  )
}
