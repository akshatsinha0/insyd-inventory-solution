/*
 * 1.) Floating Particles Component.
 * 2.) Added decorative animated particles to tour overlay.
 * 3.) Enhanced visual appeal with subtle animations.
 */

export default function FloatingParticles() {
  return (
    <>
      <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-50" />
      <div className="absolute top-40 right-40 w-3 h-3 bg-green-400 rounded-full animate-float-delayed opacity-50" />
      <div className="absolute bottom-40 left-40 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-50" />
    </>
  )
}
