/*
 * 1.) Floating Label Input Component.
 * 2.) Animated placeholder slides below input on focus.
 * 3.) Supported text, number, date, and select inputs.
 * 4.) Password fields use static placeholder to prevent overlap.
 */
'use client'

import { useState } from 'react'

export default function FloatingInput({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  options,
  required = false,
  className = ''
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.toString().length > 0
  const isActive = focused || hasValue
  
  /*
   * 1.) Password fields use static placeholder inside input.
   * 2.) Prevents text overlap with password visibility toggle.
   */
  const isPasswordField = type === 'password' || type === 'text' && placeholder?.includes('••')

  /*
   * 1.) Render select dropdown if options provided.
   * 2.) Otherwise render standard input field.
   */
  if (options) {
    return (
      <div className={`relative mb-6 ${className}`}>
        <label className="text-xs text-gray-500 mb-1 block">{label}</label>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-gray-500 bg-white"
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className={`relative mb-6 ${className}`}>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        placeholder={isPasswordField ? placeholder : ''}
        className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
      />
      {placeholder && !isPasswordField && (
        <span 
          className={`absolute left-3 transition-all duration-300 pointer-events-none ${
            isActive 
              ? 'top-full mt-1 text-xs text-gray-400 opacity-100' 
              : 'top-8 text-sm text-gray-300 opacity-100'
          }`}
        >
          {placeholder}
        </span>
      )}
    </div>
  )
}
