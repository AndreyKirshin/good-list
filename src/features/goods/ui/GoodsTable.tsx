import { useMemo } from 'react'
import {
  Box,
  HStack,
  Text,
  Image,
  Checkbox,
  Menu,
  Portal,
  Heading,
  Button,
  Flex,
} from '@chakra-ui/react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type RowSelectionState,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table'
import type { Good } from '../model/types'
import { MenuIcon, PlusIcon } from '../../../shared/ui'

interface GoodsTableProps {
  goods: Good[]
  rowSelection: RowSelectionState
  sorting: SortingState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  onSortingChange: OnChangeFn<SortingState>
  onEdit: (good: Good) => void
}

const columnHelper = createColumnHelper<Good>()

export function GoodsTable({
  goods,
  rowSelection,
  sorting,
  onRowSelectionChange,
  onSortingChange,
  onEdit,
}: GoodsTableProps) {
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
            onRowSelectionChange(newSelection)
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control 
            _checked={{
              bg: '#3C538E',
              borderColor: '#3C538E',
              color: '#3C538E'
            }}
          />
        </Checkbox.Root>
      ),
      cell: ({ row }) => (
        <Checkbox.Root
          checked={!!rowSelection[row.original.id.toString()]}
          onCheckedChange={(details) => {
            onRowSelectionChange((prev: RowSelectionState) => {
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
          <Checkbox.Control
            bg={rowSelection[row.original.id.toString()] ? '#3C538E' : 'transparent'}
            borderColor={rowSelection[row.original.id.toString()] ? '#3C538E' : 'gray.300'}
            _checked={{
              bg: '#3C538E',
              borderColor: '#3C538E',
              color: '#3C538E'
            }}
          />
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
            boxSize={10}
            objectFit="cover"
            borderRadius="md"
          />
          <Box>
            <Heading size={'sm'} >{info.getValue()}</Heading>
            <Text textStyle={'xs'} color={'#B2B3B9'}>{info.row.original.category ?? ''}</Text>
          </Box>
        </HStack>
      ),
    }),
    columnHelper.accessor('brand', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          justify={'space-around'}
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Вендор</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => (
        <HStack justify={'space-around'}>
          <Heading size={'sm'} >{info.getValue()}</Heading>
        </HStack>
      ),
    }),
    columnHelper.accessor('sku', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          justify={'space-around'}
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Артикул</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => (
        <HStack justify={'space-around'}>
          <Text fontSize="sm" color="gray.600">{info.getValue()}</Text>
        </HStack>
      ),
    }),
    columnHelper.accessor('rating', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          justify={'space-around'}
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Оценка</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => (
        <HStack justify={'space-around'}>
          <Box>
            <Text fontSize={'16px'} display={'inline'} color={info.getValue() < 3 ? '#F11010' : '#000000'}>
              {info.getValue().toFixed(1)}
            </Text>
            <Text fontSize={'16px'} display={'inline'}>/5</Text>
          </Box>
        </HStack>
      ),
    }),
    columnHelper.accessor('price', {
      header: ({ column }) => (
        <HStack
          gap={1}
          cursor="pointer"
          justify={'space-around'}
          onClick={() => column.toggleSorting()}
        >
          <Text fontWeight="600">Цена</Text>
          {column.getIsSorted() === 'asc' && <Text>↑</Text>}
          {column.getIsSorted() === 'desc' && <Text>↓</Text>}
        </HStack>
      ),
      cell: (info) => {
        const price = info.getValue()
        const [integerPart, decimalPart] = price.toLocaleString('ru-RU').split(',')
        return (
          <HStack justify={'space-around'}>
            <Text fontFamily="'Roboto Mono', monospace" fontSize="16px" lineHeight="110%" >
              <Text as="span" fontWeight="bold" color="black">
                {integerPart}
              </Text>
              <Text as="span" fontWeight="bold" color="gray.400">
                ,{decimalPart} ₽
              </Text>
            </Text>
          </HStack>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <Flex alignItems={'center'} justify={'end'}>
          <Button
            variant={'ghost'}
            size={'sm'}
            background={'#242EDB'}
            h='27px'
            w='52px'
            borderRadius={'23px'}
          >
            <PlusIcon width="16" height="16" color="white" />
          </Button>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                aria-label="Действия"
                size='md'
                variant="ghost"
              >
                <MenuIcon color="#B2B3B9" />
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item
                    value="edit"
                    onClick={() => onEdit(row.original)}
                  >
                    Редактировать
                  </Menu.Item>
                  <Menu.Item value="delete" color="red">Удалить</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      ),
    }),
  ], [goods, rowSelection, onRowSelectionChange, onEdit])

  const table = useReactTable({
    data: goods,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Box overflowX="auto" bg="white" borderRadius="lg" >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    textAlign: 'left',
                    borderBottom: '1px solid #e2e8f0',
           
                  }}
                >
                  <Heading size={'sm'} px={4} py={8} color={'#B2B3B9'}>
                    {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  </Heading>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isSelected = !!rowSelection[row.original.id.toString()]
            return (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid #e2e8f0',
                borderLeft: isSelected ? '3px solid #3C538E' : 'none',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#EEF2FF' : '#f7fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#EEF2FF' : 'transparent'}
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
          )})}
        </tbody>
      </table>
    </Box>
  )
}