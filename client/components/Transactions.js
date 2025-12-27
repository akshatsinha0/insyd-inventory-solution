'use client'

import { useState } from 'react'

export default function Transactions({ transactions }) {
  const [typeFilter, setTypeFilter] = useState('')

  const filteredTx = transactions.filter(tx => {
    return !typeFilter || tx.type === typeFilter
  })

  const txTypes = ['RECEIVE', 'ALLOCATE', 'DEALLOCATE', 'PICK', 'SHIP', 'ADJUST', 'TRANSFER', 'RETURN']

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Transaction Log</h2>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300"
        >
          <option value="">All Types</option>
          {txTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map(tx => (
              <tr key={tx.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 ${
                    tx.type === 'RECEIVE' ? 'bg-green-100 text-green-700' :
                    tx.type === 'ALLOCATE' ? 'bg-blue-100 text-blue-700' :
                    tx.type === 'SHIP' ? 'bg-orange-100 text-orange-700' :
                    tx.type === 'ADJUST' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{tx.sku?.sku_code || '-'}</td>
                <td className="px-4 py-3">{tx.warehouse?.code || '-'}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                </td>
                <td className="px-4 py-3 text-gray-500">{tx.reference_number || '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-xs">
                  {tx.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTx.length === 0 && (
        <p className="text-center text-gray-400 py-8">No transactions found</p>
      )}
    </div>
  )
}
