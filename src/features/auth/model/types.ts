// Типы для ответа API
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

// Тип для сохранённой сессии
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

// Тип для данных формы входа
export interface AuthFormData {
  username: string
  password: string
}

// Ключ для хранения сессии
export const SESSION_KEY = 'auth_session'