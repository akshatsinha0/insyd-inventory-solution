/*
 * 1.) Progress Bar Component.
 * 2.) Displayed visual progress through tour steps.
 * 3.) Color-coded completed, current, and upcoming steps.
 */

export default function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div 
          key={idx}
          className={`h-1 flex-1 transition-all duration-300 ${
            idx < currentStep ? 'bg-green-500' : 
            idx === currentStep ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
