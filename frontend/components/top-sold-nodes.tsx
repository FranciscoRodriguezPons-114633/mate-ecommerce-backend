"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Medal, ShoppingBag } from "lucide-react"
import { fetchTopSoldProducts, type TopSoldProduct } from "@/lib/api"

const formatSales = (sales: number) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(sales)

export function TopSoldNodes() {
  const [products, setProducts] = useState<TopSoldProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopSoldProducts(8)
      .then((data) => setProducts(data.filter((item) => item.product || item.image)))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const maxSales = useMemo(() => {
    return Math.max(...products.map((product) => product.sales), 1)
  }, [products])

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-secondary" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) return null

  return (
    <section className="bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Preferidos
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Productos más vendidos
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const size = 112 + Math.round((product.sales / maxSales) * 72)
            const href = product.product?._id ? `/productos/${product.product._id}` : "/productos"

            return (
              <Link
                key={product.product_id}
                href={href}
                className="group flex min-h-72 flex-col items-center justify-between rounded-xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 text-sm font-semibold text-primary-foreground">
                    #{product.position}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <ShoppingBag className="h-4 w-4" />
                    {formatSales(product.sales)}
                  </span>
                </div>

                <div
                  className="relative my-4 overflow-hidden rounded-full border border-border bg-secondary shadow-sm transition-transform group-hover:scale-105"
                  style={{ width: size, height: size }}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Medal className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category || "Producto"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
