import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getStoredSession } from '../../features/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const session = getStoredSession()
      
      if (session && session.isAuthenticated && session.accessToken) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}