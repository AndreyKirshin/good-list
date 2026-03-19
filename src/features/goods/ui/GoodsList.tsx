import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  HStack,
  VStack,
  Text,
  Spinner,
} from '@chakra-ui/react'
import toast, { Toaster } from 'react-hot-toast'
import { useGoods } from '../model/useGoods'
import { type Good, type SortField } from '../model/types'
import { type GoodFormData } from '../model/schemas'
import { GoodsTable } from './GoodsTable'
import { GoodsForm } from './GoodsForm'
import { GoodsPagination } from './GoodsPagination'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'

export function GoodsList() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGood, setEditingGood] = useState<Good | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [localGoods, setLocalGoods] = useState<Good[]>([])

  const {
    goods: apiGoods,
    isLoading,
    error,
    page,
    total,
    totalPages,
    setPage,
    setSortBy,
    setSortOrder,
    setSearch,
    refetch,
  } = useGoods()

  // Объединяем товары из API и локальные
  useEffect(() => {
    setLocalGoods(apiGoods)
  }, [apiGoods])

  // Обработчик поиска с задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchInput, setSearch])

  // Обработчик сортировки из react-table
  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0]
      const field = sort.id as SortField
      const order = sort.desc ? 'desc' : 'asc'
      
      setSortBy(field)
      setSortOrder(order)
      setPage(0)
    }
  }, [sorting, setSortBy, setSortOrder, setPage])

  const handleLogout = () => {
    sessionStorage.removeItem('auth_session')
    localStorage.removeItem('auth_session')
    navigate('/')
  }

  const handleEdit = (good: Good) => {
    setEditingGood(good)
    setIsModalOpen(true)
  }

  const handleSubmit = (data: GoodFormData) => {
    if (editingGood) {
      const updatedGoods = localGoods.map((good) =>
        good.id === editingGood.id ? { ...good, ...data } : good
      )
      setLocalGoods(updatedGoods)
      toast.success(`Товар "${data.title}" обновлён - ${data.price} ₽`)
      setEditingGood(null)
    } else {
      const newGood: Good = {
        id: Date.now(),
        ...data,
        category: 'Custom',
        rating: 5,
      }
      setLocalGoods([...localGoods, newGood])
      toast.success(`Товар "${data.title}" добавлен - ${data.price} ₽`)
    }
    
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingGood(null)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
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
        <GoodsForm
          editingGood={editingGood}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
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
          <Button mt={2} size="sm" onClick={refetch}>
            Повторить
          </Button>
        </Box>
      )}

      {!isLoading && !error && (
        <>
          <GoodsTable
            goods={localGoods}
            rowSelection={rowSelection}
            sorting={sorting}
            onRowSelectionChange={setRowSelection}
            onSortingChange={setSorting}
            onEdit={handleEdit}
          />

          {localGoods.length === 0 && (
            <Text textAlign="center" color="gray.500" mt={8}>
              Товары не найдены
            </Text>
          )}

          <GoodsPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {total > 0 && (
            <Text textAlign="center" color="gray.500" mt={4} fontSize="sm">
              Показано {localGoods.length} из {total} товаров • Страница {page + 1} из {totalPages}
            </Text>
          )}
        </>
      )}
      <Toaster position="top-right" />
    </Container>
  )
}