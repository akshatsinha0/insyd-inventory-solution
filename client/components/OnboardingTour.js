/*
 * 1.) Onboarding Tour Component.
 * 2.) Displayed guided walkthrough for first-time visitors.
 * 3.) Used curvy arrows and smooth animations.
 * 4.) Covered all major sections with detailed descriptions.
 */
'use client'

import { useState, useEffect } from 'react'

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Insyd Inventory',
    description: 'Your unified platform for AEC material management. Let us show you around.',
    subtext: 'This tour takes about 30 seconds',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null
  },
  {
    id: 'sidebar',
    title: 'Navigation Panel',
    description: 'Access all modules from here. Switch between Dashboard, Inventory, Transactions, and Scanner with a single click.',
    subtext: 'Tip: The active section is highlighted in blue',
    position: { top: '150px', left: '260px' },
    spotlight: { top: '60px', left: '0', width: '224px', height: '200px' },
    arrow: { type: 'left', top: '30px', left: '-50px' }
  },
  {
    id: 'dashboard-stats',
    title: 'Real-Time KPIs',
    description: 'Monitor your inventory health at a glance. Total SKUs, stock levels, allocations, and warehouse count update in real-time.',
    subtext: 'These metrics sync with your Supabase database instantly',
    position: { top: '120px', left: '400px' },
    spotlight: { top: '80px', left: '240px', width: '600px', height: '120px' },
    arrow: { type: 'up', top: '-45px', left: '120px' }
  },
  {
    id: 'abc-classification',
    title: 'ABC Classification',
    description: 'Materials are categorized by value. Category A (high-value) items like Italian Marble need daily audits, while Category C consumables use visual control.',
    subtext: 'Based on the Pareto Principle: 20% of items = 80% of value',
    position: { top: '280px', left: '300px' },
    spotlight: { top: '220px', left: '240px', width: '350px', height: '180px' },
    arrow: { type: 'up-right', top: '-40px', left: '50px' }
  },
  {
    id: 'inventory-table',
    title: 'Inventory Management',
    description: 'View all SKUs with bin locations, quantities, and allocation status. Filter by category or search by name.',
    subtext: 'Bin format: WH01-ASL01-RK01-BN01 (Warehouse-Aisle-Rack-Bin)',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'inventory'
  },
  {
    id: 'soft-allocation',
    title: 'Soft Allocation',
    description: 'Click "Allocate" to reserve stock for a sales order. This creates an atomic lock preventing overselling while the order is processed.',
    subtext: 'Allocations expire after 24 hours if not confirmed',
    position: { top: '200px', left: '500px' },
    spotlight: { top: '150px', left: '750px', width: '150px', height: '60px' },
    arrow: { type: 'right', top: '20px', left: '280px' }
  },
  {
    id: 'transactions',
    title: 'Audit Trail',
    description: 'Every inventory movement is logged here. Track RECEIVE, ALLOCATE, SHIP, and ADJUST transactions with timestamps.',
    subtext: 'Essential for cycle counting and compliance',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'transactions'
  },
  {
    id: 'transaction-types',
    title: 'Transaction Types',
    description: 'Color-coded badges help identify transaction types quickly. Green for receiving, blue for allocations, orange for shipments.',
    subtext: 'Filter by type to analyze specific movements',
    position: { top: '180px', left: '350px' },
    spotlight: { top: '130px', left: '240px', width: '200px', height: '200px' },
    arrow: { type: 'up', top: '-45px', left: '80px' }
  },
  {
    id: 'scanner',
    title: 'QR/Barcode Scanner',
    description: 'Simulate warehouse floor operations. Enter a SKU code to receive goods or allocate stock, just like scanning a physical barcode.',
    subtext: 'Try: MAR-ITL-001, DWT-DRL-001, or STN-TPM-001',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'scanner'
  },
  {
    id: 'scanner-workflow',
    title: 'Receiving Workflow',
    description: 'When goods arrive, scan the SKU, select "Receive Goods", enter quantity and PO reference. The system updates inventory and logs the transaction.',
    subtext: 'Three-Way Match: PO vs Invoice vs Physical Count',
    position: { top: '200px', left: '450px' },
    spotlight: { top: '100px', left: '260px', width: '400px', height: '350px' },
    arrow: { type: 'up-left', top: '-40px', left: '150px' }
  },
  {
    id: 'complete',
    title: 'You are all set!',
    description: 'Start managing your inventory with confidence. The system ensures 99% accuracy through real-time sync and atomic transactions.',
    subtext: 'Need help? Check the README on GitHub',
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    spotlight: null,
    arrow: null,
    navigateTo: 'dashboard'
  }
]

