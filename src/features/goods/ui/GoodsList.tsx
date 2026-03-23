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
  Flex,
} from '@chakra-ui/react'
import toast, { Toaster } from 'react-hot-toast'
import { useGoods } from '../model/useGoods'
import { type Good, type SortField } from '../model/types'
import { type GoodFormData } from '../model/schemas'
import { GoodsTable } from './GoodsTable'
import { GoodsForm } from './GoodsForm'
import { GoodsPagination } from './GoodsPagination'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'

const Search = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

)

const Add = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
<path d="M8.9375 0C7.16983 0 5.44186 0.524175 3.97209 1.50624C2.50233 2.48831 1.35679 3.88415 0.680331 5.51727C0.00387248 7.15038 -0.17312 8.94741 0.171736 10.6811C0.516591 12.4148 1.36781 14.0073 2.61774 15.2573C3.86767 16.5072 5.46018 17.3584 7.19388 17.7033C8.92759 18.0481 10.7246 17.8711 12.3577 17.1947C13.9909 16.5182 15.3867 15.3727 16.3688 13.9029C17.3508 12.4331 17.875 10.7052 17.875 8.9375C17.8725 6.5679 16.9301 4.29606 15.2545 2.6205C13.5789 0.944933 11.3071 0.00250234 8.9375 0ZM8.9375 16.5C7.44178 16.5 5.97965 16.0565 4.736 15.2255C3.49236 14.3945 2.52305 13.2134 1.95066 11.8315C1.37828 10.4497 1.22851 8.92911 1.52032 7.46213C1.81212 5.99515 2.53237 4.64764 3.59001 3.59001C4.64764 2.53237 5.99515 1.81211 7.46213 1.52031C8.92911 1.22851 10.4497 1.37827 11.8315 1.95066C13.2134 2.52305 14.3945 3.49235 15.2255 4.736C16.0565 5.97965 16.5 7.44178 16.5 8.9375C16.4977 10.9425 15.7002 12.8647 14.2825 14.2825C12.8647 15.7002 10.9425 16.4977 8.9375 16.5ZM13.0625 8.9375C13.0625 9.11984 12.9901 9.29471 12.8611 9.42364C12.7322 9.55257 12.5573 9.625 12.375 9.625H9.625V12.375C9.625 12.5573 9.55257 12.7322 9.42364 12.8611C9.29471 12.9901 9.11984 13.0625 8.9375 13.0625C8.75517 13.0625 8.5803 12.9901 8.45137 12.8611C8.32244 12.7322 8.25 12.5573 8.25 12.375V9.625H5.5C5.31767 9.625 5.1428 9.55257 5.01387 9.42364C4.88494 9.29471 4.8125 9.11984 4.8125 8.9375C4.8125 8.75516 4.88494 8.5803 5.01387 8.45136C5.1428 8.32243 5.31767 8.25 5.5 8.25H8.25V5.5C8.25 5.31766 8.32244 5.1428 8.45137 5.01386C8.5803 4.88493 8.75517 4.8125 8.9375 4.8125C9.11984 4.8125 9.29471 4.88493 9.42364 5.01386C9.55257 5.1428 9.625 5.31766 9.625 5.5V8.25H12.375C12.5573 8.25 12.7322 8.32243 12.8611 8.45136C12.9901 8.5803 13.0625 8.75516 13.0625 8.9375Z" fill="white"/>
</svg>

)

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
    <Flex maxW="container.xl" py={8} flexDirection={'column'} gap={'30px'} bg="#f9f9f9" >

      <Container px={'30px'} bg="white" borderRadius="10px" >
        <HStack justify="space-between" mb={6} bg="white" py={'26px'} maxW="container.xl">
          <Heading size="xl">Товары</Heading>
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            width={'50%'}
            >
            <Box
              position="absolute"
              left={4}
              zIndex={2}
              color="#c9c9c9"
            >
              <Search width={24} height={24} />
            </Box>
          <Input
            placeholder="Найти"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            border="1.5px solid"
            borderColor="#ededed"
            borderRadius="10px"
            background={'#F3F3F3'}
            paddingLeft={'48px'}
            paddingInline={'none'}
            
          />
          </Box>
          <Button
            onClick={handleLogout}
            type="submit"
            size={'xs'}
            bg="linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 100%), linear-gradient(0deg, #242edb 0%, #242edb 100%)"
            border="1px solid"
            borderColor="#357aff"
            boxShadow="inset 0px -2px 0px 1px rgba(0, 0, 0, 0.08), 0px 8px 8px rgba(54, 122, 255, 0.03)"
            color="white"
            _hover={{
              bg: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 100%), linear-gradient(0deg, #1a1eb8 0%, #1a1eb8 100%)',
            }}
            _active={{
              boxShadow: 'inset 0px 2px 0px 1px rgba(0, 0, 0, 0.08)',
            }}
          >
            Выйти
          </Button>
        </HStack>
      </Container>

      <Container px={'30px'} bg="white" py={'26px'} borderRadius="10px">
        <HStack mb={6} gap={4} justify="space-between" >
          <Heading size="xs">Все позиции</Heading>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            size={'xs'}
            bg="linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 100%), linear-gradient(0deg, #242edb 0%, #242edb 100%)"
            border="1px solid"
            borderColor="#357aff"
            boxShadow="inset 0px -2px 0px 1px rgba(0, 0, 0, 0.08), 0px 8px 8px rgba(54, 122, 255, 0.03)"
            color="white"
            _hover={{
              bg: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 100%), linear-gradient(0deg, #1a1eb8 0%, #1a1eb8 100%)',
            }}
            _active={{
              boxShadow: 'inset 0px 2px 0px 1px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Add /> Добавить товар
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

            <Flex justify={'space-between'} alignItems={'center'}>
              {total > 0 && (
                <Text textAlign="center" color="gray.500" mt={4} fontSize="sm" display={'inline'}>
                  Показано <Text display={'inline'} color={'black'}>{localGoods.length} </Text> из <Text display={'inline'} color={'black'}>{total}</Text>
                </Text>
              )}
              <GoodsPagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Flex>

          </>
        )}
        <Toaster position="top-right" />

      </Container>

    </Flex>
  )
}