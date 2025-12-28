/*
 * 1.) Shipments Main Component for 3PL Tracking.
 * 2.) Managed shipment creation, status updates, and webhook simulation.
 */
'use client'

import { useState, useEffect } from 'react'
import ShipmentsTable from './ShipmentsTable'
import CreateASNModal from './CreateASNModal'

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
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

      <ShipmentsTable
        shipments={shipments}
        onRefresh={fetchData}
      />

      {showCreateModal && (
        <CreateASNModal
          skus={skus}
          warehouses={warehouses}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
