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
  Text,
  Badge,
  Field,
  createToaster,
  Spinner,
  Checkbox,
  IconButton,
  Image,
  Menu,
  Portal,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'

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
  thumbnail?: string
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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
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
  const fetchGoods = useCallback(async (query?: string, sortField?: SortField, sortOrderVal?: SortOrder) => {
    setIsLoading(true)
    setError(null)
    try {
      let url = query
        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
        : 'https://dummyjson.com/products'
      
      const params: Record<string, string | number> = { limit: 100 }
      
      // Добавляем параметры сортировки для API
      if (sortField && sortOrderVal) {
        // Маппим поля на параметры API
        const apiSortField = sortField === 'title' ? 'title' : sortField
        params.sortBy = apiSortField
        params.order = sortOrderVal
      }
      
      const response = await axios.get<ProductsResponse>(url, { params })
      
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
    fetchGoods(search, sortBy, sortOrder)
  }, [fetchGoods, sortBy, sortOrder])

  // Отслеживание изменений сортировки из react-table и запрос к API
  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0]
      const field = sort.id as SortField
      const order = sort.desc ? 'desc' : 'asc'
      
      // Обновляем состояние и загружаем данные с новой сортировкой
      setSortBy(field)
      setSortOrder(order)
      fetchGoods(search, field, order)
    }
  }, [sorting])

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
    fetchGoods(searchInput, sortBy, sortOrder)
  }, [searchInput, fetchGoods, sortBy, sortOrder])

  // Обработчик изменения поискового запроса с задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        handleSearch()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchInput, search, handleSearch])

  // Данные теперь приходят отсортированными с сервера
  const filteredAndSortedGoods = goods

  const columnHelper = createColumnHelper<Good>()

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: () => (
        <Checkbox.Root
          checked={Object.keys(rowSelection).length === goods.length && goods.length > 0}
          onCheckedChange={(details) => {
            const newSelection: RowSelectionState = {}
            if (details.checked) {
              goods.forEach((good) => {
                newSelection[good.id.toString()] = true
              })
            }
            setRowSelection(newSelection)
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),
      cell: ({ row }) => (
        <Checkbox.Root
          checked={!!rowSelection[row.original.id.toString()]}
          onCheckedChange={(details) => {
            setRowSelection((prev) => {
              const newSelection = { ...prev }
              if (details.checked) {
                newSelection[row.original.id.toString()] = true
              } else {
                delete newSelection[row.original.id.toString()]
              }
              return newSelection
            })
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Наименование</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => (
        <HStack gap={3}>
          <Image
            src={info.row.original.thumbnail || `https://placehold.co/50x50?text=${info.getValue().charAt(0)}`}
            alt={info.getValue()}
            boxSize="40px"
            objectFit="cover"
            borderRadius="md"
          />
          <Text fontWeight="medium">{info.getValue()}</Text>
        </HStack>
      ),
    }),
    columnHelper.accessor('brand', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Вендор</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => <Badge colorPalette="gray">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('sku', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Артикул</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => <Text fontSize="sm" color="gray.600">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('rating', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Оценка</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => (
        <Text fontWeight="bold" color={info.getValue() < 3 ? 'red.500' : 'green.500'}>
          {info.getValue().toFixed(1)}
        </Text>
      ),
    }),
    columnHelper.accessor('price', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Цена</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => (
        <Text fontWeight="bold" color="blue.600">
          {info.getValue().toLocaleString()} ₽
        </Text>
      ),
    }),
    columnHelper.display({
      id: 'add',
      header: () => null,
      cell: () => (
        <IconButton
          aria-label="Добавить"
          size="sm"
          colorPalette="blue"
          variant="ghost"
          borderRadius="full"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
          </svg>
        </IconButton>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: () => (
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="Действия"
              size="sm"
              variant="ghost"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
              </svg>
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="edit">Редактировать</Menu.Item>
                <Menu.Item value="delete" color="red">Удалить</Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      ),
    }),
  ], [columnHelper, goods, rowSelection])

  const table = useReactTable({
    data: filteredAndSortedGoods,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

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
          <Button mt={2} size="sm" onClick={() => fetchGoods(search, sortBy, sortOrder)}>
            Повторить
          </Button>
        </Box>
      )}

      {!isLoading && !error && (
        <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e2e8f0',
                        backgroundColor: '#f7fafc',
                        fontWeight: '600',
                        color: '#4a5568',
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '12px 16px',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {!isLoading && !error && filteredAndSortedGoods.length === 0 && (
        <Text textAlign="center" color="gray.500" mt={8}>
          Товары не найдены
        </Text>
      )}
    </Container>
  )
}