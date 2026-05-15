const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export interface ApiProduct {
  _id: string
  id?: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  image: string
  isNew?: boolean
  isOnSale?: boolean
  originalPrice?: number
  rating?: number
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

export interface ApiCartItem {
  id?: string
  product?: string
  product_id?: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface ApiCartResponse {
  items: ApiCartItem[]
  updated_at: string | null
}

export interface TopViewedProduct {
  product_id: string
  views: number
  name: string | null
  image: string | null
  product?: ApiProduct | null
}

export interface TopSoldProduct {
  position: number
  product_id: string
  sales: number
  name: string
  image: string | null
  category: string | null
  price: number | null
  product?: ApiProduct | null
}

export interface RecommendationNode {
  id: string
  type: "User" | "Product" | "Category" | "Order"
  label: string
  image?: string
  recommended?: boolean
}

export interface RecommendationRelationship {
  from: string
  to: string
  type: "PURCHASED" | "VIEWED" | "IN_CATEGORY" | "CONTAINS" | "SIMILAR_TO"
  quantity?: number
  score?: number
  date?: string
}

export interface ProductRecommendation {
  position: number
  product_id: string
  score: number
  reason: string
  name: string
  image: string
  category: string
  price: number
  product: ApiProduct
}

export interface RecommendationResponse {
  source: "neo4j" | "mongo-fallback"
  user: {
    id: string
    name: string
  }
  recommendations: ProductRecommendation[]
  graph: {
    nodes: RecommendationNode[]
    relationships: RecommendationRelationship[]
  }
  stats: {
    purchasedProducts: number
    categories: number
    recommendations: number
  }
  cypherExamples: {
    collaborative: string
    categoryTraversal: string
  }
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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

export async function trackProductView(productId: string): Promise<void> {
  await fetch(`${API_URL}/products/${productId}/view`, {
    method: "POST",
  })
}

export async function fetchTopViewedProducts(limit = 4): Promise<TopViewedProduct[]> {
  const res = await fetch(`${API_URL}/products/analytics/top?limit=${limit}`)
  if (!res.ok) throw new Error("Error al obtener productos mas vistos")
  return res.json()
}

export async function fetchTopSoldProducts(limit = 8): Promise<TopSoldProduct[]> {
  const res = await fetch(`${API_URL}/products/analytics/top-sold?limit=${limit}`)
  if (!res.ok) throw new Error("Error al obtener productos mas vendidos")
  return res.json()
}

export async function fetchCart(token: string): Promise<ApiCartResponse> {
  const res = await fetch(`${API_URL}/orders/cart`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error("Error al obtener carrito")
  return res.json()
}

export async function saveCart(token: string, items: ApiCartItem[]): Promise<ApiCartResponse> {
  const res = await fetch(`${API_URL}/orders/cart`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error("Error al guardar carrito")
  return res.json()
}

export async function clearSavedCart(token: string): Promise<ApiCartResponse> {
  const res = await fetch(`${API_URL}/orders/cart`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error("Error al limpiar carrito")
  return res.json()
}

export async function fetchRecommendations(
  token: string,
  limit = 8
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_URL}/recommendations?limit=${limit}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error("Error al obtener recomendaciones")
  return res.json()
}
