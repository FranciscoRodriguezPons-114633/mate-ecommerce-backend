// Datos de productos de ejemplo
// Cuando conectes tu backend, estos se cargarán desde la API

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  rating: number
  stock: number
  isNew?: boolean
  isOnSale?: boolean
  features?: string[]
}

export const products: Product[] = [
  {
    id: "1",
    name: "Mate Imperial con Virola de Alpaca",
    description: "Calabaza natural de primera calidad con virola de alpaca labrada a mano. Curado y listo para usar. Ideal para el matero exigente que busca tradición y elegancia.",
    price: 18500,
    originalPrice: 22000,
    image: "/product-mate-1.jpg",
    images: ["/product-mate-1.jpg", "/product-mate-1-b.jpg", "/product-mate-1-c.jpg", "/product-mate-1-d.jpg"],
    category: "Calabazas",
    rating: 5,
    stock: 15,
    isOnSale: true,
    features: ["Calabaza natural", "Virola de alpaca", "Curado artesanal", "Hecho en Argentina"],
  },
  {
    id: "2",
    name: "Bombilla Cincelada de Alpaca",
    description: "Bombilla artesanal de alpaca con diseño cincelado único. Filtro desmontable para fácil limpieza. Una pieza de colección para los amantes del mate.",
    price: 8900,
    image: "/product-bombilla-1.jpg",
    images: ["/product-bombilla-1.jpg", "/product-bombilla-1-b.jpg", "/product-bombilla-1-c.jpg", "/product-bombilla-1-d.jpg"],
    category: "Bombillas",
    rating: 5,
    stock: 28,
    isNew: true,
    features: ["Alpaca premium", "Diseño cincelado", "Filtro desmontable", "21cm de largo"],
  },
  {
    id: "3",
    name: "Yerba Mate Premium Orgánica 1kg",
    description: "Yerba mate orgánica de producción sustentable. Sabor suave y equilibrado, perfecta para cebar durante todo el día sin perder intensidad.",
    price: 4500,
    image: "/product-yerba-1.jpg",
    images: ["/product-yerba-1.jpg"],
    category: "Yerba Mate",
    rating: 4,
    stock: 100,
    features: ["100% orgánica", "Producción sustentable", "Sabor suave", "Estacionada 24 meses"],
  },
  {
    id: "4",
    name: "Set Completo Matero Premium",
    description: "Todo lo que necesitás para empezar: mate de calabaza, bombilla de alpaca, termo Stanley 1L, yerbera de cuero y bolso matero. El regalo perfecto.",
    price: 45000,
    originalPrice: 52000,
    image: "/product-set-1.jpg",
    images: ["/product-set-1.jpg", "/product-set-1-b.jpg", "/product-set-1-c.jpg", "/product-set-1-d.jpg"],
    category: "Sets",
    rating: 5,
    stock: 8,
    isOnSale: true,
    features: ["Mate de calabaza", "Bombilla de alpaca", "Termo 1L", "Yerbera de cuero", "Bolso matero"],
  },
  {
    id: "5",
    name: "Mate de Algarrobo Tallado",
    description: "Mate tallado a mano en madera de algarrobo. Cada pieza es única con vetas naturales que lo hacen irrepetible. Incluye base para apoyar.",
    price: 24000,
    image: "/product-mate-2.jpg",
    images: ["/product-mate-2.jpg", "/product-mate-2-b.jpg", "/product-mate-2-c.jpg", "/product-mate-2-d.jpg"],
    category: "Calabazas",
    rating: 5,
    stock: 12,
    isNew: true,
    features: ["Madera de algarrobo", "Tallado a mano", "Pieza única", "Incluye base"],
  },
  {
    id: "6",
    name: "Termo Matero de Acero 1L",
    description: "Termo de acero inoxidable con sistema de vertido ideal para cebar mate. Mantiene la temperatura hasta 24 horas. Diseño elegante color verde bosque.",
    price: 28000,
    image: "/product-termo-1.jpg",
    images: ["/product-termo-1.jpg"],
    category: "Accesorios",
    rating: 4,
    stock: 20,
    features: ["Acero inoxidable", "1 litro", "24hs temperatura", "Pico matero"],
  },
  {
    id: "7",
    name: "Bombilla Pico de Loro Acero",
    description: "Bombilla clásica pico de loro en acero quirúrgico. Ideal para iniciarse en el mundo del mate. Duradera y fácil de limpiar.",
    price: 3500,
    image: "/product-bombilla-1.jpg",
    images: ["/product-bombilla-1.jpg"],
    category: "Bombillas",
    rating: 4,
    stock: 50,
    features: ["Acero quirúrgico", "Pico de loro", "18cm de largo", "Filtro incorporado"],
  },
  {
    id: "8",
    name: "Yerba Mate Suave Sin Palo 500g",
    description: "Yerba mate suave ideal para quienes prefieren un sabor más delicado. Sin palo para mayor rendimiento y sabor más puro.",
    price: 2800,
    image: "/product-yerba-1.jpg",
    images: ["/product-yerba-1.jpg"],
    category: "Yerba Mate",
    rating: 5,
    stock: 75,
    features: ["Sabor suave", "Sin palo", "Mayor rendimiento", "500g"],
  },
]

// Categorías disponibles
export const categories = [
  { id: "calabazas", name: "Calabazas", image: "/category-calabaza.jpg" },
  { id: "bombillas", name: "Bombillas", image: "/category-bombilla.jpg" },
  { id: "yerba", name: "Yerba Mate", image: "/category-yerba.jpg" },
  { id: "accesorios", name: "Accesorios", image: "/category-accesorios.jpg" },
]

// Función para obtener productos (simula llamada a API)
export function getProducts(category?: string): Product[] {
  if (category) {
    return products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    )
  }
  return products
}

// Función para obtener un producto por ID
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

// Función para obtener productos destacados
export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isNew || p.isOnSale).slice(0, 4)
}
