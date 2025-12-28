/*
 * 1.) Procurement Main Component for 3-Way Matching.
 * 2.) Managed POs, GRNs, Invoices, and match results.
 */
'use client'

import { useState, useEffect } from 'react'
import ProcurementTabs from './ProcurementTabs'
import POView from './POView'
import GRNView from './GRNView'
import InvoiceView from './InvoiceView'
import MatchesView from './MatchesView'
import { useProcurementData } from './useProcurementData'

export default function Procurement() {
  const [activeView, setActiveView] = useState('pos')
  const { data, loading, fetchData } = useProcurementData(activeView)

  useEffect(() => {
    fetchData()
  }, [activeView])

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Procurement & 3-Way Matching</h2>
      </div>

      <ProcurementTabs activeView={activeView} setActiveView={setActiveView} />

      {activeView === 'pos' && <POView data={data} onRefresh={fetchData} />}
      {activeView === 'grns' && <GRNView data={data} onRefresh={fetchData} />}
      {activeView === 'invoices' && <InvoiceView data={data} onRefresh={fetchData} />}
      {activeView === 'matches' && <MatchesView data={data} />}
    </div>
  )
}
