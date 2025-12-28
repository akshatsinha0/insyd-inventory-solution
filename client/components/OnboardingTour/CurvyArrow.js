/*
 * 1.) Curvy Arrow Component.
 * 2.) Rendered directional arrows with SVG paths.
 * 3.) Supported multiple arrow types with animations.
 */

const arrowPaths = {
  'left': {
    viewBox: "0 0 60 40",
    path: "M55 20 Q35 8, 15 20 Q10 22, 8 24",
    tip: "M8 24 L2 20 L8 16 Z",
    animation: "animate-pulse-arrow"
  },
  'right': {
    viewBox: "0 0 60 40",
    path: "M5 20 Q25 8, 45 20 Q50 22, 52 24",
    tip: "M52 24 L58 20 L52 16 Z",
    animation: "animate-pulse-arrow"
  },
  'up': {
    viewBox: "0 0 40 60",
    path: "M20 55 Q8 35, 20 15 Q22 10, 24 8",
    tip: "M24 8 L20 2 L16 8 Z",
    animation: "animate-bounce-arrow"
  },
  'up-right': {
    viewBox: "0 0 80 60",
    path: "M10 55 Q20 35, 40 20 Q55 10, 68 8",
    tip: "M68 8 L75 5 L72 12 Z",
    animation: "animate-bounce-arrow"
  },
  'up-left': {
    viewBox: "0 0 80 60",
    path: "M70 55 Q60 35, 40 20 Q25 10, 12 8",
    tip: "M12 8 L5 5 L8 12 Z",
    animation: "animate-bounce-arrow"
  }
}

export default function CurvyArrow({ type, style }) {
  const config = arrowPaths[type]
  if (!config) return null

  return (
    <svg 
      width={config.viewBox.split(' ')[2]} 
      height={config.viewBox.split(' ')[3]} 
      viewBox={config.viewBox} 
      style={style} 
      className={`absolute ${config.animation}`}
    >
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d={config.path}
        fill="none" 
        stroke="#1f2937" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        filter="url(#shadow)"
      />
      <path 
        d={config.tip}
        fill="#1f2937"
        filter="url(#shadow)"
      />
    </svg>
  )
}
