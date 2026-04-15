"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/context/cart-context"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating?: number
  isNew?: boolean
  isOnSale?: boolean
  priority?: boolean
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  rating = 5,
  isNew,
  isOnSale,
  priority = false,
}: ProductCardProps) {
  const { addToCart } = useCart()

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Evitar navegación al hacer clic en agregar
    addToCart({
      id,
      name,
      price,
      image,
    })
  }

  return (
    <Link href={`/productos/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Nuevo
            </span>
          )}
          {isOnSale && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              Oferta
            </span>
          )}
        </div>

        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <Image
            src={image}
            alt={name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {category}
          </p>
          <h3 className="mt-1 font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>

          {/* Precio y botón */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="Agregar al carrito"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
