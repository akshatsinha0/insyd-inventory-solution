/*
 * 1.) Main Onboarding Tour Component.
 * 2.) Orchestrated tour flow and state management.
 * 3.) Delegated rendering to child components.
 */
'use client'

import { useState, useEffect } from 'react'
import { tourSteps } from './tourSteps'
import TourCard from './TourCard'
import SpotlightOverlay from './SpotlightOverlay'
import FloatingParticles from './FloatingParticles'

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
      
      <SpotlightOverlay spotlight={step.spotlight} />
      
      <TourCard
        step={step}
        currentStep={currentStep}
        totalSteps={tourSteps.length}
        isAnimating={isAnimating}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
      />
      
      <FloatingParticles />
    </div>
  )
}
