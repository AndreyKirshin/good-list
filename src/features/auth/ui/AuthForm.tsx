import { useState } from 'react'
import { Box, Button, Field, Input, VStack, Checkbox, Text, Flex, Icon } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authSchema, type AuthFormData } from '../model/schemas'
import { useAuth } from '../model/useAuth'

// Иконка пользователя
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
)

// Иконка замка
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

// Иконка скрытия пароля
const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export function AuthForm() {
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { isLoading, error, login } = useAuth()

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
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="#f9f9f9"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="40px"
        boxShadow="0px 24px 32px rgba(0, 0, 0, 0.04)"
        p={{ base: 6, md: 12 }}
        w="full"
        maxW="527px"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '34px',
          padding: '1px',
          background: 'linear-gradient(180deg, rgba(237, 237, 237, 1) 20%, rgba(237, 237, 237, 0) 100%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <VStack gap={8} align="stretch">
          {/* Заголовок с иконкой */}
          <VStack gap={3} textAlign="center">
            <Box
              w="68px"
              h="74px"
              borderRadius="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <UserIcon width={40} height={40} color="#676767" />
            </Box>
            
            <Text
              fontSize="40px"
              fontWeight="600"
              color="#232323"
              lineHeight="44px"
              letterSpacing="-0.6px"
              fontFamily="'Inter', sans-serif"
            >
              Добро пожаловать!
            </Text>
            
            <Text
              fontSize="18px"
              fontWeight="500"
              color="#e0e0e0"
              lineHeight="27px"
              fontFamily="'Inter', sans-serif"
            >
              Пожалуйста, авторизируйтесь
            </Text>
          </VStack>

          {/* Форма */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={5} align="stretch">
              {/* Поле Логин */}
              <Field.Root invalid={!!errors.username}>
                <Field.Label
                  fontSize="18px"
                  fontWeight="500"
                  color="#232323"
                  letterSpacing="-0.27px"
                  lineHeight="27px"
                  fontFamily="'Inter', sans-serif"
                  mb={1.5}
                >
                  Логин
                </Field.Label>
                <Box
                  position="relative"
                  display="flex"
                  alignItems="center"
                  width={'100%'}
                >
                  <Box
                    position="absolute"
                    left={4}
                    zIndex={2}
                    color="#c9c9c9"
                  >
                    <UserIcon width={24} height={24} />
                  </Box>
                  <Input
                    {...register('username')}
                    placeholder="test"
                    pl={12}
                    h="auto"
                    py={3.5}
                    px={4}
                    fontSize="18px"
                    fontWeight="500"
                    color="#232323"
                    border="1.5px solid"
                    borderColor="#ededed"
                    borderRadius="12px"
                    fontFamily="'Inter', sans-serif"
                    paddingLeft={'48px'}
                    paddingInline={'none'}
                    _placeholder={{ color: '#232323' }}
                    _focus={{
                      borderColor: '#357aff',
                      boxShadow: '0 0 0 1px #357aff',
                    }}
                  />
                </Box>
                {errors.username && (
                  <Field.ErrorText>{errors.username.message}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Поле Пароль */}
              <Field.Root invalid={!!errors.password}>
                <Field.Label
                  fontSize="18px"
                  fontWeight="500"
                  color="#232323"
                  letterSpacing="-0.27px"
                  lineHeight="27px"
                  fontFamily="'Inter', sans-serif"
                  mb={1.5}
                >
                  Пароль
                </Field.Label>
                <Box
                  position="relative"
                  display="flex"
                  alignItems="center"
                  width={'100%'}
                >
                  <Box
                    position="absolute"
                    left={4}
                    zIndex={2}
                    color="#c9c9c9"
                  >
                    <LockIcon width={24} height={24} />
                  </Box>
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••••••••"
                    pl={12}
                    pr={12}
                    h="auto"
                    py={3.5}
                    px={4}
                    fontSize="18px"
                    fontWeight="500"
                    color="#232323"
                    border="1.5px solid"
                    borderColor="#ededed"
                    borderRadius="12px"
                    fontFamily="'Inter', sans-serif"
                    paddingLeft={'48px'}
                    paddingInline={'none'}
                    _placeholder={{ color: '#232323' }}
                    _focus={{
                      borderColor: '#357aff',
                      boxShadow: '0 0 0 1px #357aff',
                    }}
                  />
                  <Box
                    position="absolute"
                    right={4}
                    zIndex={2}
                    cursor="pointer"
                    color="#c9c9c9"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <EyeOffIcon width={24} height={24} />
                  </Box>
                </Box>
                {errors.password && (
                  <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Чекбокс Запомнить данные */}
              <Box>
                <Checkbox.Root
                  checked={rememberMe}
                  onCheckedChange={(details) => setRememberMe(!!details.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    borderColor="#c9c9c9"
                    borderRadius="4px"
                    _checked={{
                      bg: '#357aff',
                      borderColor: '#357aff',
                    }}
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label
                    fontSize="16px"
                    fontWeight="500"
                    color="#9c9c9c"
                    lineHeight="24px"
                    fontFamily="'Inter', sans-serif"
                  >
                    Запомнить данные
                  </Checkbox.Label>
                </Checkbox.Root>
              </Box>

              {/* Ошибка от API */}
              {error && (
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text color="red.600" fontSize="sm">{error}</Text>
                </Box>
              )}

              {/* Кнопка Войти */}
              <Button
                type="submit"
                loading={isLoading}
                h="auto"
                py={4}
                px={2}
                borderRadius="12px"
                bg="linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 100%), linear-gradient(0deg, #242edb 0%, #242edb 100%)"
                border="1px solid"
                borderColor="#357aff"
                boxShadow="inset 0px -2px 0px 1px rgba(0, 0, 0, 0.08), 0px 8px 8px rgba(54, 122, 255, 0.03)"
                color="white"
                fontSize="18px"
                fontWeight="600"
                letterSpacing="-0.18px"
                lineHeight="21.6px"
                fontFamily="'Inter', sans-serif"
                _hover={{
                  bg: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 100%), linear-gradient(0deg, #1a1eb8 0%, #1a1eb8 100%)',
                }}
                _active={{
                  boxShadow: 'inset 0px 2px 0px 1px rgba(0, 0, 0, 0.08)',
                }}
              >
                Войти
              </Button>

              {/* Разделитель или */}
              <Flex align="center" gap={2.5} w="full">
                <Box flex={1} h="1px" bg="gray.200" />
                <Text
                  fontSize="16px"
                  fontWeight="500"
                  color="#eaeaea"
                  lineHeight="24px"
                  fontFamily="'Inter', sans-serif"
                  textShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
                >
                  или
                </Text>
                <Box flex={1} h="1px" bg="gray.200" />
              </Flex>

              {/* Ссылка на регистрацию */}
              <Text
                textAlign="center"
                fontSize="18px"
                fontWeight="400"
                color="transparent"
                lineHeight="27px"
                fontFamily="'Inter', sans-serif"
              >
                <Text as="span" color="#6c6c6c">
                  Нет аккаунта?{' '}
                </Text>
                <Text
                  as="span"
                  color="#242edb"
                  fontWeight="600"
                  textDecoration="underline"
                  cursor="pointer"
                  _hover={{
                    color: '#1a1eb8',
                  }}
                >
                  Создать
                </Text>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  )
}