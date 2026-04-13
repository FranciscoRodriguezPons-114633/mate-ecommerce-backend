"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
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
import { fetchProductById, fetchProducts, ApiProduct } from "@/lib/api"

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const id = params.id as string
    fetchProductById(id)
      .then((data) => {
        setProduct(data)
        // Cargar productos relacionados
        return fetchProducts(1, 20)
      })
      .then((data) => {
        setRelatedProducts(
          data.products.filter((p) => p._id !== params.id).slice(0, 4)
        )
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/3 mx-auto" />
            <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !product) {
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

  const galleryImages = [product.image, product.image, product.image, product.image]

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

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
          {/* Galería */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
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
                  <Image src={img} alt={`${product.name} - Vista ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="relative flex-1">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
                <Image
                  src={galleryImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <Link 
              href={`/productos?categoria=${encodeURIComponent(product.category)}`}
              className="text-sm font-medium uppercase tracking-wider text-accent hover:underline"
            >
              {product.category}
            </Link>

            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <div className="mt-6">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6">
              {product.quantity > 10 ? (
                <p className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  En stock - Disponible para envío inmediato
                </p>
              ) : product.quantity > 0 ? (
                <p className="text-sm text-amber-600">
                  Solo quedan {product.quantity} unidades
                </p>
              ) : (
                <p className="text-sm text-red-600">Sin stock</p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium text-foreground">Cantidad:</span>
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-border text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.quantity}
                    className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium transition-all disabled:opacity-50 ${
                  isAddedToCart 
                    ? "bg-green-600 text-white" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isAddedToCart ? (
                  <><Check className="h-5 w-5" />Agregado al carrito</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" />Agregar al carrito</>
                )}
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  isFavorite 
                    ? "border-red-200 bg-red-50 text-red-500" 
                    : "border-border text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-8 grid gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Envío gratis</p>
                  <p className="text-xs text-muted-foreground">En compras +$30.000</p>
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
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/productos/${p._id}`} className="group block">
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.category}</p>
                      <h3 className="mt-1 font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="mt-2 text-lg font-bold text-foreground">{formatPrice(p.price)}</p>
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