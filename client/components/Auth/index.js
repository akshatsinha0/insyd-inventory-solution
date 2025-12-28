/*
 * 1.) Authentication Modal Main Component.
 * 2.) Managed login and signup flows with Supabase Auth.
 */
'use client'

import { useState } from 'react'
import AuthHeader from './AuthHeader'
import AuthForm from './AuthForm'
import AuthToggle from './AuthToggle'

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')

  const handleSuccess = (user) => {
    if (onAuth) onAuth(user)
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 border border-gray-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <AuthHeader mode={mode} />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <AuthForm
          mode={mode}
          onSuccess={handleSuccess}
          onError={setError}
        />

        <AuthToggle
          mode={mode}
          onToggle={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError('')
          }}
        />
      </div>
    </div>
  )
}
