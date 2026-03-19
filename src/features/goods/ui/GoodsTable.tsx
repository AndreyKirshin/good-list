import { useMemo } from 'react'
import {
  Box,
  HStack,
  Text,
  Badge,
  Image,
  IconButton,
  Checkbox,
  Menu,
  Portal,
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
          <Checkbox.Control />
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
      cell: ({ row }) => (
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
  )
}