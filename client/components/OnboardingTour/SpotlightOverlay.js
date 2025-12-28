/*
 * 1.) Spotlight Overlay Component.
 * 2.) Highlighted specific UI areas during tour.
 * 3.) Created focus effect with box shadow.
 */

export default function SpotlightOverlay({ spotlight }) {
  if (!spotlight) return null

  return (
    <div 
      className="absolute bg-white opacity-10 animate-spotlight"
      style={{
        top: spotlight.top,
        left: spotlight.left,
        width: spotlight.width,
        height: spotlight.height,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)'
      }}
    />
  )
}