const CurvyArrow = ({ type, style }) => {
  const arrows = {
    'left': (
      <svg width="50" height="30" viewBox="0 0 50 30" style={style} className="absolute animate-pulse-arrow">
        <path d="M45 15 Q25 5, 8 15" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        <polygon points="2,12 10,15 6,22" fill="#374151" />
      </svg>
    ),
    'right': (
      <svg width="50" height="30" viewBox="0 0 50 30" style={style} className="absolute animate-pulse-arrow">
        <path d="M5 15 Q25 5, 42 15" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        <polygon points="48,12 40,15 44,22" fill="#374151" />
      </svg>
    ),
    'up': (
      <svg width="30" height="50" viewBox="0 0 30 50" style={style} className="absolute animate-bounce-arrow">
        <path d="M15 45 Q5 25, 15 8" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        <polygon points="12,2 15,10 18,2" fill="#374151" />
      </svg>
    ),
    'up-right': (
      <svg width="60" height="50" viewBox="0 0 60 50" style={style} className="absolute animate-bounce-arrow">
        <path d="M10 45 Q15 20, 50 10" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        <polygon points="55,5 48,12 55,15" fill="#374151" />
      </svg>
    ),
    'up-left': (
      <svg width="60" height="50" viewBox="0 0 60 50" style={style} className="absolute animate-bounce-arrow">
        <path d="M50 45 Q45 20, 10 10" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        <polygon points="5,5 12,12 5,15" fill="#374151" />
      </svg>
    )
  }
  return arrows[type] || null
}

export default function OnboardingTour({ onComplete, setActiveTab }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('insyd_tour_completed')
    if (!hasSeenTour) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    const step = tourSteps[currentStep]
    if (step.navigateTo && setActiveTab) {
      setActiveTab(step.navigateTo)
    }
  }, [currentStep, setActiveTab])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 200)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('insyd_tour_completed', 'true')
    setIsVisible(false)
    if (setActiveTab) setActiveTab('dashboard')
    if (onComplete) onComplete()
  }

  if (!isVisible) return null

  const step = tourSteps[currentStep]
  const isWelcomeOrComplete = step.id === 'welcome' || step.id === 'complete'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
      
      {/* Spotlight Effect */}
      {step.spotlight && (
        <div 
          className="absolute bg-white opacity-10 animate-spotlight"
          style={{
            top: step.spotlight.top,
            left: step.spotlight.left,
            width: step.spotlight.width,
            height: step.spotlight.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)'
          }}
        />
      )}
      
      {/* Tour Card */}
      <div 
        className={`absolute bg-white p-6 w-96 shadow-2xl transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={step.position}
      >
        {/* Arrow */}
        {step.arrow && (
          <CurvyArrow 
            type={step.arrow.type} 
            style={{ top: step.arrow.top, left: step.arrow.left }}
          />
        )}

        {/* Progress Bar */}
        <div className="flex gap-1 mb-4">
          {tourSteps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 flex-1 transition-all duration-300 ${
                idx < currentStep ? 'bg-green-500' : 
                idx === currentStep ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step Number Badge */}
        {!isWelcomeOrComplete && (
          <div className="inline-block px-2 py-0.5 bg-gray-100 text-xs text-gray-500 mb-3">
            Step {currentStep} of {tourSteps.length - 2}
          </div>
        )}

        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
        
        {step.subtext && (
          <p className="text-xs text-gray-400 mb-4 italic border-l-2 border-gray-200 pl-3">
            {step.subtext}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            {currentStep > 0 && !isWelcomeOrComplete && (
              <button 
                onClick={handlePrev}
                className="px-3 py-2 text-sm text-gray-500 border border-gray-200"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-gray-400"
            >
              {isWelcomeOrComplete ? 'Skip' : 'Exit tour'}
            </button>
          </div>
          <button 
            onClick={handleNext}
            className="px-5 py-2 bg-gray-800 text-white text-sm font-medium transition-all hover:bg-gray-700"
          >
            {step.id === 'welcome' ? 'Start Tour' : 
             step.id === 'complete' ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      {/* Floating Particles (decorative) */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-50" />
      <div className="absolute top-40 right-40 w-3 h-3 bg-green-400 rounded-full animate-float-delayed opacity-50" />
      <div className="absolute bottom-40 left-40 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-50" />
    </div>
  )
}
