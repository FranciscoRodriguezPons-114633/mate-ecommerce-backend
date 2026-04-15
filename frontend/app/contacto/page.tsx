import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Phone, Mail, Clock, Truck, CreditCard, Shield, HelpCircle } from "lucide-react"

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

const faqs = [
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer: "Los envíos dentro de CABA demoran 24-48hs hábiles. Para el resto de Argentina, el tiempo de entrega es de 3 a 7 días hábiles dependiendo de la localidad.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer: "Sí, realizamos envíos a todas las provincias de Argentina a través de las principales empresas de correo. También contamos con envío gratis en compras superiores a $50.000.",
  },
  {
    question: "¿Puedo cambiar o devolver un producto?",
    answer: "Tenés 30 días desde la recepción del producto para realizar cambios o devoluciones sin cargo. El producto debe estar sin uso y en su empaque original.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos tarjetas de crédito y débito de todas las marcas, Mercado Pago, transferencia bancaria y efectivo a través de Rapipago y Pago Fácil.",
  },
  {
    question: "¿Los productos tienen garantía?",
    answer: "Todos nuestros productos cuentan con garantía de 6 meses por defectos de fabricación. Las calabazas y bombillas artesanales tienen garantía de por vida en el acabado.",
  },
  {
    question: "¿Realizan ventas mayoristas?",
    answer: "Sí, contamos con precios especiales para compras mayoristas. Escribinos a ventas@matero.com.ar con los detalles de tu consulta y te enviaremos nuestra lista de precios.",
  },
]

const features = [
  {
    icon: Truck,
    title: "Envío Gratis",
    description: "En compras mayores a $50.000 a todo el país",
  },
  {
    icon: CreditCard,
    title: "Pago Seguro",
    description: "Todas las tarjetas y Mercado Pago",
  },
  {
    icon: Shield,
    title: "Garantía",
    description: "6 meses en todos los productos",
  },
  {
    icon: HelpCircle,
    title: "Soporte",
    description: "Atención personalizada por WhatsApp",
  },
]

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
              Contacto e Información
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Toda la información que necesitás sobre nuestros servicios, envíos y atención al cliente.
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

        {/* Features Section */}
        <section className="bg-secondary/30 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                Beneficios de comprar en Matero
              </h2>
              <p className="mt-2 text-muted-foreground">
                Tu experiencia de compra es nuestra prioridad
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center p-6"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map & Location */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 font-serif text-lg font-medium text-foreground">
                      Visitanos en nuestra tienda
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Av. Corrientes 1234, Buenos Aires
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Estamos a pocas cuadras del Obelisco, en pleno centro porteño.
                      Contamos con estacionamiento cercano y fácil acceso en transporte público.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Información adicional
                </h3>
                <div className="mt-6 space-y-4">
                  <div className="border-b border-border pb-4">
                    <p className="font-medium text-foreground">Atención al cliente</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Nuestro equipo está disponible de lunes a viernes de 9:00 a 18:00 hs.
                      También podés contactarnos por WhatsApp al +54 11 4567-8900.
                    </p>
                  </div>
                  <div className="border-b border-border pb-4">
                    <p className="font-medium text-foreground">Seguinos en redes</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Encontranos en Instagram, Facebook y TikTok como @matero.ar
                      Compartimos tips, recetas y las últimas novedades.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Showroom</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Visitá nuestra tienda física y conocé toda nuestra colección.
                      Te invitamos a tomar unos mates mientras elegís tus productos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="bg-secondary/30 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                Preguntas Frecuentes
              </h2>
              <p className="mt-2 text-muted-foreground">
                Respuestas a las consultas más comunes de nuestros clientes
              </p>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <h4 className="font-medium text-foreground">
                    {faq.question}
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-primary p-8 sm:p-12 text-center">
              <h2 className="font-serif text-2xl font-bold text-primary-foreground sm:text-3xl">
                ¿Tenés alguna consulta específica?
              </h2>
              <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
                Escribinos por WhatsApp y te respondemos al instante. 
                Estamos para ayudarte a encontrar el mate perfecto.
              </p>
              <a
                href="https://wa.me/5491145678900"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-6 py-3 font-medium text-primary hover:bg-primary-foreground/90 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
