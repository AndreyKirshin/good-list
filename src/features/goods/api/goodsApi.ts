import axios from 'axios'
import type { Good, ProductsResponse, SortField, SortOrder } from '../model/types'

export const fetchGoods = async (
  query?: string,
  sortField?: SortField,
  sortOrderVal?: SortOrder,
  pageNum = 0,
  limitVal = 20
): Promise<{ goods: Good[]; total: number }> => {
  const skip = pageNum * limitVal
  
  const url = query
    ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`
    : 'https://dummyjson.com/products'
  
  const params: Record<string, string | number> = {
    limit: limitVal,
    skip: skip
  }
  
  if (sortField && sortOrderVal) {
    const apiSortField = sortField === 'title' ? 'title' : sortField
    params.sortBy = apiSortField
    params.order = sortOrderVal
  }
  
  const response = await axios.get<ProductsResponse>(url, { params })
  
  const productsWithBrand = response.data.products.map((product) => ({
    ...product,
    brand: product.brand || 'Unknown',
  }))
  
  return {
    goods: productsWithBrand,
    total: response.data.total
  }
}