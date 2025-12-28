/*
 * 1.) ABC Category Breakdown Component.
 * 2.) Displayed distribution of items across categories A, B, C.
 */
export default function CategoryBreakdown({ categoryBreakdown }) {
  return (
    <div className="bg-white p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-3">ABC Classification</h3>
      <div className="space-y-2">
        {['A', 'B', 'C'].map(cat => (
          <div key={cat} className="flex items-center justify-between">
            <span className="text-sm">
              Category {cat}
              <span className="text-xs text-gray-400 ml-2">
                {cat === 'A' ? '(High Value)' : cat === 'B' ? '(Medium)' : '(Low Value)'}
              </span>
            </span>
            <span className="font-medium">{categoryBreakdown[cat] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
