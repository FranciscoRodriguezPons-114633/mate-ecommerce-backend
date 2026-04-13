const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export interface ApiProduct {
  _id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  image: string
}

export interface ApiProductsResponse {
  products: ApiProduct[]
  pagination: {
    currentPage: number
    totalPages: number
    totalProducts: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function fetchProducts(page = 1, limit = 20): Promise<ApiProductsResponse> {
  const res = await fetch(`${API_URL}/products?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error("Error al obtener productos")
  return res.json()
}

export async function fetchProductById(id: string): Promise<ApiProduct> {
  const res = await fetch(`${API_URL}/products/${id}`)
  if (!res.ok) throw new Error("Producto no encontrado")
  return res.json()
}