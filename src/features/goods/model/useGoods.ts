import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Good, SortField, SortOrder } from './types'
import { fetchGoods } from '../api/goodsApi'

const VALID_SORT_FIELDS: SortField[] = ['title', 'price', 'rating']
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc']

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

  const [searchParams, setSearchParams] = useSearchParams()

  const getValidatedParam = <T extends string>(
    paramName: string,
    validValues: T[],
    defaultValue: T | undefined
  ): T | undefined => {
    const value = searchParams.get(paramName)
    if (value && validValues.includes(value as T)) {
      return value as T
    }
    return defaultValue
  }

  const getValidatedPage = (): number => {
    const pageParam = searchParams.get('page')
    const parsed = pageParam ? parseInt(pageParam, 10) : NaN
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed
    }
    return initialPage
  }

  const [goods, setGoods] = useState<Good[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField | undefined>(() =>
    getValidatedParam<SortField>('sortBy', VALID_SORT_FIELDS, initialSortBy)
  )
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(() =>
    getValidatedParam<SortOrder>('sortOrder', VALID_SORT_ORDERS, initialSortOrder)
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(getValidatedPage)
  const [total, setTotal] = useState(0)

  const prevSortByRef = useRef(sortBy)
  const prevSortOrderRef = useRef(sortOrder)
  const prevPageRef = useRef(page)

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

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    
    if (page !== prevPageRef.current) {
      if (page === initialPage) {
        newParams.delete('page')
      } else {
        newParams.set('page', String(page))
      }
      prevPageRef.current = page
    }
    
    if (sortBy !== prevSortByRef.current) {
      if (sortBy === initialSortBy || !sortBy) {
        newParams.delete('sortBy')
      } else {
        newParams.set('sortBy', sortBy)
      }
      prevSortByRef.current = sortBy
    }
    
    if (sortOrder !== prevSortOrderRef.current) {
      if (sortOrder === initialSortOrder || !sortOrder) {
        newParams.delete('sortOrder')
      } else {
        newParams.set('sortOrder', sortOrder)
      }
      prevSortOrderRef.current = sortOrder
    }

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true })
    }
  }, [page, sortBy, sortOrder, searchParams, setSearchParams, initialPage, initialSortBy, initialSortOrder])

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleSetSortBy = useCallback((newSortBy: SortField | undefined) => {
    setSortBy(newSortBy)
  }, [])

  const handleSetSortOrder = useCallback((newSortOrder: SortOrder | undefined) => {
    setSortOrder(newSortOrder)
  }, [])

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
    setPage: handleSetPage,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    setSearch,
    refetch
  }
}