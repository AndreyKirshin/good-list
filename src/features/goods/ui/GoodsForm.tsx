import {
  Box,
  Button,
  Heading,
  Input,
  HStack,
  VStack,
  Field,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goodSchema, type GoodFormData } from '../model/schemas'
import type { Good } from '../model/types'

interface GoodsFormProps {
  editingGood?: Good | null
  onSubmit: (data: GoodFormData) => void
  onCancel: () => void
}

export function GoodsForm({ editingGood, onSubmit, onCancel }: GoodsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoodFormData>({
    resolver: zodResolver(goodSchema),
    defaultValues: editingGood ? {
      title: editingGood.title,
      price: editingGood.price,
      brand: editingGood.brand,
      sku: editingGood.sku || '',
    } : undefined,
  })

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>
        {editingGood ? 'Редактировать товар' : 'Добавить новый товар'}
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <Field.Root invalid={!!errors.title}>
            <Field.Label>Наименование</Field.Label>
            <Input {...register('title', { valueAsNumber: false })} />
            {errors.title && <Field.ErrorText>{errors.title.message}</Field.ErrorText>}
          </Field.Root>
          
          <Field.Root invalid={!!errors.price}>
            <Field.Label>Цена</Field.Label>
            <Input 
              type="number" 
              {...register('price', { valueAsNumber: true })} 
            />
            {errors.price && <Field.ErrorText>{errors.price.message}</Field.ErrorText>}
          </Field.Root>
          
          <Field.Root invalid={!!errors.brand}>
            <Field.Label>Вендор</Field.Label>
            <Input {...register('brand', { valueAsNumber: false })} />
            {errors.brand && <Field.ErrorText>{errors.brand.message}</Field.ErrorText>}
          </Field.Root>
          
          <Field.Root invalid={!!errors.sku}>
            <Field.Label>Артикул</Field.Label>
            <Input {...register('sku', { valueAsNumber: false })} />
            {errors.sku && <Field.ErrorText>{errors.sku.message}</Field.ErrorText>}
          </Field.Root>
          
          <HStack>
            <Button type="submit" colorPalette="blue">
              {editingGood ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  )
}