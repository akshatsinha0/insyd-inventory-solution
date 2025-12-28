/*
 * 1.) Status Utility Functions.
 * 2.) Provided status color mapping for badges.
 * 3.) Centralized status styling logic.
 */

export function getStatusColor(status) {
  const colors = {
    'DRAFT': 'bg-gray-100 text-gray-700',
    'APPROVED': 'bg-green-100 text-green-700',
    'SENT': 'bg-blue-100 text-blue-700',
    'PENDING': 'bg-yellow-100 text-yellow-700',
    'MATCHED': 'bg-green-100 text-green-700',
    'DISCREPANCY': 'bg-red-100 text-red-700',
    'DISPUTED': 'bg-orange-100 text-orange-700',
    'PAID': 'bg-purple-100 text-purple-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
