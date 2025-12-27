/*
 * 1.) Onboarding Tour Component.
 * 2.) Displayed guided walkthrough for first-time visitors.
 * 3.) Used curvy arrows and smooth animations.
 */
'use client'

import { useState, useEffect } from 'react'

const tourSteps = [
  {
    target: 'sidebar',
    title: 'Navigation',
    description: 'Switch between Dashboard, Inventory, Transactions, and Scanner views.',
    position: 'right',
    arrowDirection: 'left'
  },
  {
    target: 'dashboard',
    title: 'Dashboard Overview',
    description: 'View real-time KPIs, stock levels, and recent activity at a glance.',
    position: 'center',
    arrowDirection: 'up'
  },
  {
    target: 'inventory',
    title: 'Inventory Management',
    description: 'Browse all SKUs, filter by ABC category, and soft-allocate stock.',
    position: 'center',
    arrowDirection: 'up'
  },
  {
    target: 'scanner',
    title: 'QR Scanner',
    description: 'Simulate barcode scanning to receive goods or allocate inventory.',
    position: 'center',
    arrowDirection: 'up'
  }
]

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('insyd_tour_completed')
    if (hasSeenTour) {
      setIsVisible(false)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('insyd_tour_completed', 'true')
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  if (!isVisible) return null

  const step = tourSteps[currentStep]

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Tour Card */}
      <div 
        className="absolute bg-white p-6 w-80 shadow-lg animate-fadeIn"
        style={{
          top: currentStep === 0 ? '120px' : '50%',
          left: currentStep === 0 ? '240px' : '50%',
          transform: currentStep === 0 ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        {/* Curvy Arrow SVG */}
        {currentStep === 0 && (
          <svg 
            className="absolute -left-16 top-4 animate-bounce"
            width="60" 
            height="40" 
            viewBox="0 0 60 40"
          >
            <path 
              d="M55 20 Q30 5, 10 20 Q5 22, 2 25" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polygon 
              points="0,20 8,25 5,30" 
              fill="#374151"
            />
          </svg>
        )}

        {/* Step Indicator */}
        <div className="flex gap-1 mb-4">
          {tourSteps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 flex-1 ${idx <= currentStep ? 'bg-gray-700' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-600 mb-6">{step.description}</p>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button 
            onClick={handleSkip}
            className="text-sm text-gray-400"
          >
            Skip tour
          </button>
          <button 
            onClick={handleNext}
            className="px-4 py-2 bg-gray-700 text-white text-sm"
          >
            {currentStep < tourSteps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>

        {/* Step Counter */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          {currentStep + 1} of {tourSteps.length}
        </p>
      </div>
    </div>
  )
}
