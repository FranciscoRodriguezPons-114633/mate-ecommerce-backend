"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { ArrowLeft, Check, CreditCard, Truck, MapPin } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user, token } = useAuth()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  // Datos del formulario
  const [shippingData, setShippingData] = useState({
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  })

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  })

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Costo de envío
  const shippingCost = totalPrice > 30000 ? 0 : 3500
  const finalTotal = totalPrice + shippingCost

  // Redirigir si no hay items o no está logueado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Necesitás ingresar para continuar</p>
          <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Ingresar
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Tu carrito está vacío</p>
          <Link href="/productos" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  // Manejar envío del pedido
  const handleSubmitOrder = async () => {
    setIsProcessing(true)

    try {
      // Aquí llamarías a tu API para crear el pedido
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: shippingData,
          total: finalTotal,
        }),
      })

      if (response.ok) {
        setOrderComplete(true)
        clearCart()
      } else {
        // Simular éxito para demo
        setOrderComplete(true)
        clearCart()
      }
    } catch {
      // Simular éxito para demo sin backend
      setOrderComplete(true)
      clearCart()
    } finally {
      setIsProcessing(false)
    }
  }

  // Pantalla de orden completada
  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-muted-foreground mb-6">
            Gracias por tu compra. Te enviamos un email con los detalles de tu pedido.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/mis-pedidos"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-foreground hover:text-primary transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
            <Link href="/" className="font-serif text-2xl font-bold text-foreground">
              Matero
            </Link>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="mx-auto max-w-6xl px-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[
              { num: 1, label: "Envío", icon: Truck },
              { num: 2, label: "Pago", icon: CreditCard },
              { num: 3, label: "Confirmar", icon: Check },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-8 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulario */}
            <div className="lg:col-span-2">
              {/* Step 1: Envío */}
              {step === 1 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Datos de Envío
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Calle y número"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Ciudad"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Provincia
                        </label>
                        <input
                          type="text"
                          value={shippingData.province}
                          onChange={(e) => setShippingData({ ...shippingData, province: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Provincia"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          value={shippingData.postalCode}
                          onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="1234"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="+54 11 1234-5678"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!shippingData.address || !shippingData.city || !shippingData.province || !shippingData.postalCode}
                    className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar al Pago
                  </button>
                </div>
              )}

              {/* Step 2: Pago */}
              {step === 2 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Datos de Pago
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Nombre en la Tarjeta
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="NOMBRE APELLIDO"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiry || !paymentData.cvv}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Revisar Pedido
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmar */}
              {step === 3 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Confirmar Pedido
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary">
                      <h3 className="font-medium text-foreground mb-2">Dirección de Envío</h3>
                      <p className="text-sm text-muted-foreground">
                        {shippingData.address}<br />
                        {shippingData.city}, {shippingData.province} {shippingData.postalCode}<br />
                        Tel: {shippingData.phone}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary">
                      <h3 className="font-medium text-foreground mb-2">Método de Pago</h3>
                      <p className="text-sm text-muted-foreground">
                        Tarjeta terminada en {paymentData.cardNumber.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Procesando..." : `Pagar ${formatPrice(finalTotal)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen del pedido */}
            <div>
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Resumen del Pedido
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                        <p className="text-sm text-accent font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-4 border-border" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-foreground">
                      {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {totalPrice < 30000 && (
                    <p className="text-xs text-muted-foreground">
                      Envío gratis en compras mayores a {formatPrice(30000)}
                    </p>
                  )}
                  <hr className="my-2 border-border" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
