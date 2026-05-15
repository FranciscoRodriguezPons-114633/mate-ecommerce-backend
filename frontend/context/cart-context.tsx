"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import {
  clearSavedCart,
  fetchCart,
  saveCart,
  type ApiCartItem,
} from "@/lib/api"

// Tipo para un producto en el carrito
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, "quantity">) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const hasLoadedRemoteCart = useRef(false)

  const toCartItem = (item: ApiCartItem): CartItem => ({
    id: item.id || item.product || item.product_id || "",
    name: item.name,
    price: Number(item.price || 0),
    image: item.image || "/placeholder.jpg",
    quantity: Number(item.quantity || 0),
  })

  const toApiCartItem = (item: CartItem): ApiCartItem => ({
    id: item.id,
    product: item.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
  })

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Cargar carrito persistido cuando el usuario inicia sesion
  useEffect(() => {
    if (!token) {
      hasLoadedRemoteCart.current = false
      return
    }

    let isActive = true

    fetchCart(token)
      .then((cart) => {
        if (!isActive) return

        const remoteItems = cart.items.map(toCartItem).filter((item) => item.id)

        if (remoteItems.length > 0) {
          setItems(remoteItems)
        } else if (items.length > 0) {
          saveCart(token, items.map(toApiCartItem)).catch(console.error)
        }

        hasLoadedRemoteCart.current = true
      })
      .catch((error) => {
        console.error("No se pudo cargar el carrito persistido:", error)
        hasLoadedRemoteCart.current = true
      })

    return () => {
      isActive = false
    }
  }, [token])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Guardar carrito en Cassandra cuando hay sesion activa
  useEffect(() => {
    if (!token || !hasLoadedRemoteCart.current) return

    const timeoutId = window.setTimeout(() => {
      saveCart(token, items.map(toApiCartItem)).catch((error) => {
        console.error("No se pudo guardar el carrito persistido:", error)
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [items, token])

  // Agregar producto al carrito
  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (existingItem) {
        // Si ya existe, aumentar cantidad
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      // Si no existe, agregar con cantidad 1
      return [...currentItems, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true) // Abrir carrito al agregar
  }

  // Eliminar producto del carrito
  const removeFromCart = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
    )
  }

  // Vaciar carrito
  const clearCart = () => {
    setItems([])
    if (token) {
      clearSavedCart(token).catch((error) => {
        console.error("No se pudo limpiar el carrito persistido:", error)
      })
    }
  }

  // Calcular totales
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar el contexto del carrito
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider")
  }
  return context
}
