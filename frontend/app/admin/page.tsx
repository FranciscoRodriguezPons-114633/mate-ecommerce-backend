"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { products as initialProducts, Product } from "@/lib/products-data"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Search,
  Eye,
} from "lucide-react"

// Tabs del admin
type Tab = "dashboard" | "products" | "orders"

// Datos de ejemplo para pedidos
const sampleOrders = [
  { id: "1", customer: "Juan Pérez", email: "juan@email.com", total: 45000, status: "pending", date: "2024-01-15" },
  { id: "2", customer: "María García", email: "maria@email.com", total: 18500, status: "completed", date: "2024-01-14" },
  { id: "3", customer: "Carlos López", email: "carlos@email.com", total: 28000, status: "shipped", date: "2024-01-13" },
  { id: "4", customer: "Ana Martínez", email: "ana@email.com", total: 8900, status: "completed", date: "2024-01-12" },
]

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, logout, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState(sampleOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Verificar si es admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, isLoading, router])

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Estadísticas del dashboard
  const stats = [
    {
      label: "Ventas Totales",
      value: formatPrice(orders.reduce((sum, o) => sum + o.total, 0)),
      icon: DollarSign,
      change: "+12%",
    },
    { label: "Pedidos", value: orders.length, icon: ShoppingCart, change: "+5%" },
    { label: "Productos", value: products.length, icon: Package, change: "+2" },
    { label: "Clientes", value: 156, icon: Users, change: "+8%" },
  ]

  // Filtrar productos
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Eliminar producto
  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  // Actualizar estado de pedido
  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="font-serif text-xl font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-serif text-xl font-bold text-foreground">Matero</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Panel de Administración</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === "products"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <Package className="h-5 w-5" />
              Productos
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </button>
          </nav>

          {/* User & Actions */}
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
          <Link href="/" className="font-serif text-xl font-bold text-foreground">
            Matero Admin
          </Link>
          <button
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        {/* Mobile Tabs */}
        <div className="flex border-t border-border">
          {[
            { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { key: "products", label: "Productos", icon: Package },
            { key: "orders", label: "Pedidos", icon: ShoppingCart },
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

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Pedidos Recientes</h2>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-sm text-primary hover:underline"
                >
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
                    {orders.slice(0, 4).map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </td>
                        <td className="p-4 font-medium text-foreground">{formatPrice(order.total)}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status === "completed"
                              ? "Completado"
                              : order.status === "shipped"
                              ? "Enviado"
                              : "Pendiente"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="font-serif text-2xl font-bold text-foreground">Productos</h1>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </button>
            </div>

            {/* Search */}
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

            {/* Products Table */}
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
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-secondary">
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                              <div className="flex gap-2 mt-1">
                                {product.isNew && (
                                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Nuevo</span>
                                )}
                                {product.isOnSale && (
                                  <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">Oferta</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{formatPrice(product.price)}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-sm font-medium ${
                              product.stock > 10
                                ? "text-green-600"
                                : product.stock > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.stock} unidades
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product)
                                setShowProductModal(true)
                              }}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              aria-label="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
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
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                        <td className="p-4 font-mono text-sm text-foreground">#{order.id}</td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </td>
                        <td className="p-4 font-medium text-foreground">{formatPrice(order.total)}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border-0 focus:ring-2 focus:ring-ring ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="shipped">Enviado</option>
                            <option value="completed">Completado</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                        <td className="p-4">
                          <button
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            aria-label="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false)
            setEditingProduct(null)
          }}
          onSave={(product) => {
            if (editingProduct) {
              setProducts(products.map((p) => (p.id === product.id ? product : p)))
            } else {
              setProducts([...products, { ...product, id: String(products.length + 1) }])
            }
            setShowProductModal(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

// Modal para crear/editar producto
function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null
  onClose: () => void
  onSave: (product: Product) => void
}) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      description: "",
      price: 0,
      category: "Calabazas",
      stock: 0,
      image: "/product-mate-1.jpg",
      rating: 5,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as Product)
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
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
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

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm text-foreground">Nuevo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOnSale}
                onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm text-foreground">En oferta</span>
            </label>
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
