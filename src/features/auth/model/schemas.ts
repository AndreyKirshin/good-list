import { z } from 'zod'

export const authSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

export type AuthFormData = z.infer<typeof authSchema>