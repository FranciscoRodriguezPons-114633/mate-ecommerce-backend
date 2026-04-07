"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Package, ChevronRight, Clock, Truck, CheckCircle } from "lucide-react"

// Datos de ejemplo de pedidos del usuario
const userOrders = [
  {
    id: "ORD-001",
    date: "15 de Enero, 2024",
    status: "delivered",
    total: 45000,
    items: [
      { name: "Mate Imperial con Virola de Alpaca", quantity: 1, price: 18500, image: "/product-mate-1.jpg" },
      { name: "Bombilla Cincelada de Alpaca", quantity: 2, price: 8900, image: "/product-bombilla-1.jpg" },
      { name: "Termo Matero de Acero 1L", quantity: 1, price: 8700, image: "/product-termo-1.jpg" },
    ],
  },
  {
    id: "ORD-002",
    date: "10 de Enero, 2024",
    status: "shipped",
    total: 24000,
    items: [
      { name: "Mate de Algarrobo Tallado", quantity: 1, price: 24000, image: "/product-mate-2.jpg" },
    ],
  },
  {
    id: "ORD-003",
    date: "5 de Enero, 2024",
    status: "pending",
    total: 4500,
    items: [
      { name: "Yerba Mate Premium Orgánica 1kg", quantity: 1, price: 4500, image: "/product-yerba-1.jpg" },
    ],
  },
]

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
  shipped: {
    label: "En camino",
    icon: Truck,
    color: "text-blue-600 bg-blue-100",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
  },
}

export default function MisPedidosPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground mb-8">
            Seguí el estado de tus compras y revisá tu historial.
          </p>

          {userOrders.length > 0 ? (
            <div className="space-y-6">
              {userOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Header del pedido */}
                    <div className="p-4 sm:p-6 border-b border-border bg-secondary/30">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm font-medium text-foreground">
                              {order.id}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items del pedido */}
                    <div className="p-4 sm:p-6">
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground line-clamp-1 sm:line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Cantidad: {item.quantity}
                              </p>
                              <p className="text-sm font-medium text-accent mt-1">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Acciones */}
                      <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
                          Ver Detalles
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {order.status === "delivered" && (
                          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                            Comprar de nuevo
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <button className="flex-1 px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                            Rastrear envío
                          </button>
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
