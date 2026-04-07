import Image from "next/image"
import Link from "next/link"

const categories = [
  {
    name: "Calabazas",
    description: "Mates de calabaza natural",
    image: "/category-calabaza.jpg",
    href: "/productos?categoria=Calabazas",
    count: "48 productos",
  },
  {
    name: "Bombillas",
    description: "Alpaca, acero y plata",
    image: "/category-bombilla.jpg",
    href: "/productos?categoria=Bombillas",
    count: "32 productos",
  },
  {
    name: "Yerba Mate",
    description: "Las mejores marcas",
    image: "/category-yerba.jpg",
    href: "/productos?categoria=Yerba%20Mate",
    count: "65 productos",
  },
  {
    name: "Accesorios",
    description: "Todo para tu ritual",
    image: "/category-accesorios.jpg",
    href: "/productos?categoria=Accesorios",
    count: "24 productos",
  },
]

export function Categories() {
  return (
    <section className="py-16 sm:py-24" id="tienda">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-accent">
            Explorá
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Nuestras categorías
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Encontrá todo lo que necesitás para disfrutar del mate como un verdadero argentino
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-xl bg-card transition-all hover:shadow-lg"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
                  {category.count}
                </p>
                <h3 className="mt-1 font-serif text-xl font-bold text-primary-foreground">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
