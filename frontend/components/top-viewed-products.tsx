"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Eye } from "lucide-react"
import { fetchTopViewedProducts, type TopViewedProduct } from "@/lib/api"

const formatViews = (views: number) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(views)

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)

export function TopViewedProducts() {
  const [products, setProducts] = useState<TopViewedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopViewedProducts(4)
      .then((data) => setProducts(data.filter((item) => item.product || item.name)))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-8 w-56 rounded bg-secondary" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Tendencias
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Más vistos por la comunidad
            </h2>
          </div>
          <Link
            href="/productos"
            className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((item) => {
            const product = item.product
            const href = product?._id ? `/productos/${product._id}` : "/productos"
            const name = product?.name || item.name || "Producto"
            const image = product?.image || item.image || "/placeholder.jpg"

            return (
              <Link key={item.product_id} href={href} className="group block">
                <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                      <Eye className="h-3.5 w-3.5" />
                      {formatViews(item.views)}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {product?.category || "Producto destacado"}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
                      {name}
                    </h3>
                    {product?.price && (
                      <p className="mt-3 text-lg font-bold text-foreground">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
