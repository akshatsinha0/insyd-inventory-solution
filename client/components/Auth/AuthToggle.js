/*
 * 1.) Auth Toggle Component.
 * 2.) Allowed switching between login and signup modes.
 */
export default function AuthToggle({ mode, onToggle }) {
  return (
    <div className="mt-6 text-center text-sm">
      <span className="text-gray-500">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
      </span>
      <button
        onClick={onToggle}
        className="text-gray-800 font-medium"
      >
        {mode === 'login' ? 'Sign Up' : 'Sign In'}
      </button>
    </div>
  )
}
