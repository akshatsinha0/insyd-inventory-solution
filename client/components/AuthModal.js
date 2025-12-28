/*
 * 1.) Authentication Modal Component with Login and Signup.
 * 2.) Implemented Supabase Auth integration.
 * 3.) Used custom SVG eye icon for password visibility toggle.
 * 4.) Supported email/password authentication flow.
 */
'use client'

import { useState } from 'react'

/*
 * 1.) Custom Eye Icon SVG for password visibility.
 * 2.) Toggles between open and closed states.
 */
const EyeIcon = ({ visible }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-gray-400"
  >
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
)

/*
 * 1.) Floating Label Input Component.
 * 2.) Animated placeholder moves below input on focus/type.
 */
const FloatingInput = ({ label, type, value, onChange, placeholder, showToggle, onToggle, isVisible }) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0
  const isActive = focused || hasValue

  return (
    <div className="relative mb-4">
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-3 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-500 peer"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <EyeIcon visible={isVisible} />
          </button>
        )}
      </div>
      <label 
        className={`absolute left-3 transition-all duration-200 pointer-events-none ${
          isActive 
            ? '-bottom-5 text-xs text-gray-500' 
            : 'top-3 text-sm text-gray-400'
        }`}
      >
        {placeholder}
      </label>
    </div>
  )
}

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
      }

      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup'
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, name }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      localStorage.setItem('insyd_user', JSON.stringify(data.user))
      localStorage.setItem('insyd_token', data.token)
      
      if (onAuth) onAuth(data.user)
      if (onClose) onClose()

    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 border border-gray-200 relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' 
              ? 'Sign in to access your inventory' 
              : 'Join Insyd Inventory Management'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <FloatingInput
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Akshat Sinha"
            />
          )}

          <FloatingInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., akshat@insyd.ai"
          />

          <FloatingInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g., ••••••••"
            showToggle={true}
            onToggle={() => setShowPassword(!showPassword)}
            isVisible={showPassword}
          />

          {mode === 'signup' && (
            <FloatingInput
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="e.g., ••••••••"
              showToggle={true}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              isVisible={showConfirmPassword}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-800 text-white text-sm font-medium mt-4 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="text-gray-800 font-medium"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
