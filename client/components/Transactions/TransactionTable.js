/*
 * 1.) Transaction Table Component.
 * 2.) Rendered transaction log with color-coded badges.
 * 3.) Displayed transaction details and timestamps.
 */

import TransactionRow from './TransactionRow'

export default function TransactionTable({ transactions }) {
  return (
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
          {transactions.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
