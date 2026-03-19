import { useState, useEffect, useCallback } from 'react'
import type { Good, SortField, SortOrder } from './types'
import { fetchGoods } from '../api/goodsApi'

interface UseGoodsOptions {
  initialPage?: number
  initialSortBy?: SortField
  initialSortOrder?: SortOrder
  limit?: number
}

interface UseGoodsReturn {
  goods: Good[]
  isLoading: boolean
  error: string | null
  page: number
  total: number
  totalPages: number
  sortBy: SortField | undefined
  sortOrder: SortOrder | undefined
  search: string
  setPage: (page: number) => void
  setSortBy: (sortBy: SortField | undefined) => void
  setSortOrder: (sortOrder: SortOrder | undefined) => void
  setSearch: (search: string) => void
  refetch: () => void
}

export function useGoods(options: UseGoodsOptions = {}): UseGoodsReturn {
  const {
    initialPage = 0,
    initialSortBy,
    initialSortOrder,
    limit = 20
  } = options

  const [goods, setGoods] = useState<Good[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField | undefined>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(initialSortOrder)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [total, setTotal] = useState(0)

  const loadGoods = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchGoods(search, sortBy, sortOrder, page, limit)
      setGoods(result.goods)
      setTotal(result.total)
    } catch (err) {
      console.error('Error fetching goods:', err)
      setError('Не удалось загрузить товары. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }, [search, sortBy, sortOrder, page, limit])

  useEffect(() => {
    loadGoods()
  }, [loadGoods])

  const totalPages = Math.ceil(total / limit)

  const refetch = useCallback(() => {
    loadGoods()
  }, [loadGoods])

  return {
    goods,
    isLoading,
    error,
    page,
    total,
    totalPages,
    sortBy,
    sortOrder,
    search,
    setPage,
    setSortBy,
    setSortOrder,
    setSearch,
    refetch
  }
}