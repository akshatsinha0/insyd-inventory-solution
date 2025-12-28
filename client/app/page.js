/*
 * 1.) Main Application Page.
 * 2.) Managed global state for inventory and transactions.
 * 3.) Rendered tab-based navigation between views.
 * 4.) Integrated authentication and stock alert notifications.
 */
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/Dashboard'
import InventoryList from '../components/InventoryList'
import Procurement from '../components/Procurement'
import Transactions from '../components/Transactions'
import Scanner from '../components/Scanner'
import Shipments from '../components/Shipments'
import StockAlert from '../components/StockAlert'
import OnboardingTour from '../components/OnboardingTour'
import AuthModal from '../components/AuthModal'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inventory, setInventory] = useState([])
  const [transactions, setTransactions] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(true)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const savedUser = localStorage.getItem('insyd_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invRes, txRes, whRes] = await Promise.all([
        fetch(`${API_URL}/inventory`),
        fetch(`${API_URL}/transactions?limit=50`),
        fetch(`${API_URL}/warehouses`)
      ])
      
      if (invRes.ok) setInventory(await invRes.json())
      if (txRes.ok) setTransactions(await txRes.json())
      if (whRes.ok) setWarehouses(await whRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard inventory={inventory} transactions={transactions} warehouses={warehouses} />
      case 'inventory':
        return <InventoryList inventory={inventory} onRefresh={fetchData} />
      case 'procurement':
        return <Procurement />
      case 'shipments':
        return <Shipments />
      case 'transactions':
        return <Transactions transactions={transactions} />
      case 'scanner':
        return <Scanner onScan={fetchData} />
      default:
        return <Dashboard inventory={inventory} transactions={transactions} warehouses={warehouses} />
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onAuthClick={() => setShowAuth(true)}
        onLogout={() => {
          localStorage.removeItem('insyd_user')
          localStorage.removeItem('insyd_token')
          setUser(null)
        }}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            <StockAlert inventory={inventory} />
            {renderContent()}
          </>
        )}
      </main>
      {showTour && (
        <OnboardingTour 
          onComplete={() => setShowTour(false)} 
          setActiveTab={setActiveTab}
        />
      )}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onAuth={(userData) => setUser(userData)}
        />
      )}
    </div>
  )
}
