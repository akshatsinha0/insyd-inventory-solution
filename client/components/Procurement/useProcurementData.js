/*
 * 1.) Custom Hook for Procurement Data Management.
 * 2.) Handled API calls and state management.
 * 3.) Provided centralized data fetching logic.
 */

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function useProcurementData(activeView) {
  const [pos, setPOs] = useState([])
  const [grns, setGRNs] = useState([])
  const [invoices, setInvoices] = useState([])
  const [matches, setMatches] = useState([])
  const [skus, setSkus] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [skuRes, whRes] = await Promise.all([
        fetch(`${API_URL}/skus`),
        fetch(`${API_URL}/warehouses`)
      ])
      
      if (skuRes.ok) setSkus(await skuRes.json())
      if (whRes.ok) setWarehouses(await whRes.json())
      
      if (activeView === 'pos') {
        const res = await fetch(`${API_URL}/purchase-orders`)
        if (res.ok) setPOs(await res.json())
      } else if (activeView === 'grns') {
        const res = await fetch(`${API_URL}/grns`)
        if (res.ok) setGRNs(await res.json())
      } else if (activeView === 'invoices') {
        const res = await fetch(`${API_URL}/invoices`)
        if (res.ok) setInvoices(await res.json())
      } else if (activeView === 'matches') {
        const res = await fetch(`${API_URL}/invoices/matches`)
        if (res.ok) setMatches(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    }
    setLoading(false)
  }

  return {
    pos,
    grns,
    invoices,
    matches,
    skus,
    warehouses,
    loading,
    fetchData
  }
}
