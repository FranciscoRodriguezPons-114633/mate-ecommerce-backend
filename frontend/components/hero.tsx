import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              Tradición Argentina
            </span>
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance">El arte del mate en tus manos</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Descubrí nuestra colección de mates artesanales, bombillas de alpaca y 
              las mejores yerbas argentinas. Cada pieza cuenta una historia de tradición y artesanía.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link 
                href="/productos" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver colección
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/nosotros" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium border border-foreground/20 text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                Nuestra historia
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-8">
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Productos artesanales</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">10k+</p>
                <p className="text-sm text-muted-foreground">Clientes felices</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">15</p>
                <p className="text-sm text-muted-foreground">Años de experiencia</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <Image
                src="/hero-mate.jpg"
                alt="Mate artesanal argentino con yerba mate y bombilla de alpaca"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <span className="text-2xl">🧉</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Envío gratis</p>
                  <p className="text-sm text-muted-foreground">En compras +$50.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
