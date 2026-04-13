"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, CreditCard } from "lucide-react"

interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image?: string
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
  createdAt: string
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
  paid: {
    label: "Pagado",
    icon: CreditCard,
    color: "text-blue-600 bg-blue-100",
  },
  shipped: {
    label: "En camino",
    icon: Truck,
    color: "text-indigo-600 bg-indigo-100",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-red-600 bg-red-100",
  },
}

export default function MisPedidosPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/orders/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(console.error)
      .finally(() => setIsLoadingOrders(false))
  }, [token])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground mb-8">
            Seguí el estado de tus compras y revisá tu historial.
          </p>

          {isLoadingOrders ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="p-6 border-b border-border bg-secondary/30">
                    <div className="h-4 bg-secondary rounded w-1/4" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 bg-secondary rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-3/4" />
                        <div className="h-4 bg-secondary rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <div key={order._id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-border bg-secondary/30">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm font-medium text-foreground">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Cantidad: {item.quantity}
                              </p>
                              <p className="text-sm font-medium text-accent mt-1">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                        {order.status === "delivered" && (
                          <Link
                            href="/productos"
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-center text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Comprar de nuevo
                          </Link>
                        )}
                        {order.status === "pending" && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Tu pedido está siendo procesado
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                No tenés pedidos todavía
              </h2>
              <p className="text-muted-foreground mb-6">
                Explorá nuestra tienda y encontrá los mejores productos materos.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver Productos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}