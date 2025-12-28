/*
 * 1.) Invoices View Component.
 * 2.) Displayed invoice list with status badges.
 * 3.) Provided invoice entry functionality.
 */

import { getStatusColor } from './statusUtils'

export default function InvoicesView({ invoices }) {
  return (
    <div>
      <button
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
  )
}
