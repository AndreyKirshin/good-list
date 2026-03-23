import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authSchema, type AuthFormData } from './schemas'
import { type SessionData } from './types'
import { login, getStoredSession, saveSession, clearSession } from '../api/authApi'

interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  login: (data: AuthFormData, rememberMe: boolean) => Promise<void>
  checkExistingSession: () => void
  logout: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const checkExistingSession = useCallback(() => {
    const session = getStoredSession()
    if (session) {
      navigate('/goods')
    }
  }, [navigate])

  const handleLogin = async (data: AuthFormData, rememberMe: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      authSchema.parse(data)

      const sessionData = await login(data.username, data.password)
      saveSession(sessionData, rememberMe)

      navigate('/goods')
    } catch (err) {
      let errorMessage = 'Произошла неизвестная ошибка'

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status
          if (status === 400) {
            errorMessage = 'Неверное имя пользователя или пароль'
          } else if (status === 401) {
            errorMessage = 'Неверные учетные данные'
          } else {
            errorMessage = `Ошибка сервера: ${status}`
          }
        } else if (err.request) {
          errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение'
        }
      }

      setError(errorMessage)
      
    } finally {
      setIsLoading(false)
    }
  }

  const logout = useCallback(() => {
    clearSession()
    navigate('/auth')
  }, [navigate])

  return {
    isLoading,
    error,
    login: handleLogin,
    checkExistingSession,
    logout,
  }
}

export const useAuthCheck = (): SessionData | null => {
  const [session, setSession] = useState<SessionData | null>(null)

  useEffect(() => {
    const storedSession = getStoredSession()
    setSession(storedSession)
  }, [])

  return session
}