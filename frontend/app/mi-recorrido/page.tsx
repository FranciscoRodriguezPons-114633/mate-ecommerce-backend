"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/context/auth-context"
import {
  fetchCustomerJourney,
  type CustomerJourneyResponse,
  type JourneyTimelineStep,
} from "@/lib/api"
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Compass,
  Layers3,
  Map,
  Package,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react"

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

function TimelineStep({ step, index }: { step: JourneyTimelineStep; index: number }) {
  return (
    <div className="relative grid gap-4 pl-10 sm:grid-cols-[180px_1fr] sm:gap-6 sm:pl-0">
      <div className="absolute left-3 top-0 h-full w-px bg-border sm:left-[190px]" />
      <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-background text-primary sm:left-[177px]">
        <span className="text-xs font-bold">{index + 1}</span>
      </div>

      <div className="sm:pr-8 sm:text-right">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground sm:justify-end">
          <CalendarDays className="h-4 w-4" />
          {formatDate(step.date)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{formatPrice(step.total)}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {step.newCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {step.newCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <Sparkles className="h-3 w-3" />
                Nueva categoría: {category}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {step.products.map((product) => (
            <div key={`${step.id}-${product.id}`} className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                ) : (
                  <Package className="m-4 h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.category} · x{product.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MiRecorridoPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()
  const [journey, setJourney] = useState<CustomerJourneyResponse | null>(null)
  const [isLoadingJourney, setIsLoadingJourney] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, router, user])

  useEffect(() => {
    if (!token) return

    fetchCustomerJourney(token)
      .then((data) => {
        setJourney(data)
        setErrorMessage(null)
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage("No pudimos cargar tu recorrido. Probá reiniciar el backend.")
      })
      .finally(() => setIsLoadingJourney(false))
  }, [token])

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
                  <Map className="h-4 w-4" />
                  El recorrido del matero
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
                  {journey ? journey.user.name : user.name}
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                  Tu evolución de compras, categorías exploradas y el próximo paso sugerido para seguir armando tu ritual.
                </p>
              </div>

              {journey && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">Nivel actual</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-serif text-2xl font-bold text-foreground">{journey.level.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {journey.level.current} de 5 categorías exploradas
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${journey.level.progress}%` }}
                    />
                  </div>
                  {journey.level.next && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Próximo nivel: {journey.level.next}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4">
            {isLoadingJourney ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">No pudimos cargar tu recorrido</h2>
                <p className="mt-3 text-muted-foreground">{errorMessage}</p>
              </div>
            ) : journey ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <p className="mt-4 text-3xl font-bold text-foreground">{journey.stats.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">pedidos realizados</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <Layers3 className="h-6 w-6 text-primary" />
                    <p className="mt-4 text-3xl font-bold text-foreground">{journey.stats.categoriesCount}</p>
                    <p className="text-sm text-muted-foreground">categorías exploradas</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <Award className="h-6 w-6 text-primary" />
                    <p className="mt-4 line-clamp-1 text-lg font-bold text-foreground">
                      {journey.stats.topProduct?.name || "Sin producto favorito"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {journey.stats.topProduct
                        ? `${journey.stats.topProduct.quantity} unidades`
                        : "Comprá para descubrirlo"}
                    </p>
                  </div>
                </div>

                {journey.prediction && (
                  <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                          <Compass className="h-4 w-4" />
                          Próximo paso
                        </p>
                        <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
                          Probá {journey.prediction.category}
                        </h2>
                        <p className="mt-3 max-w-2xl text-muted-foreground">
                          El {journey.prediction.confidence || 70}% de materos con un recorrido parecido también exploró esta categoría.
                        </p>
                      </div>
                      <Link
                        href={journey.prediction.href}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Ver {journey.prediction.category}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}

                <section className="mt-12">
                  <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      Timeline
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
                      Tu camino matero
                    </h2>
                  </div>

                  {journey.timeline.length > 0 ? (
                    <div className="space-y-8">
                      {journey.timeline.map((step, index) => (
                        <TimelineStep key={step.id} step={step} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">Tu recorrido empieza con el primer pedido</h2>
                      <p className="mt-3 text-muted-foreground">
                        Explorá el catálogo y armá tu primer ritual matero.
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
                </section>
              </>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
