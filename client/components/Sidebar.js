/*
 * 1.) Sidebar Navigation Component.
 * 2.) Rendered tab buttons for main views.
 * 3.) Highlighted active tab state.
 * 4.) Displayed user authentication status.
 */
export default function Sidebar({ activeTab, setActiveTab, user, onAuthClick, onLogout }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'procurement', label: 'Procurement' },
    { id: 'shipments', label: 'Shipments' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'scanner', label: 'Scanner' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col rounded-bl-3xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Task: Insyd Prototype</h2>
        <h3 className="text-base font-bold text-gray-900 mt-1">Inventory</h3>
        <p className="text-xs text-gray-500 mt-1">AEC Material Management</p>
      </div>
      
      <nav className="flex-1 p-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-2.5 mb-1 rounded text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user ? (
          <div>
            <p className="text-sm font-medium text-gray-700 truncate">{user.name || user.email}</p>
            <button 
              onClick={onLogout}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={onAuthClick}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Sign In
          </button>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        v1.0.0
      </div>
    </aside>
  )
}
