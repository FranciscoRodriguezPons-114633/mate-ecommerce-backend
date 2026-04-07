"use client"

import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { getFeaturedProducts } from "@/lib/products-data"
import { ArrowRight } from "lucide-react"

export function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts()

  return (
    <section className="bg-secondary/30 py-16 sm:py-24" id="productos">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-accent">
              Destacados
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Los favoritos de la casa
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Productos seleccionados por nuestros clientes más exigentes
            </p>
          </div>
          <Link 
            href="/productos" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-foreground/20 text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            Ver todos los productos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              category={product.category}
              rating={product.rating}
              isNew={product.isNew}
              isOnSale={product.isOnSale}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
