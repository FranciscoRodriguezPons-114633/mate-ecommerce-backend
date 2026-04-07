"use client"

import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 z-40 bg-foreground/50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Panel del carrito */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header del carrito */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-serif text-xl font-semibold text-foreground">Tu Carrito</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ver Productos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-lg border border-border p-3 bg-card">
                    {/* Imagen del producto */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info del producto */}
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-accent font-semibold">{formatPrice(item.price)}</p>

                      {/* Controles de cantidad */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botón vaciar carrito */}
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-red-600 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>

          {/* Footer con total y checkout */}
          {items.length > 0 && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Envío e impuestos calculados en el checkout
              </p>

              {/* Botón de checkout */}
              {user ? (
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-3 text-center font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Finalizar Compra
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full py-3 text-center font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Ingresar para Comprar
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    Necesitás una cuenta para finalizar tu compra
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
