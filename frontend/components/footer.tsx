import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react"

const footerLinks = {
  tienda: [
    { name: "Calabazas", href: "#calabazas" },
    { name: "Bombillas", href: "#bombillas" },
    { name: "Yerba Mate", href: "#yerba" },
    { name: "Accesorios", href: "#accesorios" },
    { name: "Sets Completos", href: "#sets" },
    { name: "Ofertas", href: "#ofertas" },
  ],
  empresa: [
    { name: "Nuestra Historia", href: "#historia" },
    { name: "Artesanos", href: "#artesanos" },
    { name: "Blog", href: "#blog" },
    { name: "Prensa", href: "#prensa" },
    { name: "Trabaja con nosotros", href: "#empleo" },
  ],
  ayuda: [
    { name: "Preguntas Frecuentes", href: "#faq" },
    { name: "Envíos", href: "#envios" },
    { name: "Devoluciones", href: "#devoluciones" },
    { name: "Guía de tallas", href: "#tallas" },
    { name: "Contacto", href: "#contacto" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="font-serif text-xl font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">Matero</span>
            </Link>
            <p className="mt-4 max-w-sm text-muted-foreground leading-relaxed">
              Desde 2009 llevando la tradición del mate argentino a todo el país. 
              Productos artesanales de la más alta calidad.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-foreground">
              Tienda
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.tienda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-foreground">
              Empresa
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-foreground">
              Ayuda
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.ayuda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact & Payment */}
        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Buenos Aires, Argentina</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+54 11 4567-8900</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>hola@matero.com.ar</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Pagá con:</span>
            <div className="flex gap-2">
              {["Visa", "MC", "AMEX", "MP"].map((card) => (
                <div
                  key={card}
                  className="flex h-8 w-12 items-center justify-center rounded bg-secondary text-xs font-medium text-muted-foreground"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; 2024 Matero. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-6 sm:justify-start">
            <Link href="#" className="hover:text-foreground">
              Términos y condiciones
            </Link>
            <Link href="#" className="hover:text-foreground">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
