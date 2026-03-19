import axios from 'axios'
import type { AuthResponse, SessionData } from '../model/types'

const AUTH_API_URL = 'https://dummyjson.com/auth/login'

export const login = async (username: string, password: string): Promise<SessionData> => {
  const response = await axios.post<AuthResponse>(AUTH_API_URL, {
    username,
    password,
    expiresInMins: 30,
  })

  const sessionData: SessionData = {
    accessToken: response.data.accessToken,
    user: {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
    },
    isAuthenticated: true,
  }

  return sessionData
}

export const getStoredSession = (): SessionData | null => {
  const sessionData = sessionStorage.getItem('auth_session') || localStorage.getItem('auth_session')
  
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData)
      if (session.isAuthenticated && session.accessToken) {
        return session
      }
    } catch {
      sessionStorage.removeItem('auth_session')
      localStorage.removeItem('auth_session')
    }
  }
  
  return null
}

export const saveSession = (session: SessionData, rememberMe: boolean): void => {
  if (rememberMe) {
    localStorage.setItem('auth_session', JSON.stringify(session))
  } else {
    sessionStorage.setItem('auth_session', JSON.stringify(session))
  }
}

export const clearSession = (): void => {
  sessionStorage.removeItem('auth_session')
  localStorage.removeItem('auth_session')
}