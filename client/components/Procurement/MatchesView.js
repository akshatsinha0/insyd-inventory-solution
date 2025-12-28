/*
 * 1.) 3-Way Matches View Component.
 * 2.) Displayed match results with variance analysis.
 * 3.) Highlighted discrepancies between PO, GRN, and Invoice.
 */

import { getStatusColor } from './statusUtils'

export default function MatchesView({ matches }) {
  return (
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
  )
}
