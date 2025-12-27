/*
 * 1.) Main Application Page.
 * 2.) Managed global state for inventory and transactions.
 * 3.) Rendered tab-based navigation between views.
 * 4.) Integrated stock alert notifications.
 */
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/Dashboard'
import InventoryList from '../components/InventoryList'
import Transactions from '../components/Transactions'
import Scanner from '../components/Scanner'
import StockAlert from '../components/StockAlert'
import OnboardingTour from '../components/OnboardingTour'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inventory, setInventory] = useState([])
  const [transactions, setTransactions] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
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
      case 'transactions':
        return <Transactions transactions={transactions} />
      case 'scanner':
        return <Scanner onScan={fetchData} />
      default:
        return <Dashboard inventory={inventory} transactions={transactions} warehouses={warehouses} />
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto p-6">
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
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
    </div>
  )
}
