/*
 * 1.) Shipments Table Component.
 * 2.) Displayed shipment details with status updates and webhook simulation.
 */
'use client'

export default function ShipmentsTable({ shipments, onRefresh }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

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
        onRefresh()
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

  return (
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
  )
}
