"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/context/auth-context"
import {
  fetchRecommendations,
  type ProductRecommendation,
  type RecommendationResponse,
} from "@/lib/api"
import {
  ArrowRight,
  CircleDot,
  GitBranch,
  Package,
  Route,
  ShoppingBag,
  Sparkles,
} from "lucide-react"

const nodeStyles = {
  User: "border-primary bg-primary/10 text-primary",
  Product: "border-accent bg-accent/10 text-accent",
  Category: "border-emerald-500 bg-emerald-500/10 text-emerald-700",
  Order: "border-indigo-500 bg-indigo-500/10 text-indigo-700",
}

const relationshipLabels = {
  PURCHASED: "compró",
  VIEWED: "vio",
  IN_CATEGORY: "pertenece a",
  CONTAINS: "contiene",
  SIMILAR_TO: "similar",
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)

function RecommendationCard({ item }: { item: ProductRecommendation }) {
  return (
    <Link href={`/productos/${item.product_id}`} className="group block">
      <div className="h-full overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-square bg-secondary">
          <Image
            src={item.image || "/placeholder.jpg"}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            #{item.position}
          </span>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {item.category}
          </p>
          <h3 className="mt-1 line-clamp-2 font-medium text-foreground group-hover:text-primary">
            {item.name}
          </h3>
          <p className="mt-2 text-lg font-bold text-foreground">{formatPrice(item.price)}</p>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.reason}</p>
        </div>
      </div>
    </Link>
  )
}

export default function RecomendacionesPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()
  const [data, setData] = useState<RecommendationResponse | null>(null)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!token) return

    fetchRecommendations(token, 8)
      .then((response) => {
        setData(response)
        setErrorMessage(null)
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage("No pudimos cargar recomendaciones. Revisá que el backend esté reiniciado y disponible.")
      })
      .finally(() => setIsLoadingRecommendations(false))
  }, [token])

  const visibleRelationships = useMemo(() => {
    return data?.graph.relationships.slice(0, 14) || []
  }, [data])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Motor de recomendaciones
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
                  Recomendado para vos
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                  Sugerencias construidas desde tu historial de compras y productos relacionados por usuarios, pedidos y categorías.
                </p>
              </div>

              {data && (
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-foreground">{data.stats.purchasedProducts}</p>
                    <p className="text-xs text-muted-foreground">productos</p>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-foreground">{data.stats.categories}</p>
                    <p className="text-xs text-muted-foreground">categorías</p>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-foreground">{data.stats.recommendations}</p>
                    <p className="text-xs text-muted-foreground">sugerencias</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4">
            {isLoadingRecommendations ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  Recomendaciones no disponibles
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            ) : data && data.recommendations.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data.recommendations.map((item) => (
                  <RecommendationCard key={item.product_id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  Todavía no hay suficiente historial
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Cuando hagas tus primeras compras vamos a poder encontrar productos cercanos a tus gustos.
                </p>
                <Link
                  href="/productos"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Ver productos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {data && (
          <section className="border-y border-border bg-secondary/30 py-12">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    <GitBranch className="h-4 w-4" />
                    Vista del grafo
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
                    Usuarios, pedidos, productos y categorías
                  </h2>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                  {data.source === "neo4j" ? "Neo4j" : "Mongo fallback"}
                </span>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.graph.nodes.map((node) => (
                      <div
                        key={`${node.type}-${node.id}`}
                        className={`min-h-24 rounded-xl border p-4 ${nodeStyles[node.type]}`}
                      >
                        <div className="flex items-start gap-3">
                          {node.image ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
                              <Image src={node.image} alt={node.label} fill className="object-cover" />
                            </div>
                          ) : (
                            <CircleDot className="mt-1 h-5 w-5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                              {node.type}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-medium">{node.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Route className="h-5 w-5 text-primary" />
                    <h3 className="font-serif text-xl font-semibold text-foreground">
                      Relaciones
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {visibleRelationships.map((relationship, index) => (
                      <div key={`${relationship.from}-${relationship.to}-${index}`} className="rounded-lg border border-border bg-background p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs text-muted-foreground">
                            {relationship.from.slice(-8)}
                          </span>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {relationshipLabels[relationship.type]}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {relationship.to.slice(-8)}
                          </span>
                        </div>
                        {(relationship.quantity || relationship.score) && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <ShoppingBag className="h-3 w-3" />
                            {relationship.quantity
                              ? `cantidad ${relationship.quantity}`
                              : `score ${relationship.score}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
