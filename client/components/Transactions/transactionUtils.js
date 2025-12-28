/*
 * 1.) Transaction Utility Functions.
 * 2.) Provided filtering and styling logic.
 * 3.) Centralized transaction type color mapping.
 */

export function filterTransactions(transactions, typeFilter) {
  return transactions.filter(tx => {
    return !typeFilter || tx.type === typeFilter
  })
}

export function getTransactionTypeColor(type) {
  const colors = {
    'RECEIVE': 'bg-green-100 text-green-700',
    'ALLOCATE': 'bg-blue-100 text-blue-700',
    'SHIP': 'bg-orange-100 text-orange-700',
    'ADJUST': 'bg-purple-100 text-purple-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}
