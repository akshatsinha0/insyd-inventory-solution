/*
 * 1.) Tab Navigation Component.
 * 2.) Rendered procurement section tabs.
 * 3.) Handled active tab highlighting and switching.
 */

const tabs = [
  { id: 'pos', label: 'Purchase Orders' },
  { id: 'grns', label: 'GRNs' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'matches', label: '3-Way Matches' }
]

export default function TabNavigation({ activeView, setActiveView }) {
  return (
    <div className="flex gap-2 mb-4 border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveView(tab.id)}
          className={`px-4 py-2 text-sm ${
            activeView === tab.id
              ? 'border-b-2 border-gray-800 font-medium'
              : 'text-gray-500'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
