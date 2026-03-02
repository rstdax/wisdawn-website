import { type ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDeviceDetection } from '../hooks/useDeviceDetection'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component that restricts access based on device type
 * Android devices are redirected to landing page
 * All other devices have full access
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { canAccessFullSite, isAndroid } = useDeviceDetection()
  const location = useLocation()

  useEffect(() => {
    // Log for debugging (remove in production if needed)
    if (isAndroid && location.pathname !== '/') {
      console.log('Android device detected - redirecting to landing page')
    }
  }, [isAndroid, location.pathname])

  // If Android device tries to access any route other than "/"
  if (!canAccessFullSite && location.pathname !== '/') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
