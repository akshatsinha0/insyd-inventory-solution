/*
 * 1.) Auth Header Component.
 * 2.) Displayed title and description based on login/signup mode.
 */
export default function AuthHeader({ mode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        {mode === 'login' 
          ? 'Sign in to access your inventory' 
          : 'Join Insyd Inventory Management'}
      </p>
    </div>
  )
}
