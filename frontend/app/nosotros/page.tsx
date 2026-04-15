import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, Award, Heart, Leaf, Users } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Pasión",
    description:
      "Cada mate que vendemos refleja nuestra pasión por la cultura argentina y el ritual del mate.",
  },
  {
    icon: Award,
    title: "Calidad",
    description:
      "Trabajamos solo con los mejores artesanos y materiales para garantizar productos de excelencia.",
  },
  {
    icon: Leaf,
    title: "Sustentabilidad",
    description:
      "Priorizamos prácticas sustentables y materiales naturales en todos nuestros productos.",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Apoyamos a comunidades artesanales locales y promovemos el comercio justo.",
  },
]

const timeline = [
  {
    year: "2009",
    title: "Nuestros inicios",
    description:
      "Comenzamos en un pequeño taller en San Telmo, con la visión de llevar el mate artesanal a todo el país.",
  },
  {
    year: "2012",
    title: "Primera tienda física",
    description:
      "Abrimos nuestra primera tienda en el corazón de Buenos Aires, en Av. Corrientes.",
  },
  {
    year: "2016",
    title: "Expansión online",
    description:
      "Lanzamos nuestra tienda online, alcanzando a clientes de todas las provincias argentinas.",
  },
  {
    year: "2020",
    title: "Red de artesanos",
    description:
      "Creamos una red de más de 50 artesanos locales, fortaleciendo la economía regional.",
  },
  {
    year: "2024",
    title: "15 años de tradición",
    description:
      "Celebramos 15 años compartiendo la cultura del mate con más de 10.000 clientes satisfechos.",
  },
]

const team = [
  {
    name: "Nicolas Menendez",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Nicolas_Menendez-7fTwFBbxBo8KLEMo490lFHWftGrwkJ.jpeg",
  },
  {
    name: "Thomas Mariani",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thomas_Mariani-OMSEgqtnaWGGl3eH5qtJjzAONC0pQS.jpeg",
  },
  {
    name: "Francisco Rodriguez Pons",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Francisco_Pons-eWsDbBV6oQUGp0mgwDJyTQg5ZHofIY.jpeg",
  },
  {
    name: "Kiara Adamo",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Kiara_Adamo-HwXLmvAYdrcVSWI6pm2gduqIYWU8Ou.jpeg",
  },
  {
    name: "Nicolas Rosencovich",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Nicolas_Rosencovich-etfJP5DKuMVIU5KbuZeNRo1PoiJLGk.jpeg",
  },
  {
    name: "Emma Knubel",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Emma_Knubel-fqOf3NkAgkF2c0hYEcgMnUN2ueO4Ee.jpeg",
  },
]

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                  Nuestra Historia
                </span>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  <span className="text-balance">15 años llevando la tradición del mate a tu hogar</span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Somos una empresa familiar argentina dedicada a la selección y 
                  comercialización de los mejores mates artesanales, bombillas y 
                  yerbas del país. Cada producto que ofrecemos cuenta una historia 
                  de tradición, artesanía y pasión.
                </p>
                <Link
                  href="/productos"
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Ver productos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="/hero-mate.jpg"
                    alt="Artesano trabajando en un mate"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg sm:p-6">
                  <p className="font-serif text-3xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Productos artesanales</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Nuestros valores
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Los principios que guían cada decisión y nos definen como empresa.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="text-center rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-secondary/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Nuestra trayectoria
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Un recorrido por los momentos más importantes de nuestra historia.
              </p>
            </div>

            <div className="mt-12 relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div
                    key={item.year}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div
                      className={`ml-12 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                      }`}
                    >
                      <div className="rounded-xl border border-border bg-card p-6">
                        <span className="inline-block rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                          {item.year}
                        </span>
                        <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Dot */}
                    <div className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-primary md:left-1/2 md:-translate-x-1/2">
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>

                    {/* Empty space for the other side */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Nuestro equipo
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Las personas detrás de Matero que hacen posible llevar la tradición del mate a tu hogar.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="text-center group"
                >
                  <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
              <span className="text-balance">¿Querés conocer nuestros productos?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              Descubrí nuestra selección de mates artesanales, bombillas y yerbas de la más alta calidad.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
              >
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center rounded-lg border border-primary-foreground/30 px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Contactanos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
  }