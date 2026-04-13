"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { fetchProducts, ApiProduct } from "@/lib/api"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Search,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

type Tab = "dashboard" | "products" | "orders"

interface Order {
  _id: string
  user: { name: string; email: string }
  items: { name: string; quantity: number; subtotal: number; image?: string }[]
  total: number
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
  createdAt: string
}

const statusConfig = {
  pending:   { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
  paid:      { label: "Pagado",     color: "bg-blue-100 text-blue-700" },
  shipped:   { label: "En camino",  color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Entregado",  color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado",  color: "bg-red-100 text-red-700" },
}

export default function AdminPage() {
  const router = useRouter()
  const { user, token, isAdmin, logout, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, isLoading, router])

  useEffect(() => {
    if (!token) return
    Promise.all([
      fetchProducts(1, 100),
      fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([productsData, ordersData]) => {
        setProducts(productsData.products)
        setOrders(ordersData)
      })
      .catch(console.error)
      .finally(() => setIsLoadingData(false))
  }, [token])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  const totalVentas = orders.reduce((sum, o) => sum + o.total, 0)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOrders(orders.map((o) =>
          o._id === orderId ? { ...o, status: status as Order["status"] } : o
        ))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveProduct = async (data: Partial<ApiProduct>) => {
    try {
      const isEditing = !!editingProduct
      const url = isEditing
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const saved = await res.json()

      if (res.ok) {
        if (isEditing) {
          setProducts(products.map((p) => (p._id === saved._id ? saved : p)))
        } else {
          setProducts([...products, saved])
        }
        setShowProductModal(false)
        setEditingProduct(null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="font-serif text-xl font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-serif text-xl font-bold text-foreground">Matero</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Panel de Administración</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { key: "products",  label: "Productos",  icon: Package },
              { key: "orders",    label: "Pedidos",    icon: ShoppingCart },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Tienda
              </Link>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <span className="font-serif text-xl font-bold text-foreground">Matero Admin</span>
          <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <div className="flex border-t border-border">
          {[
            { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { key: "products",  label: "Productos",  icon: Package },
            { key: "orders",    label: "Pedidos",    icon: ShoppingCart },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                activeTab === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="lg:ml-64 p-4 lg:p-8">

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Dashboard</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: "Ventas Totales", value: formatPrice(totalVentas), icon: DollarSign },
                { label: "Pedidos", value: orders.length, icon: ShoppingCart },
                { label: "Productos", value: products.length, icon: Package },
                { label: "Pendientes", value: orders.filter(o => o.status === "pending").length, icon: Clock },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pedidos recientes */}
            <div className="bg-card border border-border rounded-xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Pedidos Recientes</h2>
                <button onClick={() => setActiveTab("orders")} className="text-sm text-primary hover:underline">
                  Ver todos
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingData ? (
                      <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Cargando...</td></tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b border-border last:border-0">
                          <td className="p-4">
                            <p className="font-medium text-foreground">{order.user?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email || "—"}</p>
                          </td>
                          <td className="p-4 font-medium text-foreground">{formatPrice(order.total)}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusConfig[order.status].color}`}>
                              {statusConfig[order.status].label}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        {activeTab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="font-serif text-2xl font-bold text-foreground">Productos</h1>
              <button
                onClick={() => { setEditingProduct(null); setShowProductModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoría</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Precio</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingData ? (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Cargando...</td></tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product._id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                              </div>
                              <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                          <td className="p-4 font-medium text-foreground">{formatPrice(product.price)}</td>
                          <td className="p-4">
                            <span className={`text-sm font-medium ${
                              product.quantity > 10 ? "text-green-600"
                              : product.quantity > 0 ? "text-yellow-600"
                              : "text-red-600"
                            }`}>
                              {product.quantity} unidades
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingProduct(product); setShowProductModal(true) }}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === "orders" && (
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Pedidos</h1>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingData ? (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Cargando...</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No hay pedidos todavía</td></tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                          <td className="p-4 font-mono text-sm text-foreground">
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{order.user?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email || "—"}</p>
                          </td>
                          <td className="p-4 font-medium text-foreground">{formatPrice(order.total)}</td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border-0 focus:ring-2 focus:ring-ring cursor-pointer ${statusConfig[order.status].color}`}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="paid">Pagado</option>
                              <option value="shipped">En camino</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Producto */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null) }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  )
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: ApiProduct | null
  onClose: () => void
  onSave: (data: Partial<ApiProduct>) => void
}) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    category: product?.category || "Calabazas",
    image: product?.image || "/product-mate-1.jpg",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Precio (ARS)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Calabazas">Calabazas</option>
              <option value="Bombillas">Bombillas</option>
              <option value="Yerba Mate">Yerba Mate</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Sets">Sets</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL de imagen</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="/product-mate-1.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {product ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}