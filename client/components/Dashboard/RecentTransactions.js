/*
 * 1.) Recent Transactions Component.
 * 2.) Displayed last 5 transactions with type, SKU, quantity, and timestamp.
 */
export default function RecentTransactions({ transactions }) {
  return (
    <div className="bg-white p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="pb-2">Type</th>
            <th className="pb-2">SKU</th>
            <th className="pb-2">Qty</th>
            <th className="pb-2">Reference</th>
            <th className="pb-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id} className="border-t border-gray-100">
              <td className="py-2">
                <span className={`text-xs px-2 py-0.5 ${
                  tx.type === 'RECEIVE' ? 'bg-green-100 text-green-700' :
                  tx.type === 'ALLOCATE' ? 'bg-blue-100 text-blue-700' :
                  tx.type === 'SHIP' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {tx.type}
                </span>
              </td>
              <td className="py-2 font-mono text-xs">{tx.sku?.sku_code || '-'}</td>
              <td className="py-2">{tx.quantity}</td>
              <td className="py-2 text-gray-500 text-xs">{tx.reference_number || '-'}</td>
              <td className="py-2 text-gray-400 text-xs">
                {new Date(tx.created_at).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
