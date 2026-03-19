import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  HStack,
  VStack,
  SimpleGrid,
  Text,
  Badge,
  Field,
  createToaster,
  Spinner,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const toaster = createToaster({
  placement: 'top-end',
})

interface Good {
  id: number
  title: string
  price: number
  brand: string
  category: string
  rating: number
  sku?: string
}

interface ProductsResponse {
  products: Good[]
  total: number
  skip: number
  limit: number
}

const goodSchema = z.object({
  title: z.string().min(1, 'Наименование обязательно'),
  price: z.number().min(0, 'Цена должна быть положительной'),
  brand: z.string().min(1, 'Вендор обязателен'),
  sku: z.string().min(1, 'Артикул обязателен'),
})

type GoodFormData = z.infer<typeof goodSchema>

type SortField = 'title' | 'price' | 'rating'
type SortOrder = 'asc' | 'desc'

export function GoodsPage() {
  const [goods, setGoods] = useState<Good[]>([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoodFormData>({
    resolver: zodResolver(goodSchema),
  })

  // Загрузка данных с API
  const fetchGoods = useCallback(async (query?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = query
        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
        : 'https://dummyjson.com/products'
      
      const response = await axios.get<ProductsResponse>(url, {
        params: { limit: 100 }
      })
      
      // Добавляем sku если его нет (для совместимости с формой)
      const productsWithSku = response.data.products.map((product) => ({
        ...product,
        sku: product.sku || `SKU-${product.id}-${Date.now()}`,
        brand: product.brand || 'Unknown',
      }))
      
      setGoods(productsWithSku)
    } catch (err) {
      console.error('Error fetching goods:', err)
      setError('Не удалось загрузить товары. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchGoods()
  }, [fetchGoods])

  // Сохранение состояния сортировки в localStorage
  useEffect(() => {
    const savedSortBy = localStorage.getItem('sortBy') as SortField | null
    const savedSortOrder = localStorage.getItem('sortOrder') as SortOrder | null
    
    if (savedSortBy) setSortBy(savedSortBy)
    if (savedSortOrder) setSortOrder(savedSortOrder)
  }, [])

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy)
    localStorage.setItem('sortOrder', sortOrder)
  }, [sortBy, sortOrder])

  // Обработчик поиска с задержкой
  const handleSearch = useCallback(() => {
    setSearch(searchInput)
    fetchGoods(searchInput)
  }, [searchInput, fetchGoods])

  // Обработчик изменения поискового запроса с задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        handleSearch()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchInput, search, handleSearch])

  const filteredAndSortedGoods = useMemo(() => {
    let result = [...goods]
    
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return result
  }, [goods, sortBy, sortOrder])

  const onSubmit = (data: GoodFormData) => {
    const newGood: Good = {
      id: Date.now(),
      ...data,
      category: 'Custom',
      rating: 5,
    }
    const updatedGoods = [...goods, newGood]
    setGoods(updatedGoods)
    
    toaster.create({
      title: 'Товар добавлен',
      description: `${data.title} - ${data.price} ₽`,
      type: 'success',
      duration: 3000,
    })
    
    reset()
    setIsModalOpen(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('auth_session')
    localStorage.removeItem('auth_session')
    navigate('/')
  }

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIndicator = (field: SortField) => {
    if (sortBy !== field) return ''
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="xl">Список товаров</Heading>
        <Button colorPalette="red" onClick={handleLogout}>
          Выйти
        </Button>
      </HStack>

      <HStack mb={6} gap={4}>
        <Input
          placeholder="Поиск по названию..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          maxW="400px"
        />
        <Button 
          variant={sortBy === 'title' ? 'solid' : 'outline'} 
          colorPalette="blue"
          onClick={() => toggleSort('title')}
        >
          По названию{getSortIndicator('title')}
        </Button>
        <Button 
          variant={sortBy === 'price' ? 'solid' : 'outline'}
          colorPalette="blue"
          onClick={() => toggleSort('price')}
        >
          По цене{getSortIndicator('price')}
        </Button>
        <Button 
          variant={sortBy === 'rating' ? 'solid' : 'outline'}
          colorPalette="blue"
          onClick={() => toggleSort('rating')}
        >
          По рейтингу{getSortIndicator('rating')}
        </Button>
        <Button colorPalette="green" onClick={() => setIsModalOpen(true)}>
          Добавить товар
        </Button>
      </HStack>

      {isModalOpen && (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md" mb={6}>
          <Heading size="md" mb={4}>Добавить новый товар</Heading>
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
                <Button type="submit" colorPalette="blue">Добавить</Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      )}

      {isLoading && (
        <VStack py={12} gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Загрузка товаров...</Text>
        </VStack>
      )}

      {error && (
        <Box bg="red.50" p={4} borderRadius="md" mb={6}>
          <Text color="red.600">{error}</Text>
          <Button mt={2} size="sm" onClick={() => fetchGoods(search)}>
            Повторить
          </Button>
        </Box>
      )}

      {!isLoading && !error && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {filteredAndSortedGoods.map((good) => (
            <Box
              key={good.id}
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="md"
              _hover={{ boxShadow: 'lg' }}
              borderWidth="2px"
              borderColor={good.rating < 3 ? 'red.400' : 'transparent'}
            >
              <VStack align="stretch" gap={2}>
                <Heading size="md">{good.title}</Heading>
                <HStack gap={2}>
                  <Badge colorPalette="purple">{good.category}</Badge>
                  <Badge colorPalette="gray">{good.brand}</Badge>
                </HStack>
                <Text fontSize="xl" fontWeight="bold" color="blue.600">
                  {good.price.toLocaleString()} ₽
                </Text>
                <HStack gap={2}>
                  <Text fontSize="sm" color="gray.600">Рейтинг:</Text>
                  <Text 
                    fontSize="sm" 
                    fontWeight="bold"
                    color={good.rating < 3 ? 'red.500' : 'green.500'}
                  >
                    {good.rating.toFixed(1)}
                  </Text>
                </HStack>
                {good.sku && (
                  <Text fontSize="xs" color="gray.500">Артикул: {good.sku}</Text>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {!isLoading && !error && filteredAndSortedGoods.length === 0 && (
        <Text textAlign="center" color="gray.500" mt={8}>
          Товары не найдены
        </Text>
      )}
    </Container>
  )
}