import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, Truck, Shield, Award, Leaf } from "lucide-react"
import { products, categories } from "@/lib/products-data"

const featuredProducts = products.filter((p) => p.isNew || p.isOnSale).slice(0, 4)

const testimonials = [
  {
    name: "Martín García",
    location: "Buenos Aires",
    text: "La calidad de los mates es increíble. Se nota el trabajo artesanal en cada detalle. Ya hice tres pedidos.",
    image: "/testimonial-1.jpg",
  },
  {
    name: "Carolina Mendez",
    location: "Córdoba",
    text: "Excelente atención y envío super rápido. El mate de algarrobo que compré es una obra de arte.",
    image: "/testimonial-2.jpg",
  },
  {
    name: "Roberto Fernández",
    location: "Mendoza",
    text: "Los mejores precios que encontré y la calidad es premium. Muy recomendable para cualquier matero.",
    image: "/testimonial-3.jpg",
  },
]

const features = [
  {
    icon: Truck,
    title: "Envío Gratis",
    description: "En compras mayores a $50.000",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    description: "Protección en cada transacción",
  },
  {
    icon: Award,
    title: "Calidad Premium",
    description: "Productos artesanales únicos",
  },
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Materiales sustentables",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Diseño editorial elegante */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Contenido */}
              <div className="order-2 lg:order-1">
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Tradición Argentina
                </p>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  <span className="text-balance">El arte de compartir un buen mate</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  Descubrí nuestra colección de mates artesanales, bombillas de alpaca y accesorios premium. 
                  Cada pieza es única, hecha a mano por artesanos argentinos.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/productos"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Ver Productos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/nosotros"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-foreground transition-colors hover:text-primary"
                  >
                    Nuestra Historia
                  </Link>
                </div>
              </div>

              {/* Imagen Hero */}
              <div className="order-1 lg:order-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="/hero-mate.jpg"
                    alt="Mate artesanal argentino"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categorías - Grid elegante */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Explorá
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Nuestras Categorías
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/productos?categoria=${category.id}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-xl font-semibold text-white">
                      {category.name}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/80 transition-colors group-hover:text-white">
                      Ver productos
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Productos Destacados */}
        <section className="bg-secondary/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Lo más buscado
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Productos Destacados
                </h2>
              </div>
              <Link
                href="/productos"
                className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/productos"
                  className="block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.isOnSale && (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                        Oferta
                      </span>
                    )}
                    {product.isNew && !product.isOnSale && (
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {product.category}
                    </p>
                    <h3 className="mt-1 font-medium text-foreground line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        ${product.price.toLocaleString("es-AR")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Sección Historia / Propuesta de valor */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src="/product-set-1.jpg"
                  alt="Set matero completo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Nuestra Pasión
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Artesanía que une generaciones
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Cada mate que ofrecemos cuenta una historia. Trabajamos con artesanos de todo el país 
                  que mantienen vivas las técnicas tradicionales, creando piezas únicas que pasan de 
                  mano en mano, de generación en generación.
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground">Más de 50 artesanos argentinos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground">Materiales 100% naturales y sustentables</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground">Garantía de por vida en acabados</span>
                  </li>
                </ul>
                <Link
                  href="/nosotros"
                  className="mt-10 inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
                >
                  Conocé nuestra historia
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="bg-secondary/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Testimonios
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card p-8"
                >
                  <p className="text-foreground leading-relaxed">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-primary px-8 py-16 text-center sm:px-16 sm:py-20">
              <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
                <span className="text-balance">Empezá tu experiencia matera hoy</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Unite a miles de argentinos que ya disfrutan de nuestros productos artesanales. 
                Envío gratis en tu primera compra.
              </p>
              <Link
                href="/productos"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-8 py-4 font-medium text-primary transition-colors hover:bg-primary-foreground/90"
              >
                Explorar Productos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
