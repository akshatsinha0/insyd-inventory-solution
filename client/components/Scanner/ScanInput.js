/*
 * 1.) Scan Input Component.
 * 2.) Provided SKU code input field with scan button.
 */
export default function ScanInput({ scanInput, setScanInput, onScan, loading }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-gray-500 uppercase">SKU Code</label>
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value.toUpperCase())}
          placeholder="e.g., MAR-ITL-001"
          className="flex-1 px-3 py-2 border border-gray-300 text-sm font-mono"
          onKeyDown={(e) => e.key === 'Enter' && onScan()}
        />
        <button
          onClick={onScan}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white text-sm"
        >
          Scan
        </button>
      </div>
    </div>
  )
}
