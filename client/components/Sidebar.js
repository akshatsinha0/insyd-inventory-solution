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
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Insyd Inventory</h1>
        <p className="text-xs text-gray-500">AEC Material Management</p>
      </div>
      
      <nav className="flex-1 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-3 py-2 mb-1 flex items-center gap-2 text-sm ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600'
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
              className="text-xs text-gray-500 mt-1"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={onAuthClick}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700"
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
