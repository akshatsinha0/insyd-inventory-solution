/*
 * 1.) Tour Card Component.
 * 2.) Displayed tour step content with navigation controls.
 * 3.) Rendered progress bar and action buttons.
 */

import CurvyArrow from './CurvyArrow'
import ProgressBar from './ProgressBar'

export default function TourCard({ 
  step, 
  currentStep, 
  totalSteps, 
  isAnimating, 
  onNext, 
  onPrev, 
  onSkip 
}) {
  const isWelcomeOrComplete = step.id === 'welcome' || step.id === 'complete'

  return (
    <div 
      className={`absolute bg-white p-6 w-96 shadow-2xl transition-all duration-300 ${
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={step.position}
    >
      {step.arrow && (
        <CurvyArrow 
          type={step.arrow.type} 
          style={{ top: step.arrow.top, left: step.arrow.left }}
        />
      )}

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      {!isWelcomeOrComplete && (
        <div className="inline-block px-2 py-0.5 bg-gray-100 text-xs text-gray-500 mb-3">
          Step {currentStep} of {totalSteps - 2}
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
      
      {step.subtext && (
        <p className="text-xs text-gray-400 mb-4 italic border-l-2 border-gray-200 pl-3">
          {step.subtext}
        </p>
      )}

      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-2">
          {currentStep > 0 && !isWelcomeOrComplete && (
            <button 
              onClick={onPrev}
              className="px-3 py-2 text-sm text-gray-500 border border-gray-200"
            >
              Back
            </button>
          )}
          <button 
            onClick={onSkip}
            className="px-3 py-2 text-sm text-gray-400"
          >
            {isWelcomeOrComplete ? 'Skip' : 'Exit tour'}
          </button>
        </div>
        <button 
          onClick={onNext}
          className="px-5 py-2 bg-gray-800 text-white text-sm font-medium transition-all hover:bg-gray-700"
        >
          {step.id === 'welcome' ? 'Start Tour' : 
           step.id === 'complete' ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
