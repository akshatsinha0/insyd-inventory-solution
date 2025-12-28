/*
 * 1.) Main Procurement Component for 3-Way Matching.
 * 2.) Orchestrated PO, GRN, Invoice, and Match workflows.
 * 3.) Delegated view rendering to specialized components.
 */
'use client'

import { useState, useEffect } from 'react'
import TabNavigation from './TabNavigation'
import PurchaseOrdersView from './PurchaseOrdersView'
import GRNsView from './GRNsView'
import InvoicesView from './InvoicesView'
import MatchesView from './MatchesView'
import { useProcurementData } from './useProcurementData'

export default function Procurement() {
  const [activeView, setActiveView] = useState('pos')
  const {
    pos,
    grns,
    invoices,
    matches,
    skus,
    warehouses,
    loading,
    fetchData
  } = useProcurementData(activeView)

  useEffect(() => {
    fetchData()
  }, [activeView])

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Procurement & 3-Way Matching</h2>
      </div>

      <TabNavigation activeView={activeView} setActiveView={setActiveView} />

      {activeView === 'pos' && (
        <PurchaseOrdersView 
          pos={pos} 
          skus={skus} 
          warehouses={warehouses} 
          onRefresh={fetchData} 
        />
      )}

      {activeView === 'grns' && (
        <GRNsView 
          grns={grns} 
          pos={pos} 
          skus={skus} 
          warehouses={warehouses} 
          onRefresh={fetchData} 
        />
      )}

      {activeView === 'invoices' && (
        <InvoicesView invoices={invoices} />
      )}

      {activeView === 'matches' && (
        <MatchesView matches={matches} />
      )}
    </div>
  )
}
