/*
 * 1.) Transaction Row Component.
 * 2.) Rendered individual transaction record.
 * 3.) Applied type-specific styling and formatting.
 */

import { getTransactionTypeColor } from './transactionUtils'

export default function TransactionRow({ transaction }) {
  const tx = transaction

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(tx.created_at).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 ${getTransactionTypeColor(tx.type)}`}>
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
  )
}
