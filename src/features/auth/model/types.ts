export interface AuthResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  accessToken: string
  refreshToken: string
}

export interface SessionData {
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

export interface AuthFormData {
  username: string
  password: string
}

export const SESSION_KEY = 'auth_session'