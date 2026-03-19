import { useState, useEffect } from 'react'
import { Box, Button, Container, Field, Heading, Input, VStack, Checkbox, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authSchema, type AuthFormData } from '../model/schemas'
import { useAuth } from '../model/useAuth'

export function AuthForm() {
  const [rememberMe, setRememberMe] = useState(false)
  const { isLoading, error, login, checkExistingSession } = useAuth()

  useEffect(() => {
    checkExistingSession()
  }, [checkExistingSession])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    await login(data, rememberMe)
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
            {error && (
              <Box width="full" p={3} bg="red.50" borderRadius="md">
                <Text color="red.600" fontSize="sm">{error}</Text>
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