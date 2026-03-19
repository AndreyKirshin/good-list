export interface Good {
  id: number
  title: string
  price: number
  brand: string
  category: string
  rating: number
  sku?: string
  thumbnail?: string
}

export interface ProductsResponse {
  products: Good[]
  total: number
  skip: number
  limit: number
}

export type SortField = 'title' | 'price' | 'rating'
export type SortOrder = 'asc' | 'desc'