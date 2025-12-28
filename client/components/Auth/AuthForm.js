/*
 * 1.) Auth Form Component.
 * 2.) Handled email, password, and name inputs with validation.
 */
'use client'

import { useState } from 'react'
import EyeIcon from './EyeIcon'

export default function AuthForm({ mode, onSuccess, onError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleSubmit = async (e) => {
    e.preventDefault()
    onError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          onError('Passwords do not match')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          onError('Password must be at least 6 characters')
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
      
      onSuccess(data.user)

    } catch (err) {
      onError(err.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {mode === 'signup' && (
        <div className="relative mb-6">
          <label className="text-xs text-gray-500 mb-1 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
          />
          <span className="absolute left-3 top-full mt-1 text-xs text-gray-400">
            e.g., Akshat Sinha
          </span>
        </div>
      )}

      <div className="relative mb-6">
        <label className="text-xs text-gray-500 mb-1 block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
        />
        <span className="absolute left-3 top-full mt-1 text-xs text-gray-400">
          e.g., akshat@insyd.ai
        </span>
      </div>

      <div className="relative mb-4">
        <label className="text-xs text-gray-500 mb-1 block">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-500 peer"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>
      </div>

      {mode === 'signup' && (
        <div className="relative mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-500 peer"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <EyeIcon visible={showConfirmPassword} />
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gray-800 text-white text-sm font-medium mt-4 disabled:opacity-50"
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  )
}
