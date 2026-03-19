import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Container, Field, Heading, Input, VStack, Checkbox, createToaster, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'

const toaster = createToaster({
  placement: 'top-end',
})

// Типы для ответа API
interface AuthResponse {
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

const authSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

type AuthFormData = z.infer<typeof authSchema>

// Ключи для хранения
const SESSION_KEY = 'auth_session'

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Проверка наличия сохранённой сессии при загрузке
  useEffect(() => {
    const checkExistingSession = () => {
      // Проверяем сначала sessionStorage, затем localStorage
      const sessionData = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
      
      if (sessionData) {
        try {
          const session: SessionData = JSON.parse(sessionData)
          if (session.isAuthenticated && session.accessToken) {
            // Сессия существует, перенаправляем на страницу товаров
            navigate('/goods')
          }
        } catch {
          // Если данные повреждены, очищаем
          sessionStorage.removeItem(SESSION_KEY)
          localStorage.removeItem(SESSION_KEY)
        }
      }
    }

    checkExistingSession()
  }, [navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await axios.post<AuthResponse>('https://dummyjson.com/auth/login', {
        username: data.username,
        password: data.password,
        expiresInMins: 30,
      })

      // Данные пользователя для сохранения
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

      // Сохраняем в зависимости от чекбокса "Запомнить меня"
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
      }

      toaster.create({
        title: 'Успешная авторизация',
        description: `Добро пожаловать, ${response.data.firstName}!`,
        type: 'success',
        duration: 3000,
      })

      navigate('/goods')
    } catch (error) {
      let errorMessage = 'Произошла неизвестная ошибка'

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Ошибка от сервера
          const status = error.response.status
          if (status === 400) {
            errorMessage = 'Неверное имя пользователя или пароль'
          } else if (status === 401) {
            errorMessage = 'Неверные учетные данные'
          } else {
            errorMessage = `Ошибка сервера: ${status}`
          }
        } else if (error.request) {
          // Нет ответа от сервера
          errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение'
        }
      }

      setApiError(errorMessage)
      
      toaster.create({
        title: 'Ошибка авторизации',
        description: errorMessage,
        type: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={20}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
        <Heading size="lg" mb={6} textAlign="center">
          Вход в систему
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4}>
            <Field.Root invalid={!!errors.username}>
              <Field.Label>Имя пользователя</Field.Label>
              <Input
                {...register('username')}
                placeholder="Введите имя пользователя"
              />
              {errors.username && (
                <Field.ErrorText>{errors.username.message}</Field.ErrorText>
              )}
            </Field.Root>
            
            <Field.Root invalid={!!errors.password}>
              <Field.Label>Пароль</Field.Label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Введите пароль"
              />
              {errors.password && (
                <Field.ErrorText>{errors.password.message}</Field.ErrorText>
              )}
            </Field.Root>

            {/* Чекбокс "Запомнить меня" */}
            <Box width="full">
              <Checkbox.Root
                checked={rememberMe}
                onCheckedChange={(details) => setRememberMe(!!details.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Запомнить меня</Checkbox.Label>
              </Checkbox.Root>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {rememberMe 
                  ? 'Сессия будет сохранена после закрытия браузера' 
                  : 'Сессия сбросится при закрытии вкладки'}
              </Text>
            </Box>

            {/* Ошибка от API */}
            {apiError && (
              <Box width="full" p={3} bg="red.50" borderRadius="md">
                <Text color="red.600" fontSize="sm">{apiError}</Text>
              </Box>
            )}
            
            <Button
              type="submit"
              colorPalette="blue"
              width="full"
              loading={isLoading}
            >
              Войти
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  )
}