"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <section className="bg-primary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Unite a la comunidad matera
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Recibí ofertas exclusivas, tips para preparar el mate perfecto y novedades 
            antes que nadie. Además, 10% de descuento en tu primera compra.
          </p>

          {isSubscribed ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-primary-foreground/10 p-4">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
              <p className="text-primary-foreground">
                ¡Gracias por suscribirte! Revisá tu email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/30"
              />
              <Button
                type="submit"
                size="lg"
                className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Suscribirme
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="mt-4 text-sm text-primary-foreground/60">
            Al suscribirte, aceptás recibir comunicaciones de Matero. 
            Podés darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  )
}
