import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
}

const SESSION_KEY = 'auth_session'

interface SessionData {
  accessToken: string
  user: {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
  }
  isAuthenticated: boolean
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const sessionData = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
      
      if (sessionData) {
        try {
          const session: SessionData = JSON.parse(sessionData)
          if (session.isAuthenticated && session.accessToken) {
            setIsAuthenticated(true)
            return
          }
        } catch {
          sessionStorage.removeItem(SESSION_KEY)
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setIsAuthenticated(false)
    }

    checkAuth()
  }, [])

  // Пока проверяем аутентификацию - не рендерим ничего
  if (isAuthenticated === null) {
    return null
  }

  // Если не аутентифицирован - редирект на страницу авторизации
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}