import { useState } from 'react'
import { Box, Button, Field, Input, VStack, Checkbox, Text, Flex } from '@chakra-ui/react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authSchema, type AuthFormData } from '../model/schemas'
import { useAuth } from '../model/useAuth'
import { UserIcon, LockIcon, EyeOffIcon, LogoIcon, CloseIcon } from '../../../shared/ui'

export function AuthForm() {
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { isLoading, error, login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const username = useWatch({
    control,
    name: 'username'
  });

  const resetUsername = () => setValue('username', '');

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
          <VStack gap={3} textAlign="center">
            <LogoIcon />
            
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={5} align="stretch">
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
                    placeholder="Введите логин..."
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
                  />
                  <Box
                    position="absolute"
                    right={4}
                    zIndex={2}
                    cursor="pointer"
                    color="#c9c9c9"
                    onClick={resetUsername}
                  >
                    {username && username.length && (
                      <CloseIcon width={16} height={16} />
                    )}
                  </Box>
                </Box>
                {errors.username && (
                  <Field.ErrorText>{errors.username.message}</Field.ErrorText>
                )}
              </Field.Root>

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
                    placeholder="Введите парооль..."
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

              {error && (
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text color="red.600" fontSize="sm">{error}</Text>
                </Box>
              )}

              <Button
                type="submit"
                loading={isLoading}
                h="auto"
                py={4}
                px={2}
                borderRadius="12px"
                colorPalette={'blue'}
                fontSize="18px"
                fontWeight="600"
                letterSpacing="-0.18px"
                lineHeight="21.6px"
                fontFamily="'Inter', sans-serif"
              >
                Войти
              </Button>

              <Flex align="center" gap={2.5} w="full">
                <Box flex={1} h="1px" bg="gray.200" />
                <Text
                  fontSize="16px"
                  fontWeight="500"
                  color="#eaeaea"
                  lineHeight="24px"
                  fontFamily="'Inter', sans-serif"
                >
                  или
                </Text>
                <Box flex={1} h="1px" bg="gray.200" />
              </Flex>

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