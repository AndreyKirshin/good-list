import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [page, setPage] = useState(0)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoodFormData>({
    resolver: zodResolver(goodSchema),
  })

  // Загрузка данных с API
  const fetchGoods = useCallback(async (
    query?: string,
    sortField?: SortField,
    sortOrderVal?: SortOrder,
    pageNum?: number,
    limitVal?: number
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const currentPage = pageNum ?? page
      const currentLimit = limitVal ?? limit
      const skip = currentPage * currentLimit
      
      let url = query
        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
        : 'https://dummyjson.com/products'
      
      const params: Record<string, string | number> = {
        limit: currentLimit,
        skip: skip
      }
      
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
      setTotal(response.data.total)
    } catch (err) {
      console.error('Error fetching goods:', err)
      setError('Не удалось загрузить товары. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  // Чтение параметров из URL и загрузка данных при монтировании
  useEffect(() => {
    const pageParam = searchParams.get('page')
    const sortByParam = searchParams.get('sortBy') as SortField | null
    const orderParam = searchParams.get('order') as SortOrder | null
    
    let initialPage = 0
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10)
      if (!isNaN(pageNum) && pageNum >= 0) {
        initialPage = pageNum
        setPage(pageNum)
      }
    }
    
    if (sortByParam) {
      setSortBy(sortByParam)
    }
    if (orderParam) {
      setSortOrder(orderParam)
    }
    
    // Загружаем данные с учётом параметров из URL
    fetchGoods(search, sortByParam || sortBy, orderParam || sortOrder, initialPage, limit)
  }, [])

  // Обновление URL при изменении параметров
  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 0) params.set('page', page.toString())
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('order', sortOrder)
    setSearchParams(params, { replace: true })
  }, [page, sortBy, sortOrder, setSearchParams])

  // Загрузка данных при изменении page (после начальной загрузки)
  useEffect(() => {
    // Пропускаем первый вызов, так как данные уже загружены в initial effect
    fetchGoods(search, sortBy, sortOrder, page, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sortBy, sortOrder, limit])

  // Отслеживание изменений сортировки из react-table и запрос к API
  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0]
      const field = sort.id as SortField
      const order = sort.desc ? 'desc' : 'asc'
      
      // Обновляем состояние и загружаем данные с новой сортировкой
      setSortBy(field)
      setSortOrder(order)
      // Сбрасываем страницу при сортировке
      setPage(0)
      fetchGoods(search, field, order, 0, limit)
    }
  }, [sorting])

  // Вычисляем общее количество страниц
  const totalPages = Math.ceil(total / limit)

  // Генерация массива страниц для отображения
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(0)
      
      if (page > 2) {
        pages.push('...')
      }
      
      // Показываем страницы вокруг текущей
      const start = Math.max(1, page - 1)
      const end = Math.min(totalPages - 2, page + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (page < totalPages - 3) {
        pages.push('...')
      }
      
      // Всегда показываем последнюю страницу
      pages.push(totalPages - 1)
    }
    
    return pages
  }

  // Обработчик смены страницы
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  // Обработчик поиска с задержкой
  const handleSearch = useCallback(() => {
    setSearch(searchInput)
    setPage(0) // Сбрасываем страницу при новом поиске
    fetchGoods(searchInput, sortBy, sortOrder, 0, limit)
  }, [searchInput, fetchGoods, sortBy, sortOrder, limit])

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
          <Button mt={2} size="sm" onClick={() => fetchGoods(search, sortBy, sortOrder, page, limit)}>
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

      {/* Пагинация */}
      {!isLoading && !error && totalPages > 1 && (
        <HStack justify="center" mt={6} gap={2}>
          {/* Кнопка назад */}
          <IconButton
            aria-label="Предыдущая страница"
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0Z" />
            </svg>
          </IconButton>

          {/* Кнопки страниц */}
          {getPageNumbers().map((pageNum, idx) => (
            typeof pageNum === 'number' ? (
              <Button
                key={idx}
                size="sm"
                variant={pageNum === page ? 'solid' : 'outline'}
                colorPalette={pageNum === page ? 'blue' : 'gray'}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum + 1}
              </Button>
            ) : (
              <Text key={idx} px={2}>...</Text>
            )
          ))}

          {/* Кнопка вперёд */}
          <IconButton
            aria-label="Следующая страница"
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708Z" />
            </svg>
          </IconButton>
        </HStack>
      )}

      {/* Информация о количестве */}
      {!isLoading && !error && total > 0 && (
        <Text textAlign="center" color="gray.500" mt={4} fontSize="sm">
          Показано {goods.length} из {total} товаров • Страница {page + 1} из {totalPages}
        </Text>
      )}
    </Container>
  )
}