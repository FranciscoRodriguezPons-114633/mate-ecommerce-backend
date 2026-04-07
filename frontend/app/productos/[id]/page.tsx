"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Check
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/cart-context"
import { getProductById, products } from "@/lib/products-data"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  
  const product = getProductById(params.id as string)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">Producto no encontrado</h1>
            <p className="mt-4 text-muted-foreground">El producto que buscas no existe o fue removido.</p>
            <Link 
              href="/productos"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a productos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Galería de imágenes (usar images del producto o repetir la imagen principal)
  const galleryImages = product.images && product.images.length > 1 
    ? product.images 
    : [product.image, product.image, product.image, product.image]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  // Productos relacionados (misma categoría)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-foreground transition-colors">Productos</Link>
          <span>/</span>
          <Link 
            href={`/productos?categoria=${encodeURIComponent(product.category)}`} 
            className="hover:text-foreground transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Galería de Imágenes - Estilo Amazon */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            {/* Miniaturas */}
            <div className="flex gap-2 sm:flex-col">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                    selectedImage === index 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - Vista ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Imagen Principal */}
            <div className="relative flex-1">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
                <Image
                  src={galleryImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                      Nuevo
                    </span>
                  )}
                  {product.isOnSale && discount > 0 && (
                    <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col">
            {/* Categoría */}
            <Link 
              href={`/productos?categoria=${encodeURIComponent(product.category)}`}
              className="text-sm font-medium uppercase tracking-wider text-accent hover:underline"
            >
              {product.category}
            </Link>

            {/* Título */}
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < product.rating 
                        ? "fill-amber-400 text-amber-400" 
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.rating}.0) · {(parseInt(product.id) * 7 + 23) % 50 + 15} reseñas
              </span>
            </div>

            {/* Precio */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                    Ahorrás {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Descripción */}
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Características */}
            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-foreground">Características:</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock */}
            <div className="mt-6">
              {product.stock > 10 ? (
                <p className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  En stock - Disponible para envío inmediato
                </p>
              ) : product.stock > 0 ? (
                <p className="text-sm text-amber-600">
                  Solo quedan {product.stock} unidades
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Sin stock
                </p>
              )}
            </div>

            {/* Selector de cantidad y Agregar al carrito */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Selector de cantidad */}
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium text-foreground">Cantidad:</span>
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-border text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Botón Agregar al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAddedToCart 
                    ? "bg-green-600 text-white" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Agregado al carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Agregar al carrito
                  </>
                )}
              </button>

              {/* Favoritos */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  isFavorite 
                    ? "border-red-200 bg-red-50 text-red-500" 
                    : "border-border text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                }`}
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Beneficios */}
            <div className="mt-8 grid gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Envío gratis</p>
                  <p className="text-xs text-muted-foreground">En compras +$15.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Garantía</p>
                  <p className="text-xs text-muted-foreground">6 meses de garantía</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Devolución</p>
                  <p className="text-xs text-muted-foreground">30 días sin cargo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-border pt-16">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              También te puede interesar
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id} 
                  href={`/productos/${relatedProduct.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {relatedProduct.category}
                      </p>
                      <h3 className="mt-1 font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="mt-2 text-lg font-bold text-foreground">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
