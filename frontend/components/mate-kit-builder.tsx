"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, PackagePlus, ShoppingCart, Sparkles } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import {
  fetchKitBuilder,
  getProductDiscount,
  getProductFinalPrice,
  isProductDiscounted,
  type ApiProduct,
  type KitBuilderResponse,
  type KitItem,
} from "@/lib/api"

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)

function KitCard({ item, onAdd }: { item: KitItem; onAdd: (item: KitItem) => void }) {
  const isOwned = item.status === "owned"
  const productForPrice = item.product as Partial<ApiProduct> | null
  const hasDiscount = isProductDiscounted(productForPrice)

  return (
    <div
      className={`flex h-full flex-col rounded-xl border bg-card p-4 ${
        isOwned ? "border-border" : "border-dashed border-primary/60"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-serif text-lg font-semibold text-foreground">{item.category}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isOwned
              ? "bg-green-100 text-green-700"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isOwned ? "Ya lo tenés" : "Te falta"}
        </span>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        {item.product?.image ? (
          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PackagePlus className="h-10 w-10" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
            -{getProductDiscount(productForPrice)}%
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="line-clamp-2 font-medium text-foreground">
          {item.product?.name || "Producto por sumar"}
        </h3>
        {item.product && (
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-lg font-bold text-foreground">
              {formatPrice(getProductFinalPrice(productForPrice))}
            </p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(item.product.price)}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          {isOwned ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              Parte de tu kit
            </div>
          ) : item.product ? (
            <button
              onClick={() => onAdd(item)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              Agregar al carrito
            </button>
          ) : (
            <Link
              href="/productos"
              className="block rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-secondary"
            >
              Buscar opciones
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function MateKitBuilder({ standalone = false }: { standalone?: boolean }) {
  const { token } = useAuth()
  const { addToCart, setIsCartOpen } = useCart()
  const [kit, setKit] = useState<KitBuilderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    fetchKitBuilder(token)
      .then((data) => {
        setKit(data)
        setErrorMessage(null)
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage("No pudimos cargar tu kit. Revisá que el backend esté disponible.")
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const addItem = (item: KitItem) => {
    if (!item.product) return
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: getProductFinalPrice(item.product as Partial<ApiProduct>),
      image: item.product.image || "/placeholder.jpg",
    })
  }

  const addMissingItems = () => {
    kit?.missing.forEach(addItem)
    setIsCartOpen(true)
  }

  if (isLoading) {
    return (
      <section className={standalone ? "py-10" : "py-12"}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-80 animate-pulse rounded-xl bg-secondary" />
        </div>
      </section>
    )
  }

  if (!token) {
    return (
      <section className={standalone ? "py-10" : "py-12"}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">Armá tu kit de mate</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Iniciá sesión para ver qué piezas ya tenés y cuáles te faltan.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (errorMessage || !kit) {
    return (
      <section className={standalone ? "py-10" : "py-12"}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            {errorMessage || "No encontramos datos para armar tu kit."}
          </div>
        </div>
      </section>
    )
  }

  const readyItems = kit.items.filter((item) => item.product).length
  const readyProgress = Math.round((readyItems / kit.total) * 100)
  const missingCount = kit.total - kit.completed

  return (
    <section className={standalone ? "py-10" : "border-t border-border bg-secondary/30 py-12"}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Tu kit de mate
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
              Completá tu set ideal
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Marcamos lo que ya tenés y te sugerimos piezas para cerrar el ritual completo.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 lg:min-w-80">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{readyItems} de {kit.total} piezas listas</span>
              <span className="text-muted-foreground">{readyProgress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${readyProgress}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {kit.completed} ya {kit.completed === 1 ? "es tuya" : "son tuyas"}
              {missingCount > 0 ? ` y ${missingCount} ${missingCount === 1 ? "queda recomendada" : "quedan recomendadas"}.` : "."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {kit.items.map((item) => (
            <KitCard key={item.category} item={item} onAdd={addItem} />
          ))}
        </div>

        {kit.coupon && (
          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-primary">
                  <Sparkles className="h-4 w-4" />
                  Kit completo
                </p>
                <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">
                  {kit.coupon.message}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Usá el código <span className="font-semibold text-foreground">{kit.coupon.code}</span> para ahorrar un {kit.coupon.discount}% en tu próxima compra.
                </p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-background px-5 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Cupón</p>
                <p className="mt-1 text-xl font-bold text-primary">{kit.coupon.code}</p>
              </div>
            </div>
          </div>
        )}

        {kit.missing.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Completá tu kit y ahorrá un {kit.discount}%
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Sumá todos los faltantes al carrito en un solo paso.
                </p>
              </div>
              <button
                onClick={addMissingItems}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar faltantes
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
