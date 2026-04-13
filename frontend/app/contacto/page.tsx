"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

const contactInfo = [
  {
    icon: MapPin,
    title: "Dirección",
    details: ["Av. Corrientes 1234", "Buenos Aires, Argentina"],
  },
  {
    icon: Phone,
    title: "Teléfono",
    details: ["+54 11 4567-8900", "+54 11 4567-8901"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["hola@matero.com.ar", "ventas@matero.com.ar"],
  },
  {
    icon: Clock,
    title: "Horarios",
    details: ["Lunes a Viernes: 9:00 - 18:00", "Sábados: 10:00 - 14:00"],
  },
]

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ nombre: "", email: "", asunto: "", mensaje: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
              Contactanos
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Estamos para ayudarte. Envianos tu consulta y te responderemos a la brevedad.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <div className="mt-2 space-y-1">
                    {item.details.map((detail, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-12 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Form */}
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Envianos un mensaje
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Completá el formulario y nos pondremos en contacto con vos.
                </p>

                {submitted ? (
                  <div className="mt-8 rounded-lg bg-green-50 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Send className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-green-800">
                      Mensaje enviado
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      Gracias por contactarnos. Te responderemos a la brevedad.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-sm font-medium text-green-700 underline hover:text-green-800"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="nombre"
                          className="block text-sm font-medium text-foreground"
                        >
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          required
                          value={formData.nombre}
                          onChange={handleChange}
                          className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="asunto"
                        className="block text-sm font-medium text-foreground"
                      >
                        Asunto
                      </label>
                      <select
                        id="asunto"
                        name="asunto"
                        required
                        value={formData.asunto}
                        onChange={handleChange}
                        className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Seleccioná un asunto</option>
                        <option value="consulta">Consulta general</option>
                        <option value="productos">Información de productos</option>
                        <option value="pedido">Estado de mi pedido</option>
                        <option value="devolucion">Devoluciones y cambios</option>
                        <option value="mayorista">Ventas mayoristas</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="mensaje"
                        className="block text-sm font-medium text-foreground"
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        required
                        rows={5}
                        value={formData.mensaje}
                        onChange={handleChange}
                        className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Escribí tu mensaje..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Map placeholder & Additional Info */}
              <div className="space-y-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 font-serif text-lg font-medium text-foreground">
                        Nuestra ubicación
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Av. Corrientes 1234, Buenos Aires
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    Preguntas frecuentes
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="font-medium text-foreground">
                        ¿Cuánto tarda en llegar mi pedido?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Los envíos dentro de CABA demoran 24-48hs. Al interior, de 3 a 7 días hábiles.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        ¿Hacen envíos a todo el país?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sí, realizamos envíos a todas las provincias de Argentina.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        ¿Puedo cambiar o devolver un producto?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tenés 30 días para realizar cambios o devoluciones sin cargo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}