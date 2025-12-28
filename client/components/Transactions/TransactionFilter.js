/*
 * 1.) Transaction Filter Component.
 * 2.) Rendered dropdown for transaction type filtering.
 * 3.) Provided all transaction type options.
 */

const TX_TYPES = [
  'RECEIVE', 
  'ALLOCATE', 
  'DEALLOCATE', 
  'PICK', 
  'SHIP', 
  'ADJUST', 
  'TRANSFER', 
  'RETURN'
]

export default function TransactionFilter({ typeFilter, setTypeFilter }) {
  return (
    <div className="mb-4">
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300"
      >
        <option value="">All Types</option>
        {TX_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  )
}
