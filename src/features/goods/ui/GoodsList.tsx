import { useState, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
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
  Progress,
  Flex,
  Dialog,
} from '@chakra-ui/react'
import toast, { Toaster } from 'react-hot-toast'
import { useGoods } from '../model/useGoods'
import { type Good, type SortField } from '../model/types'
import { type GoodFormData } from '../model/schemas'
import { GoodsTable } from './GoodsTable'
import { GoodsForm } from './GoodsForm'
import { GoodsPagination } from './GoodsPagination'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Search, Add, RefreshIcon } from '../../../shared/ui'

export function GoodsList() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGood, setEditingGood] = useState<Good | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])

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
    refetchResetParams,
  } = useGoods()

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    [setSearch]
  )

  useEffect(() => {
    debouncedSearch(searchInput)
  }, [searchInput, debouncedSearch])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

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
      toast.success(`Товар "${data.title}" обновлён - ${data.price} ₽`)
      setEditingGood(null)
    } else {
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
    <Flex maxW="container.xl" py={8} flexDirection={'column'} gap={8} bg="#f9f9f9" >

      <Container bg="white" borderRadius="10px" >
        <HStack justify="space-between" bg="white" py={7}>
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
            paddingLeft={12}
            paddingInline={'none'}
            
          />
          </Box>
          <Button
            onClick={handleLogout}
            type="submit"
            size={'xs'}
            colorPalette={'blue'}
          >
            Выйти
          </Button>
        </HStack>
      </Container>

      <Container px={8} bg="white" py={7} borderRadius="10px">
        <HStack gap={4} pb={10} justify="space-between" >
          <Heading size="sm">Все позиции</Heading>
          
          <Flex gap={1}>
          <Button size={'xs'} variant={'outline'} onClick={refetchResetParams}>
            <RefreshIcon />
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            size={'xs'}
            colorPalette={'blue'}
          >
            <Add /> Добавить
          </Button>
          </Flex>
        </HStack>

        <Dialog.Root
          open={isModalOpen}
          onOpenChange={(e) => {
            if (!e.open) handleCancel()
          }}
          placement="center"
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="450px" p={6}>
              <Dialog.Header p={0} mb={4}>
                <Dialog.Title>
                  {editingGood ? 'Редактировать товар' : 'Добавить новый товар'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body p={0}>
                <GoodsForm
                  editingGood={editingGood}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {isLoading && (
          <VStack py={12} gap={4} w="100%">
            <Progress.Root w="100%" size="lg" value={null} colorPalette="blue" borderRadius="md">
              <Progress.Track w="100%">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
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
              goods={apiGoods}
              rowSelection={rowSelection}
              sorting={sorting}
              onRowSelectionChange={setRowSelection}
              onSortingChange={setSorting}
              onEdit={handleEdit}
            />

            {apiGoods.length === 0 && (
              <Text textAlign="center" color="gray.500" mt={8}>
                Товары не найдены
              </Text>
            )}

            <Flex justify={'space-between'} alignItems={'center'}>
              {total > 0 && (
                <Box textAlign="center" color="gray.500" mt={4} fontSize="sm" display={'inline'}>
                  Показано <Text display={'inline'} color={'black'}>{apiGoods.length} </Text> из <Text display={'inline'} color={'black'}>{total}</Text>
                </Box>
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