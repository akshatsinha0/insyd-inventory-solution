/*
 * 1.) Main Transactions Component.
 * 2.) Orchestrated transaction log display and filtering.
 * 3.) Delegated rendering to specialized components.
 */
'use client'

import { useState } from 'react'
import TransactionFilter from './TransactionFilter'
import TransactionTable from './TransactionTable'
import { filterTransactions } from './transactionUtils'

export default function Transactions({ transactions }) {
  const [typeFilter, setTypeFilter] = useState('')

  const filteredTx = filterTransactions(transactions, typeFilter)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Transaction Log</h2>

      <TransactionFilter 
        typeFilter={typeFilter} 
        setTypeFilter={setTypeFilter} 
      />

      <TransactionTable transactions={filteredTx} />

      {filteredTx.length === 0 && (
        <p className="text-center text-gray-400 py-8">No transactions found</p>
      )}
    </div>
  )
}
