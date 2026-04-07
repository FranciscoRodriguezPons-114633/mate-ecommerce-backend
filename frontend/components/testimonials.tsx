import Image from "next/image"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "María García",
    location: "Buenos Aires",
    image: "/testimonial-1.jpg",
    rating: 5,
    text: "Increíble calidad. El mate de calabaza que compré es hermoso y la atención fue excelente. Ya recomendé a todos mis amigos.",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    location: "Córdoba",
    image: "/testimonial-2.jpg",
    rating: 5,
    text: "Llevo años buscando una bombilla así. El acabado en alpaca es espectacular y el envío llegó antes de lo esperado.",
  },
  {
    id: 3,
    name: "Laura Fernández",
    location: "Mendoza",
    image: "/testimonial-3.jpg",
    rating: 5,
    text: "El set completo que regalé fue un éxito total. La presentación, la calidad de cada pieza... todo perfecto.",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-accent">
            Testimonios
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Miles de argentinos confían en nosotros para disfrutar del mate
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative flex flex-col rounded-xl bg-card p-6 shadow-sm"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-accent/20" />
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-foreground leading-relaxed">
                {`"${testimonial.text}"`}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
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
  )
}
