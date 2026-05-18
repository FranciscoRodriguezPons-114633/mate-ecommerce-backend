"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MateKitBuilder } from "@/components/mate-kit-builder"
import { useAuth } from "@/context/auth-context"
import {
  fetchProducts,
  fetchRecommendations,
  getProductDiscount,
  getProductFinalPrice,
  isProductDiscounted,
  type ApiProduct,
  type ProductRecommendation,
  type RecommendationNode,
  type RecommendationResponse,
} from "@/lib/api"
import {
  ArrowRight,
  BadgePercent,
  CircleDot,
  Heart,
  Layers3,
  ListFilter,
  Package,
  ShoppingBag,
  Sparkles,
  Tags,
} from "lucide-react"

const insightFilters = [
  { id: "favorites", label: "Tus favoritos", icon: Heart },
  { id: "bundles", label: "Compras juntas", icon: Layers3 },
  { id: "deals", label: "Packs y descuentos", icon: BadgePercent },
  { id: "categories", label: "Categorías", icon: Tags },
] as const

type InsightFilter = (typeof insightFilters)[number]["id"]

type MiniGraphNode = {
  id: string
  label: string
  type: "user" | "favorite" | "category" | "recommendation" | "bundle" | "deal"
  x: number
  y: number
  image?: string
  href?: string
}

type MiniGraphLink = {
  from: string
  to: string
  label: string
}

type BenefitNode = {
  product: ApiProduct
  x: number
  y: number
  size: number
  index: number
}

type FavoriteMapItem = {
  product: ApiProduct
  quantity: number
  kind: "repeat" | "suggest"
}

type FavoriteNode = FavoriteMapItem & {
  x: number
  y: number
  size: number
  index: number
}

type BundleMapPair = {
  products: [ApiProduct, ApiProduct]
  count: number
}

type BundleMapItem = {
  product: ApiProduct
  kind: "together" | "popular"
}

type BundleNode = BundleMapItem & {
  x: number
  y: number
  size: number
  index: number
}

type CategoryMapItem = {
  id: string
  name: string
  count: number
  kind: "explored" | "unexplored"
  product?: ApiProduct
}

type CategoryNode = CategoryMapItem & {
  x: number
  y: number
  size: number
  index: number
}

const miniGraphStyles = {
  user: {
    ring: "border-primary bg-primary text-primary-foreground",
    chip: "bg-primary text-primary-foreground",
  },
  favorite: {
    ring: "border-amber-700 bg-amber-700/10 text-amber-800",
    chip: "bg-amber-700/10 text-amber-800",
  },
  category: {
    ring: "border-emerald-700 bg-emerald-700/10 text-emerald-800",
    chip: "bg-emerald-700/10 text-emerald-800",
  },
  recommendation: {
    ring: "border-accent bg-accent/10 text-accent",
    chip: "bg-accent/10 text-accent",
  },
  bundle: {
    ring: "border-primary bg-primary/10 text-primary",
    chip: "bg-primary/10 text-primary",
  },
  deal: {
    ring: "border-amber-700 bg-amber-700 text-primary-foreground",
    chip: "bg-amber-700 text-primary-foreground",
  },
} as const

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)

function RecommendationCard({ item }: { item: ProductRecommendation }) {
  const productForPrice = (item.product || item) as Partial<ApiProduct>
  const hasDiscount = isProductDiscounted(productForPrice)

  return (
    <Link href={`/productos/${item.product_id}`} className="group block">
      <div className="h-full overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-square bg-secondary">
          <Image
            src={item.image || "/placeholder.jpg"}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            #{item.position}
          </span>
          {hasDiscount && (
            <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
              -{getProductDiscount(productForPrice)}%
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {item.category}
          </p>
          <h3 className="mt-1 line-clamp-2 font-medium text-foreground group-hover:text-primary">
            {item.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-lg font-bold text-foreground">{formatPrice(getProductFinalPrice(productForPrice))}</p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">{formatPrice(item.price)}</p>
            )}
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.reason}</p>
        </div>
      </div>
    </Link>
  )
}

const getProductFromNode = (node?: RecommendationNode) => {
  if (!node || node.type !== "Product") return null

  return {
    id: node.id,
    name: node.label,
    image: node.image || "/placeholder.jpg",
  }
}

const productFromRecommendation = (recommendation: ProductRecommendation): ApiProduct => ({
  _id: recommendation.product_id,
  id: recommendation.product_id,
  name: recommendation.name,
  description: recommendation.product?.description || "",
  price: recommendation.price,
  discountPercentage: recommendation.discountPercentage || recommendation.product?.discountPercentage || 0,
  quantity: recommendation.product?.quantity || 0,
  category: recommendation.category,
  image: recommendation.image || recommendation.product?.image || "/placeholder.jpg",
})

const productFromGraphNode = (node?: RecommendationNode): ApiProduct | null => {
  if (!node || node.type !== "Product") return null

  return {
    _id: node.id,
    id: node.id,
    name: node.label,
    description: "",
    price: 0,
    discountPercentage: 0,
    quantity: 0,
    category: "",
    image: node.image || "/placeholder.jpg",
  }
}

function MiniAffinityGraph({
  nodes,
  links,
}: {
  nodes: MiniGraphNode[]
  links: MiniGraphLink[]
}) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div className="relative mt-6 min-h-[360px] overflow-hidden rounded-xl border border-border bg-background">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {links.map((link, index) => {
          const from = nodesById.get(link.from)
          const to = nodesById.get(link.to)
          if (!from || !to) return null

          return (
            <line
              key={`${link.from}-${link.to}-${index}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#d8c8aa"
              strokeWidth="0.6"
              strokeDasharray={to.type === "recommendation" ? "1.5 1.5" : undefined}
              opacity="0.85"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {links.map((link, index) => {
        const from = nodesById.get(link.from)
        const to = nodesById.get(link.to)
        if (!from || !to) return null

        return (
          <span
            key={`${link.label}-${index}`}
            className="absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm md:block"
            style={{
              left: `${(from.x + to.x) / 2}%`,
              top: `${(from.y + to.y) / 2}%`,
            }}
          >
            {link.label}
          </span>
        )
      })}

      {nodes.map((node) => {
        const style = miniGraphStyles[node.type]
        const content = (
          <div
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${node.x}%`, top: `${node.y}%`, width: node.type === "user" ? 128 : 116 }}
          >
            <div
              className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 shadow-md ${style.ring} ${
                node.type === "user" ? "h-20 w-20" : "h-16 w-16"
              }`}
            >
              {node.image ? (
                <Image src={node.image} alt={node.label} fill className="object-cover p-1" />
              ) : node.type === "user" ? (
                <Sparkles className="h-8 w-8" />
              ) : node.type === "bundle" ? (
                <Layers3 className="h-8 w-8" />
              ) : node.type === "deal" ? (
                <BadgePercent className="h-8 w-8" />
              ) : (
                <CircleDot className="h-7 w-7" />
              )}
            </div>
            <span
              className={`mt-2 max-w-full rounded-full px-3 py-1 text-center text-xs font-semibold shadow-sm ${style.chip}`}
            >
              <span className="line-clamp-1">{node.label}</span>
            </span>
          </div>
        )

        if (!node.href) {
          return <div key={node.id}>{content}</div>
        }

        return (
          <Link key={node.id} href={node.href} className="contents">
            {content}
          </Link>
        )
      })}
    </div>
  )
}

function BenefitMap({ products }: { products: ApiProduct[] }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const total = products.length
  const centerX = 260
  const centerY = 205
  const radius = total <= 3 ? 130 : total <= 6 ? 155 : 180
  const nodeSize = total >= 7 ? 38 : 48
  const selectedProduct = products.find((product) => product._id === selectedProductId)
  const nodes: BenefitNode[] = products.map((product, index) => {
    const angle = (2 * Math.PI / Math.max(total, 1)) * index - Math.PI / 2

    return {
      product,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      size: nodeSize,
      index,
    }
  })
  const selectedNode = selectedProduct
    ? nodes.find((node) => node.product._id === selectedProduct._id)
    : null
  const maxDiscount = products.reduce((max, product) => Math.max(max, getProductDiscount(product)), 0)
  const strongDeals = products.filter((product) => getProductDiscount(product) >= 30).length

  return (
    <div className="rounded-2xl border p-6" style={{ background: "#F5EDD8", borderColor: "#D4B896" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold" style={{ color: "#1f1209" }}>
            Mapa de beneficios
          </h3>
          <p className="mt-2 text-sm" style={{ color: "#6b5d50" }}>
            Productos con descuentos activos cargados desde el panel de administración.
          </p>
        </div>
        <BadgePercent className="h-8 w-8 shrink-0" style={{ color: "#7A3010" }} />
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl" style={{ background: "#E8D9BE" }}>
        <svg
          className="h-[420px] w-full"
          viewBox="0 0 520 420"
          role="img"
          aria-label="Productos con beneficios activos"
        >
          <defs>
            <radialGradient id="benefitCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C47020" stopOpacity="0.42" />
              <stop offset="62%" stopColor="#C47020" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C47020" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="benefitCenterFill" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#D4793A" />
              <stop offset="100%" stopColor="#7A3010" />
            </linearGradient>
            <radialGradient id="benefitProductFill" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#FFFAF3" />
              <stop offset="100%" stopColor="#F0E4CC" />
            </radialGradient>
            {nodes.map((node) => (
              <clipPath key={`clip-${node.product._id}`} id={`benefitClip-${node.product._id}`}>
                <circle cx={node.x} cy={node.y} r={node.size / 2 - 6} />
              </clipPath>
            ))}
          </defs>

          <ellipse className="benefit-glow-center" cx={centerX} cy={centerY} rx="150" ry="110" fill="url(#benefitCenterGlow)" />
          <ellipse className="benefit-pulse-ring" cx={centerX} cy={centerY} rx="106" ry="74" fill="none" stroke="#C47020" strokeWidth="1.5" />
          <ellipse className="benefit-pulse-ring benefit-pulse-ring-delayed" cx={centerX} cy={centerY} rx="154" ry="108" fill="none" stroke="#C47020" strokeWidth="1.2" />

          {nodes.map((node) => (
            <line
              key={`line-${node.product._id}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="#9A6030"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.6"
            />
          ))}

          <g>
            <circle cx={centerX} cy={centerY} r="42" fill="url(#benefitCenterFill)" stroke="#C47020" strokeWidth="2" />
            <text x={centerX} y={centerY - 2} textAnchor="middle" dominantBaseline="middle" fontSize="29" fill="#FDEBD0">
              ⊗
            </text>
            <text x={centerX} y={centerY + 57} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5A3018">
              Beneficio
            </text>
          </g>

          {nodes.map((node) => {
            const discount = getProductDiscount(node.product)
            const image = node.product.image || ""
            const initial = node.product.name.trim().charAt(0).toUpperCase() || "P"

            return (
              <g
                key={node.product._id}
                className="benefit-float-node cursor-pointer"
                style={{ animationDelay: `${node.index * 0.6}s` }}
                onClick={() => setSelectedProductId((current) => (current === node.product._id ? null : node.product._id))}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill="url(#benefitProductFill)"
                  stroke="#A06030"
                  strokeWidth={discount >= 50 ? 2.5 : 1.5}
                />
                {image ? (
                  <image
                    href={image}
                    x={node.x - node.size / 2 + 6}
                    y={node.y - node.size / 2 + 6}
                    width={node.size - 12}
                    height={node.size - 12}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#benefitClip-${node.product._id})`}
                  />
                ) : (
                  <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill="#7A3010">
                    {initial}
                  </text>
                )}
                <rect
                  x={node.x - 24}
                  y={node.y + node.size / 2 + 8}
                  width="48"
                  height="22"
                  rx="11"
                  fill="#7A3010"
                />
                <text x={node.x} y={node.y + node.size / 2 + 23} textAnchor="middle" fontSize="12" fontWeight="700" fill="#FDEBD0">
                  -{discount}%
                </text>
                <text x={node.x} y={node.y + node.size / 2 + 49} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5A3018">
                  {node.product.name.length > 20 ? `${node.product.name.slice(0, 20)}...` : node.product.name}
                </text>
              </g>
            )
          })}
        </svg>

        {total === 0 && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl border border-dashed border-[#C8A882] bg-[#F5EDD8]/80 p-6 text-center">
            <BadgePercent className="mx-auto h-9 w-9" style={{ color: "#7A3010" }} />
            <p className="mt-3 font-semibold" style={{ color: "#3B1F0A" }}>
              No hay descuentos activos
            </p>
            <p className="mt-1 text-sm" style={{ color: "#8A6040" }}>
              Cuando cargues ofertas desde el panel, se van a mostrar acá.
            </p>
          </div>
        )}

        {selectedProduct && selectedNode && (
          <div
            className="absolute z-30 w-64 rounded-xl border bg-white p-4 shadow-xl"
            style={{
              borderColor: "#D4B896",
              left: `${Math.min(Math.max((selectedNode.x / 520) * 100, 8), 58)}%`,
              top: `${Math.min(Math.max((selectedNode.y / 420) * 100, 10), 58)}%`,
            }}
          >
            <p className="font-semibold" style={{ color: "#3B1F0A" }}>{selectedProduct.name}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold" style={{ color: "#7A3010" }}>
                {formatPrice(getProductFinalPrice(selectedProduct))}
              </span>
              <span className="text-sm line-through" style={{ color: "#8A6040" }}>
                {formatPrice(selectedProduct.price)}
              </span>
            </div>
            <p className="mt-1 text-sm" style={{ color: "#8A6040" }}>
              Ahorrás {getProductDiscount(selectedProduct)}%
            </p>
            <Link
              href={`/productos/${selectedProduct._id}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: "#7A3010", color: "#FDEBD0" }}
            >
              Ver producto →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { value: total, label: "ofertas activas", Icon: ShoppingBag },
          { value: `${maxDiscount}%`, label: "mayor descuento", Icon: BadgePercent },
          { value: strongDeals, label: "ofertas fuertes", Icon: Tags },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between rounded-[10px] border px-4 py-3"
            style={{ background: "#EDE0CC", borderColor: "#C8A882" }}
          >
            <div>
              <p className="text-xl font-bold" style={{ color: "#3B1F0A" }}>{metric.value}</p>
              <p className="text-xs" style={{ color: "#8A6040" }}>{metric.label}</p>
            </div>
            <metric.Icon className="h-5 w-5" style={{ color: "#8A6040" }} />
          </div>
        ))}
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .benefit-pulse-ring {
            transform-origin: ${centerX}px ${centerY}px;
            animation: pulse-ring 4s ease-in-out infinite;
          }
          .benefit-pulse-ring-delayed {
            animation-delay: 1.2s;
          }
          .benefit-glow-center {
            animation: glow-center 3.5s ease-in-out infinite;
          }
          .benefit-float-node {
            transform-box: fill-box;
            transform-origin: center;
            animation: float-node 4s ease-in-out infinite;
          }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: .22; transform: scale(1); }
          50% { opacity: .42; transform: scale(1.05); }
        }
        @keyframes glow-center {
          0%, 100% { opacity: .45; }
          50% { opacity: .75; }
        }
        @keyframes float-node {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

function FavoriteMap({
  userName,
  items,
}: {
  userName: string
  items: FavoriteMapItem[]
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isMapLoved, setIsMapLoved] = useState(false)
  const total = items.length
  const centerX = 260
  const centerY = 205
  const radius = total <= 3 ? 130 : total <= 6 ? 155 : 180
  const nodeSize = total >= 7 ? 38 : 48
  const firstName = userName.split(" ")[0] || "Vos"
  const selectedItem = items.find((item) => item.product._id === selectedProductId)
  const nodes: FavoriteNode[] = items.map((item, index) => {
    const angle = (2 * Math.PI / Math.max(total, 1)) * index - Math.PI / 2

    return {
      ...item,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      size: nodeSize,
      index,
    }
  })
  const selectedNode = selectedItem
    ? nodes.find((node) => node.product._id === selectedItem.product._id)
    : null
  const repeatedItems = items.filter((item) => item.kind === "repeat" && item.quantity > 1)
  const suggestionCount = items.filter((item) => item.kind === "suggest").length
  const maxRepetitions = items.reduce((max, item) => Math.max(max, item.kind === "repeat" ? item.quantity : 0), 0)

  return (
    <div className="rounded-2xl border p-6" style={{ background: "#F5EDD8", borderColor: "#D4B896" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold" style={{ color: "#1f1209" }}>
            Mapa de favoritos
          </h3>
          <p className="mt-2 text-sm" style={{ color: "#6b5d50" }}>
            Productos que más se repiten y sugerencias cercanas para recompra.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMapLoved((current) => !current)}
          className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{
            background: isMapLoved ? "#7A3010" : "#FFF8EA",
            borderColor: isMapLoved ? "#7A3010" : "#D4B896",
            color: isMapLoved ? "#FDEBD0" : "#7A3010",
          }}
          aria-pressed={isMapLoved}
          aria-label={isMapLoved ? "Quitar favorito visual" : "Marcar favorito visual"}
          title={isMapLoved ? "Mapa marcado" : "Marcar este mapa"}
        >
          <Heart
            className="h-6 w-6 transition-transform group-hover:scale-110"
            fill={isMapLoved ? "currentColor" : "none"}
          />
          {isMapLoved && (
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#F5EDD8] bg-[#D4793A]" />
          )}
        </button>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl" style={{ background: "#E8D9BE" }}>
        <svg
          className="h-[420px] w-full"
          viewBox="0 0 520 420"
          role="img"
          aria-label="Productos favoritos y sugerencias de recompra"
        >
          <defs>
            <radialGradient id="favoriteCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C47020" stopOpacity="0.42" />
              <stop offset="62%" stopColor="#C47020" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C47020" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="favoriteCenterFill" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#D4793A" />
              <stop offset="100%" stopColor="#7A3010" />
            </linearGradient>
            <radialGradient id="favoriteProductFill" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#FFFAF3" />
              <stop offset="100%" stopColor="#F0E4CC" />
            </radialGradient>
            {nodes.map((node) => (
              <clipPath key={`favorite-clip-${node.product._id}`} id={`favoriteClip-${node.product._id}`}>
                <circle cx={node.x} cy={node.y} r={node.size / 2 - 6} />
              </clipPath>
            ))}
          </defs>

          <ellipse className="favorite-glow-center" cx={centerX} cy={centerY} rx="150" ry="110" fill="url(#favoriteCenterGlow)" />
          <ellipse className="favorite-pulse-ring" cx={centerX} cy={centerY} rx="106" ry="74" fill="none" stroke="#C47020" strokeWidth="1.5" />
          <ellipse className="favorite-pulse-ring favorite-pulse-ring-delayed" cx={centerX} cy={centerY} rx="154" ry="108" fill="none" stroke="#C47020" strokeWidth="1.2" />

          {nodes.map((node) => (
            <line
              key={`favorite-line-${node.product._id}-${node.kind}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="#9A6030"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.6"
            />
          ))}

          <g>
            <circle cx={centerX} cy={centerY} r="42" fill="url(#favoriteCenterFill)" stroke="#C47020" strokeWidth="2" />
            <text x={centerX} y={centerY - 2} textAnchor="middle" dominantBaseline="middle" fontSize="31" fill="#FDEBD0">
              ✦
            </text>
            <text x={centerX} y={centerY + 57} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5A3018">
              {firstName}
            </text>
          </g>

          {nodes.map((node) => {
            const image = node.product.image || ""
            const initial = node.product.name.trim().charAt(0).toUpperCase() || "P"
            const badge = node.kind === "repeat" ? "repite" : "sugiere"
            const badgeFill = node.kind === "repeat" ? "#F2C7B4" : "#EDE0CC"
            const badgeText = node.kind === "repeat" ? "#7A3010" : "#5A3018"

            return (
              <g
                key={`favorite-node-${node.product._id}-${node.kind}`}
                className="favorite-float-node cursor-pointer"
                style={{ animationDelay: `${node.index * 0.6}s` }}
                onClick={() => setSelectedProductId((current) => (current === node.product._id ? null : node.product._id))}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill="url(#favoriteProductFill)"
                  stroke="#A06030"
                  strokeWidth="1.5"
                />
                {image ? (
                  <image
                    href={image}
                    x={node.x - node.size / 2 + 6}
                    y={node.y - node.size / 2 + 6}
                    width={node.size - 12}
                    height={node.size - 12}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#favoriteClip-${node.product._id})`}
                  />
                ) : (
                  <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill="#7A3010">
                    {initial}
                  </text>
                )}
                <rect
                  x={node.x - 30}
                  y={node.y + node.size / 2 + 8}
                  width="60"
                  height="22"
                  rx="11"
                  fill={badgeFill}
                />
                <text x={node.x} y={node.y + node.size / 2 + 23} textAnchor="middle" fontSize="12" fontWeight="700" fill={badgeText}>
                  {badge}
                </text>
                <text x={node.x} y={node.y + node.size / 2 + 49} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5A3018">
                  {node.product.name.length > 20 ? `${node.product.name.slice(0, 20)}...` : node.product.name}
                </text>
              </g>
            )
          })}
        </svg>

        {total === 0 && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl border border-dashed border-[#C8A882] bg-[#F5EDD8]/80 p-6 text-center">
            <Heart className="mx-auto h-9 w-9" style={{ color: "#7A3010" }} />
            <p className="mt-3 font-semibold" style={{ color: "#3B1F0A" }}>
              Todavía no hay favoritos claros
            </p>
            <p className="mt-1 text-sm" style={{ color: "#8A6040" }}>
              Cuando tengas más compras, vamos a marcar tus recompra más frecuentes.
            </p>
          </div>
        )}

        {selectedItem && selectedNode && (
          <div
            className="absolute z-30 w-64 rounded-xl border bg-white p-4 shadow-xl"
            style={{
              borderColor: "#D4B896",
              left: `${Math.min(Math.max((selectedNode.x / 520) * 100, 8), 58)}%`,
              top: `${Math.min(Math.max((selectedNode.y / 420) * 100, 10), 58)}%`,
            }}
          >
            <p className="font-semibold" style={{ color: "#3B1F0A" }}>{selectedItem.product.name}</p>
            <p className="mt-2 text-sm" style={{ color: "#8A6040" }}>
              {selectedItem.kind === "repeat"
                ? `Lo compraste ${selectedItem.quantity} ${selectedItem.quantity === 1 ? "vez" : "veces"}.`
                : "Sugerencia cercana para completar tu próxima compra."}
            </p>
            <p className="mt-2 text-lg font-bold" style={{ color: "#7A3010" }}>
              {selectedItem.product.price ? formatPrice(getProductFinalPrice(selectedItem.product)) : "Ver detalle"}
            </p>
            <Link
              href={`/productos/${selectedItem.product._id}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: "#7A3010", color: "#FDEBD0" }}
            >
              Ver producto →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { value: repeatedItems.length, label: "favoritos", Icon: Heart },
          { value: maxRepetitions, label: "max repeticiones", Icon: ShoppingBag },
          { value: suggestionCount, label: "sugerencias", Icon: Sparkles },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between rounded-[10px] border px-4 py-3"
            style={{ background: "#EDE0CC", borderColor: "#C8A882" }}
          >
            <div>
              <p className="text-xl font-bold" style={{ color: "#3B1F0A" }}>{metric.value}</p>
              <p className="text-xs" style={{ color: "#8A6040" }}>{metric.label}</p>
            </div>
            <metric.Icon className="h-5 w-5" style={{ color: "#8A6040" }} />
          </div>
        ))}
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .favorite-pulse-ring {
            transform-origin: ${centerX}px ${centerY}px;
            animation: pulse-ring 4s ease-in-out infinite;
          }
          .favorite-pulse-ring-delayed {
            animation-delay: 1.2s;
          }
          .favorite-glow-center {
            animation: glow-center 3.5s ease-in-out infinite;
          }
          .favorite-float-node {
            transform-box: fill-box;
            transform-origin: center;
            animation: float-node 4s ease-in-out infinite;
          }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: .22; transform: scale(1); }
          50% { opacity: .42; transform: scale(1.05); }
        }
        @keyframes glow-center {
          0%, 100% { opacity: .45; }
          50% { opacity: .75; }
        }
        @keyframes float-node {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

function BundleMap({
  pairs,
  suggestions,
}: {
  pairs: BundleMapPair[]
  suggestions: ApiProduct[]
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const centerX = 260
  const centerY = 205
  const productKinds = new Map<string, BundleMapItem>()

  for (const pair of pairs) {
    for (const product of pair.products) {
      productKinds.set(product._id, { product, kind: "together" })
    }
  }

  for (const product of suggestions) {
    if (!productKinds.has(product._id)) {
      productKinds.set(product._id, { product, kind: "popular" })
    }
  }

  const items = Array.from(productKinds.values()).slice(0, 8)
  const total = items.length
  const radius = total <= 3 ? 130 : total <= 6 ? 155 : 180
  const nodeSize = total >= 7 ? 38 : 48
  const nodes: BundleNode[] = items.map((item, index) => {
    const angle = (2 * Math.PI / Math.max(total, 1)) * index - Math.PI / 2

    return {
      ...item,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      size: nodeSize,
      index,
    }
  })
  const nodesByProductId = new Map(nodes.map((node) => [node.product._id, node]))
  const selectedItem = items.find((item) => item.product._id === selectedProductId)
  const selectedNode = selectedItem
    ? nodesByProductId.get(selectedItem.product._id)
    : null
  const topPair = pairs[0]
  const topPairLabel = topPair
    ? `${topPair.products[0].name} + ${topPair.products[1].name}`
    : "Sin combo aún"

  return (
    <div className="rounded-2xl border p-6" style={{ background: "#F5EDD8", borderColor: "#D4B896" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold" style={{ color: "#1f1209" }}>
            Mapa de compras juntas
          </h3>
          <p className="mt-2 text-sm" style={{ color: "#6b5d50" }}>
            Productos que comprás juntos y combos populares entre clientes similares.
          </p>
        </div>
        <Layers3 className="h-8 w-8 shrink-0" style={{ color: "#7A3010" }} />
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl" style={{ background: "#E8D9BE" }}>
        <svg
          className="h-[420px] w-full"
          viewBox="0 0 520 420"
          role="img"
          aria-label="Productos comprados juntos y combos sugeridos"
        >
          <defs>
            <radialGradient id="bundleCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C47020" stopOpacity="0.42" />
              <stop offset="62%" stopColor="#C47020" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C47020" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bundleCenterFill" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#D4793A" />
              <stop offset="100%" stopColor="#7A3010" />
            </linearGradient>
            <radialGradient id="bundleProductFill" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#FFFAF3" />
              <stop offset="100%" stopColor="#F0E4CC" />
            </radialGradient>
            {nodes.map((node) => (
              <clipPath key={`bundle-clip-${node.product._id}`} id={`bundleClip-${node.product._id}`}>
                <circle cx={node.x} cy={node.y} r={node.size / 2 - 6} />
              </clipPath>
            ))}
          </defs>

          <ellipse className="bundle-glow-center" cx={centerX} cy={centerY} rx="150" ry="110" fill="url(#bundleCenterGlow)" />
          <ellipse className="bundle-pulse-ring" cx={centerX} cy={centerY} rx="106" ry="74" fill="none" stroke="#C47020" strokeWidth="1.5" />
          <ellipse className="bundle-pulse-ring bundle-pulse-ring-delayed" cx={centerX} cy={centerY} rx="154" ry="108" fill="none" stroke="#C47020" strokeWidth="1.2" />

          {nodes.map((node) => (
            <line
              key={`bundle-center-line-${node.product._id}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="#9A6030"
              strokeWidth="1.1"
              strokeDasharray="5 4"
              opacity="0.45"
            />
          ))}

          {pairs.map((pair, index) => {
            const first = nodesByProductId.get(pair.products[0]._id)
            const second = nodesByProductId.get(pair.products[1]._id)
            if (!first || !second) return null

            return (
              <g key={`bundle-pair-${pair.products[0]._id}-${pair.products[1]._id}-${index}`}>
                <line x1={first.x - 3} y1={first.y - 3} x2={second.x - 3} y2={second.y - 3} stroke="#9A6030" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.6" />
                <line x1={first.x + 3} y1={first.y + 3} x2={second.x + 3} y2={second.y + 3} stroke="#9A6030" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.6" />
              </g>
            )
          })}

          <g>
            <circle cx={centerX} cy={centerY} r="42" fill="url(#bundleCenterFill)" stroke="#C47020" strokeWidth="2" />
            <foreignObject x={centerX - 17} y={centerY - 17} width="34" height="34">
              <div className="flex h-full w-full items-center justify-center text-[#FDEBD0]">
                <Layers3 className="h-7 w-7" />
              </div>
            </foreignObject>
            <text x={centerX} y={centerY + 57} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5A3018">
              Combos
            </text>
          </g>

          {nodes.map((node) => {
            const image = node.product.image || ""
            const initial = node.product.name.trim().charAt(0).toUpperCase() || "P"
            const badge = node.kind === "together" ? "juntos" : "combo popular"
            const badgeWidth = node.kind === "together" ? 62 : 104
            const badgeFill = node.kind === "together" ? "#F2C7B4" : "#EDE0CC"
            const badgeText = node.kind === "together" ? "#7A3010" : "#5A3018"

            return (
              <g
                key={`bundle-node-${node.product._id}-${node.kind}`}
                className="bundle-float-node cursor-pointer"
                style={{ animationDelay: `${node.index * 0.6}s` }}
                onClick={() => setSelectedProductId((current) => (current === node.product._id ? null : node.product._id))}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill="url(#bundleProductFill)"
                  stroke="#A06030"
                  strokeWidth="1.5"
                />
                {image ? (
                  <image
                    href={image}
                    x={node.x - node.size / 2 + 6}
                    y={node.y - node.size / 2 + 6}
                    width={node.size - 12}
                    height={node.size - 12}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#bundleClip-${node.product._id})`}
                  />
                ) : (
                  <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill="#7A3010">
                    {initial}
                  </text>
                )}
                <rect
                  x={node.x - badgeWidth / 2}
                  y={node.y + node.size / 2 + 8}
                  width={badgeWidth}
                  height="22"
                  rx="11"
                  fill={badgeFill}
                />
                <text x={node.x} y={node.y + node.size / 2 + 23} textAnchor="middle" fontSize="12" fontWeight="700" fill={badgeText}>
                  {badge}
                </text>
                <text x={node.x} y={node.y + node.size / 2 + 49} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5A3018">
                  {node.product.name.length > 20 ? `${node.product.name.slice(0, 20)}...` : node.product.name}
                </text>
              </g>
            )
          })}
        </svg>

        {total === 0 && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl border border-dashed border-[#C8A882] bg-[#F5EDD8]/80 p-6 text-center">
            <Layers3 className="mx-auto h-9 w-9" style={{ color: "#7A3010" }} />
            <p className="mt-3 font-semibold" style={{ color: "#3B1F0A" }}>
              Todavía no hay combos claros
            </p>
            <p className="mt-1 text-sm" style={{ color: "#8A6040" }}>
              Cuando haya pedidos con más de un producto, vamos a detectar compras juntas.
            </p>
          </div>
        )}

        {selectedItem && selectedNode && (
          <div
            className="absolute z-30 w-64 rounded-xl border bg-white p-4 shadow-xl"
            style={{
              borderColor: "#D4B896",
              left: `${Math.min(Math.max((selectedNode.x / 520) * 100, 8), 58)}%`,
              top: `${Math.min(Math.max((selectedNode.y / 420) * 100, 10), 58)}%`,
            }}
          >
            <p className="font-semibold" style={{ color: "#3B1F0A" }}>{selectedItem.product.name}</p>
            <p className="mt-2 text-sm" style={{ color: "#8A6040" }}>
              {selectedItem.kind === "together"
                ? "Aparece en pares de compra de tu historial."
                : "Combo popular entre clientes similares."}
            </p>
            <p className="mt-2 text-lg font-bold" style={{ color: "#7A3010" }}>
              {selectedItem.product.price ? formatPrice(getProductFinalPrice(selectedItem.product)) : "Ver detalle"}
            </p>
            <Link
              href={`/productos/${selectedItem.product._id}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: "#7A3010", color: "#FDEBD0" }}
            >
              Ver producto →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { value: pairs.length, label: "pares juntos", Icon: Layers3 },
          { value: topPairLabel.length > 34 ? `${topPairLabel.slice(0, 34)}...` : topPairLabel, label: "combo más repetido", Icon: ShoppingBag },
          { value: suggestions.length, label: "sugerencias nuevas", Icon: Sparkles },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between rounded-[10px] border px-4 py-3"
            style={{ background: "#EDE0CC", borderColor: "#C8A882" }}
          >
            <div className="min-w-0">
              <p className="truncate text-xl font-bold" style={{ color: "#3B1F0A" }}>{metric.value}</p>
              <p className="text-xs" style={{ color: "#8A6040" }}>{metric.label}</p>
            </div>
            <metric.Icon className="h-5 w-5 shrink-0" style={{ color: "#8A6040" }} />
          </div>
        ))}
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .bundle-pulse-ring {
            transform-origin: ${centerX}px ${centerY}px;
            animation: pulse-ring 4s ease-in-out infinite;
          }
          .bundle-pulse-ring-delayed {
            animation-delay: 1.2s;
          }
          .bundle-glow-center {
            animation: glow-center 3.5s ease-in-out infinite;
          }
          .bundle-float-node {
            transform-box: fill-box;
            transform-origin: center;
            animation: float-node 4s ease-in-out infinite;
          }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: .22; transform: scale(1); }
          50% { opacity: .42; transform: scale(1.05); }
        }
        @keyframes glow-center {
          0%, 100% { opacity: .45; }
          50% { opacity: .75; }
        }
        @keyframes float-node {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

function CategoryMap({ items }: { items: CategoryMapItem[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const centerX = 260
  const centerY = 205
  const total = items.length
  const radius = total <= 3 ? 130 : total <= 6 ? 155 : 180
  const nodeSize = total >= 7 ? 38 : 48
  const nodes: CategoryNode[] = items.map((item, index) => {
    const angle = (2 * Math.PI / Math.max(total, 1)) * index - Math.PI / 2

    return {
      ...item,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      size: nodeSize,
      index,
    }
  })
  const selectedItem = items.find((item) => item.id === selectedCategoryId)
  const selectedNode = selectedItem
    ? nodes.find((node) => node.id === selectedItem.id)
    : null
  const exploredCategories = items.filter((item) => item.kind === "explored")
  const unexploredCategories = items.filter((item) => item.kind === "unexplored")
  const favoriteCategory = exploredCategories[0]?.name || "Sin historial"
  const tooltipPosition = selectedNode
    ? {
        ...(selectedNode.x > centerX ? { left: 16 } : { right: 16 }),
        ...(selectedNode.y > centerY ? { top: 16 } : { bottom: 16 }),
      }
    : {}

  return (
    <div className="rounded-2xl border p-6" style={{ background: "#F5EDD8", borderColor: "#D4B896" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold" style={{ color: "#1f1209" }}>
            Mapa de categorías
          </h3>
          <p className="mt-2 text-sm" style={{ color: "#6b5d50" }}>
            Categorías que exploraste y las que todavía te faltan descubrir.
          </p>
        </div>
        <Tags className="h-8 w-8 shrink-0" style={{ color: "#7A3010" }} />
      </div>

      <div className="relative mt-6 overflow-hidden rounded-xl" style={{ background: "#E8D9BE" }}>
        <svg
          className="h-[420px] w-full"
          viewBox="0 0 520 420"
          role="img"
          aria-label="Categorías exploradas y pendientes"
        >
          <defs>
            <radialGradient id="categoryCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C47020" stopOpacity="0.42" />
              <stop offset="62%" stopColor="#C47020" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C47020" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="categoryCenterFill" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#D4793A" />
              <stop offset="100%" stopColor="#7A3010" />
            </linearGradient>
          </defs>

          <ellipse className="category-glow-center" cx={centerX} cy={centerY} rx="150" ry="110" fill="url(#categoryCenterGlow)" />
          <ellipse className="category-pulse-ring" cx={centerX} cy={centerY} rx="106" ry="74" fill="none" stroke="#C47020" strokeWidth="1.5" />
          <ellipse className="category-pulse-ring category-pulse-ring-delayed" cx={centerX} cy={centerY} rx="154" ry="108" fill="none" stroke="#C47020" strokeWidth="1.2" />

          {nodes.map((node) => (
            <line
              key={`category-line-${node.id}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="#9A6030"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.6"
            />
          ))}

          <g>
            <circle cx={centerX} cy={centerY} r="42" fill="url(#categoryCenterFill)" stroke="#C47020" strokeWidth="2" />
            <foreignObject x={centerX - 17} y={centerY - 17} width="34" height="34">
              <div className="flex h-full w-full items-center justify-center text-[#FDEBD0]">
                <Tags className="h-7 w-7" />
              </div>
            </foreignObject>
            <text x={centerX} y={centerY + 57} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5A3018">
              Categorías
            </text>
          </g>

          {nodes.map((node) => {
            const isExplored = node.kind === "explored"
            const initial = node.name.trim().charAt(0).toUpperCase() || "C"
            const badge = isExplored ? `${node.count} ${node.count === 1 ? "vez" : "veces"}` : "explorar"
            const badgeWidth = isExplored ? 72 : 82

            return (
              <g
                key={`category-node-${node.id}`}
                className="category-float-node cursor-pointer"
                style={{ animationDelay: `${node.index * 0.6}s` }}
                onClick={() => setSelectedCategoryId((current) => (current === node.id ? null : node.id))}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill={isExplored ? "#D6EDE5" : "#F0E4CC"}
                  stroke={isExplored ? "#2D7A5F" : "#A06030"}
                  strokeWidth={isExplored ? 2 : 1.5}
                  strokeDasharray={isExplored ? undefined : "4 4"}
                />
                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="800" fill={isExplored ? "#1F6B52" : "#7A3010"}>
                  {initial}
                </text>
                <rect
                  x={node.x - badgeWidth / 2}
                  y={node.y + node.size / 2 + 8}
                  width={badgeWidth}
                  height="22"
                  rx="11"
                  fill={isExplored ? "#D6EDE5" : "#EDE0CC"}
                />
                <text x={node.x} y={node.y + node.size / 2 + 23} textAnchor="middle" fontSize="12" fontWeight="700" fill={isExplored ? "#1F6B52" : "#5A3018"}>
                  {badge}
                </text>
                <text x={node.x} y={node.y + node.size / 2 + 49} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5A3018">
                  {node.name.length > 20 ? `${node.name.slice(0, 20)}...` : node.name}
                </text>
              </g>
            )
          })}
        </svg>

        {total === 0 && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl border border-dashed border-[#C8A882] bg-[#F5EDD8]/80 p-6 text-center">
            <Tags className="mx-auto h-9 w-9" style={{ color: "#7A3010" }} />
            <p className="mt-3 font-semibold" style={{ color: "#3B1F0A" }}>
              No hay categorías disponibles
            </p>
            <p className="mt-1 text-sm" style={{ color: "#8A6040" }}>
              Cuando el catálogo tenga productos, vamos a mostrar el recorrido por categoría.
            </p>
          </div>
        )}

        {selectedItem && selectedNode && (
          <div
            className="absolute z-30 max-h-[calc(100%-32px)] w-72 overflow-auto rounded-xl border bg-white p-4 shadow-xl"
            style={{
              borderColor: "#D4B896",
              ...tooltipPosition,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold" style={{ color: "#3B1F0A" }}>{selectedItem.name}</p>
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition-colors hover:bg-[#F5EDD8]"
                style={{ borderColor: "#E0CDB2", color: "#7A3010" }}
                aria-label="Cerrar detalle"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-sm" style={{ color: "#8A6040" }}>
              {selectedItem.kind === "explored"
                ? `La exploraste ${selectedItem.count} ${selectedItem.count === 1 ? "vez" : "veces"}.`
                : "Todavía no aparece en tu historial."}
            </p>
            {selectedItem.product && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#E0CDB2] bg-[#F5EDD8]/60 p-2">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#E8D9BE]">
                  <Image src={selectedItem.product.image || "/placeholder.jpg"} alt={selectedItem.product.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold" style={{ color: "#3B1F0A" }}>
                    {selectedItem.product.name}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#7A3010" }}>
                    {formatPrice(getProductFinalPrice(selectedItem.product))}
                  </p>
                </div>
              </div>
            )}
            <Link
              href={`/productos?category=${encodeURIComponent(selectedItem.name)}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: "#7A3010", color: "#FDEBD0" }}
            >
              Ver categoría →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { value: exploredCategories.length, label: "exploradas", Icon: Tags },
          { value: favoriteCategory, label: "categoría favorita", Icon: Heart },
          { value: unexploredCategories.length, label: "sin explorar", Icon: Sparkles },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between rounded-[10px] border px-4 py-3"
            style={{ background: "#EDE0CC", borderColor: "#C8A882" }}
          >
            <div className="min-w-0">
              <p className="truncate text-xl font-bold" style={{ color: "#3B1F0A" }}>{metric.value}</p>
              <p className="text-xs" style={{ color: "#8A6040" }}>{metric.label}</p>
            </div>
            <metric.Icon className="h-5 w-5 shrink-0" style={{ color: "#8A6040" }} />
          </div>
        ))}
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .category-pulse-ring {
            transform-origin: ${centerX}px ${centerY}px;
            animation: pulse-ring 4s ease-in-out infinite;
          }
          .category-pulse-ring-delayed {
            animation-delay: 1.2s;
          }
          .category-glow-center {
            animation: glow-center 3.5s ease-in-out infinite;
          }
          .category-float-node {
            transform-box: fill-box;
            transform-origin: center;
            animation: float-node 4s ease-in-out infinite;
          }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: .22; transform: scale(1); }
          50% { opacity: .42; transform: scale(1.05); }
        }
        @keyframes glow-center {
          0%, 100% { opacity: .45; }
          50% { opacity: .75; }
        }
        @keyframes float-node {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

function RecommendationInsights({
  data,
  discountedProducts,
  catalogProducts,
  activeFilter,
  onFilterChange,
}: {
  data: RecommendationResponse
  discountedProducts: ApiProduct[]
  catalogProducts: ApiProduct[]
  activeFilter: InsightFilter
  onFilterChange: (filter: InsightFilter) => void
}) {
  const insights = useMemo(() => {
    const nodesById = new Map(data.graph.nodes.map((node) => [node.id, node]))
    const catalogProductsById = new Map(catalogProducts.map((product) => [product._id, product]))
    const orders = data.graph.nodes.filter((node) => node.type === "Order")
    const categoryRelations = data.graph.relationships.filter((relationship) => relationship.type === "IN_CATEGORY")
    const containsRelations = data.graph.relationships.filter((relationship) => relationship.type === "CONTAINS")

    const productQuantities = new Map<string, number>()
    const productsByOrder = new Map<string, string[]>()
    const categories = new Map<string, { name: string; products: number }>()

    for (const relationship of categoryRelations) {
      const category = nodesById.get(relationship.to)
      if (category?.type !== "Category") continue

      const current = categories.get(category.id) || { name: category.label, products: 0 }
      current.products += 1
      categories.set(category.id, current)
    }

    for (const relationship of containsRelations) {
      const quantity = relationship.quantity || 1
      productQuantities.set(relationship.to, (productQuantities.get(relationship.to) || 0) + quantity)

      const current = productsByOrder.get(relationship.from) || []
      current.push(relationship.to)
      productsByOrder.set(relationship.from, current)
    }

    const favorites = Array.from(productQuantities.entries())
      .map(([productId, quantity]) => ({
        product: catalogProductsById.get(productId) || productFromGraphNode(nodesById.get(productId)),
        quantity,
      }))
      .filter((item): item is { product: ApiProduct; quantity: number } => Boolean(item.product))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6)

    const bundleCounts = new Map<string, { ids: string[]; count: number }>()
    for (const productIds of productsByOrder.values()) {
      const uniqueIds = Array.from(new Set(productIds))
      for (let i = 0; i < uniqueIds.length; i += 1) {
        for (let j = i + 1; j < uniqueIds.length; j += 1) {
          const pair = [uniqueIds[i], uniqueIds[j]].sort()
          const key = pair.join("|")
          const current = bundleCounts.get(key) || { ids: pair, count: 0 }
          current.count += 1
          bundleCounts.set(key, current)
        }
      }
    }

    const bundles = Array.from(bundleCounts.values())
      .map((bundle) => ({
        products: bundle.ids
          .map((id) => catalogProductsById.get(id) || productFromGraphNode(nodesById.get(id)))
          .filter((product): product is ApiProduct => Boolean(product)),
        count: bundle.count,
      }))
      .filter((bundle) => bundle.products.length === 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const recommendedDeals = discountedProducts.slice(0, 6).map((product) => ({
      product: {
        id: product._id,
        name: product.name,
        image: product.image || "/placeholder.jpg",
        price: product.price,
        discountPercentage: product.discountPercentage || 0,
      },
      reason: `Tiene un ${product.discountPercentage}% de descuento activo.`,
      price: product.price,
    }))

    const topCategories = Array.from(categories.values())
      .sort((a, b) => b.products - a.products)
      .slice(0, 3)
    const allCategoryNames = Array.from(
      new Set(catalogProducts.map((product) => product.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
    const productsByCategory = new Map<string, ApiProduct[]>()
    for (const product of catalogProducts) {
      if (!product.category) continue

      const current = productsByCategory.get(product.category) || []
      current.push(product)
      productsByCategory.set(product.category, current)
    }
    const bestProductForCategory = (categoryName: string) => {
      const categoryProducts = productsByCategory.get(categoryName) || []
      return categoryProducts
        .slice()
        .sort((a, b) => {
          const quantityA = productQuantities.get(a._id) || 0
          const quantityB = productQuantities.get(b._id) || 0
          if (quantityA !== quantityB) return quantityB - quantityA
          return getProductDiscount(b) - getProductDiscount(a)
        })[0]
    }
    const exploredCategoryItems: CategoryMapItem[] = Array.from(categories.values())
      .sort((a, b) => b.products - a.products)
      .map((category) => ({
        id: category.name,
        name: category.name,
        count: category.products,
        kind: "explored" as const,
        product: bestProductForCategory(category.name),
      }))
    const exploredCategoryNames = new Set(exploredCategoryItems.map((category) => category.name))
    const unexploredCategoryItems: CategoryMapItem[] = allCategoryNames
      .filter((categoryName) => !exploredCategoryNames.has(categoryName))
      .map((categoryName) => ({
        id: categoryName,
        name: categoryName,
        count: productsByCategory.get(categoryName)?.length || 0,
        kind: "unexplored" as const,
        product: bestProductForCategory(categoryName),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    const categoryMapItems = [
      ...exploredCategoryItems,
      ...unexploredCategoryItems,
    ].slice(0, 8)
    const affinityFavorites = favorites.length
      ? favorites
      : data.recommendations.slice(0, 2).map((recommendation) => ({
          product: productFromRecommendation(recommendation),
          quantity: 1,
        }))
    const affinityRecommendations = data.recommendations
      .filter(
        (recommendation) =>
          !affinityFavorites.some((favorite) => favorite.product._id === recommendation.product_id)
      )
      .slice(0, 2)
    const favoriteMapItems: FavoriteMapItem[] = [
      ...affinityFavorites
        .filter((favorite) => favorite.quantity > 1)
        .slice(0, 6)
        .map((favorite) => ({
          product: favorite.product,
          quantity: favorite.quantity,
          kind: "repeat" as const,
        })),
      ...affinityRecommendations.slice(0, 3).map((recommendation) => ({
        product: productFromRecommendation(recommendation),
        quantity: 1,
        kind: "suggest" as const,
      })),
    ]
    const fallbackBundles = data.recommendations.slice(0, 3).map((recommendation, index, list) => ({
      products: [
        productFromRecommendation(recommendation),
        list[(index + 1) % list.length]
          ? productFromRecommendation(list[(index + 1) % list.length])
          : null,
      ].filter((product): product is ApiProduct => Boolean(product)),
      count: 1,
    }))
    const displayBundles = bundles.length ? bundles : fallbackBundles
    const bundleMapPairs: BundleMapPair[] = displayBundles
      .filter((bundle): bundle is { products: [ApiProduct, ApiProduct]; count: number } => bundle.products.length === 2)
      .slice(0, 4)
      .map((bundle) => ({
        products: [bundle.products[0], bundle.products[1]],
        count: bundle.count,
      }))
    const pairedProductIds = new Set(bundleMapPairs.flatMap((bundle) => bundle.products.map((product) => product._id)))
    const bundleSuggestions = data.recommendations
      .map(productFromRecommendation)
      .filter((product) => !pairedProductIds.has(product._id))
      .slice(0, 3)

    const affinityNodes: MiniGraphNode[] = [
      {
        id: "me",
        label: data.user.name.split(" ")[0] || "Vos",
        type: "user",
        x: 50,
        y: 50,
      },
      ...affinityFavorites.slice(0, 2).map((favorite, index) => ({
        id: `favorite-${favorite.product._id}`,
        label: favorite.product.name,
        type: "favorite" as const,
        x: index === 0 ? 24 : 25,
        y: index === 0 ? 24 : 76,
        image: favorite.product.image,
        href: `/productos/${favorite.product._id}`,
      })),
      ...topCategories.slice(0, 2).map((category, index) => ({
        id: `category-${category.name}`,
        label: category.name,
        type: "category" as const,
        x: 77,
        y: index === 0 ? 28 : 72,
        href: `/productos?category=${encodeURIComponent(category.name)}`,
      })),
      ...affinityRecommendations.map((recommendation, index) => ({
        id: `recommendation-${recommendation.product_id}`,
        label: recommendation.name,
        type: "recommendation" as const,
        x: index === 0 ? 43 : 62,
        y: 88,
        image: recommendation.image || "/placeholder.jpg",
        href: `/productos/${recommendation.product_id}`,
        })),
    ]

    const affinityLinks: MiniGraphLink[] = affinityNodes
      .filter((node) => node.id !== "me")
      .map((node) => ({
        from: "me",
        to: node.id,
        label:
          node.type === "favorite"
            ? "repite"
            : node.type === "category"
            ? "explora"
            : "sugiere",
      }))

    const bundleProducts = displayBundles
      .slice(0, 2)
      .flatMap((bundle) => bundle.products)
      .filter((product, index, list) => list.findIndex((candidate) => candidate._id === product._id) === index)
      .slice(0, 4)
    const bundleNodes: MiniGraphNode[] = [
      {
        id: "bundle-center",
        label: "Pack ideal",
        type: "bundle",
        x: 50,
        y: 50,
      },
      ...bundleProducts.map((product, index) => ({
        id: `bundle-${product._id}`,
        label: product.name,
        type: "favorite" as const,
        x: [25, 75, 28, 72][index] || 50,
        y: [28, 28, 76, 76][index] || 50,
        image: product.image,
        href: `/productos/${product._id}`,
      })),
    ]
    const bundleLinks: MiniGraphLink[] = bundleNodes
      .filter((node) => node.id !== "bundle-center")
      .map((node) => ({
        from: "bundle-center",
        to: node.id,
        label: "combina",
      }))

    const dealNodes: MiniGraphNode[] = [
      {
        id: "deal-center",
        label: "Beneficio",
        type: "deal",
        x: 50,
        y: 50,
      },
      ...recommendedDeals.slice(0, 3).map((deal, index) => ({
        id: `deal-${deal.product.id}`,
        label: deal.product.name,
        type: "recommendation" as const,
        x: [24, 76, 50][index] || 50,
        y: [30, 30, 82][index] || 50,
        image: deal.product.image,
        href: `/productos/${deal.product.id}`,
      })),
    ]
    const dealLinks: MiniGraphLink[] = dealNodes
      .filter((node) => node.id !== "deal-center")
      .map((node) => ({
        from: "deal-center",
        to: node.id,
        label: "promo",
      }))

    const categoryNodes: MiniGraphNode[] = [
      {
        id: "category-center",
        label: "Categorías",
        type: "category",
        x: 50,
        y: 50,
      },
      ...topCategories.map((category, index) => ({
        id: `category-node-${category.name}`,
        label: category.name,
        type: "category" as const,
        x: [22, 78, 50][index] || 50,
        y: [30, 30, 82][index] || 50,
        href: `/productos?category=${encodeURIComponent(category.name)}`,
      })),
      ...data.recommendations.slice(0, 2).map((recommendation, index) => ({
        id: `category-rec-${recommendation.product_id}`,
        label: recommendation.name,
        type: "recommendation" as const,
        x: index === 0 ? 29 : 71,
        y: 76,
        image: recommendation.image || "/placeholder.jpg",
        href: `/productos/${recommendation.product_id}`,
      })),
    ]
    const categoryLinks: MiniGraphLink[] = categoryNodes
      .filter((node) => node.id !== "category-center")
      .map((node) => ({
        from: "category-center",
        to: node.id,
        label: node.type === "category" ? "agrupa" : "sugiere",
      }))

    const graphByFilter = {
      favorites: {
        title: "Mapa de favoritos",
        description: "Productos que mas se repiten y sugerencias cercanas para recompra.",
        Icon: Heart,
        nodes: affinityNodes,
        links: affinityLinks,
        metrics: [
          { value: affinityFavorites.length, label: "favoritos" },
          { value: Math.max(...affinityFavorites.map((item) => item.quantity), 1), label: "max repeticiones" },
          { value: affinityRecommendations.length, label: "sugerencias" },
        ],
      },
      bundles: {
        title: "Mapa de compras juntas",
        description: "Productos conectados por pedidos previos o combinaciones utiles para armar packs.",
        Icon: Layers3,
        nodes: bundleNodes,
        links: bundleLinks,
        metrics: [
          { value: displayBundles.length, label: "packs posibles" },
          { value: bundleProducts.length, label: "productos" },
          { value: displayBundles.reduce((sum, bundle) => sum + bundle.count, 0), label: "coincidencias" },
        ],
      },
      deals: {
        title: "Mapa de beneficios",
        description: "Productos con descuentos activos cargados desde el panel de administración.",
        Icon: BadgePercent,
        nodes: dealNodes,
        links: dealLinks,
        metrics: [
          { value: recommendedDeals.length, label: "ofertas activas" },
          { value: Math.max(...recommendedDeals.map((deal) => getProductDiscount(deal.product)), 0), label: "mayor descuento" },
          { value: recommendedDeals.filter((deal) => getProductDiscount(deal.product) >= 30).length, label: "ofertas fuertes" },
        ],
      },
      categories: {
        title: "Mapa de categorías",
        description: "Categorías donde se concentra tu historial y productos para seguir explorando.",
        Icon: Tags,
        nodes: categoryNodes,
        links: categoryLinks,
        metrics: [
          { value: topCategories.length, label: "categorías foco" },
          { value: data.stats.categories, label: "compradas" },
          { value: data.stats.purchasedProducts, label: "productos" },
        ],
      },
    } satisfies Record<
      InsightFilter,
      {
        title: string
        description: string
        Icon: typeof Heart
        nodes: MiniGraphNode[]
        links: MiniGraphLink[]
        metrics: { value: number; label: string }[]
      }
    >

    return {
      favorites,
      favoriteMapItems,
      bundles,
      displayBundles,
      bundleMapPairs,
      bundleSuggestions,
      recommendedDeals,
      categoryMapItems,
      categories: Array.from(categories.values()).sort((a, b) => b.products - a.products),
      graphByFilter,
      orderCount: orders.length,
    }
  }, [data, discountedProducts, catalogProducts])

  const hasFavorites = insights.favorites.length > 0
  const hasBundles = insights.bundles.length > 0
  const showFallbackRecommendations = !hasFavorites && !hasBundles
  const favoriteCards = hasFavorites
    ? insights.favorites
    : data.recommendations.slice(0, 3).map((recommendation) => ({
        product: {
          _id: recommendation.product_id,
          id: recommendation.product_id,
          name: recommendation.name,
          description: "",
          price: recommendation.price,
          discountPercentage: recommendation.discountPercentage || 0,
          quantity: 0,
          category: recommendation.category,
          image: recommendation.image || "/placeholder.jpg",
        },
        quantity: 1,
      }))
  const currentGraph = insights.graphByFilter[activeFilter]
  const CurrentGraphIcon = currentGraph.Icon

  return (
    <section className="border-y border-border bg-secondary/30 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              <ListFilter className="h-4 w-4" />
              Explorador personalizado
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
              Encontrá oportunidades según tu historial
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Elegí qué querés revisar y te mostramos señales concretas: productos que repetís, combinaciones posibles y categorías para seguir explorando.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {insightFilters.map((filter) => {
            const Icon = filter.icon
            const isActive = activeFilter === filter.id

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {activeFilter === "favorites" ? (
            <FavoriteMap
              userName={data.user.name}
              items={insights.favoriteMapItems}
            />
          ) : activeFilter === "bundles" ? (
            <BundleMap
              pairs={insights.bundleMapPairs}
              suggestions={insights.bundleSuggestions}
            />
          ) : activeFilter === "deals" ? (
            <BenefitMap products={discountedProducts.slice(0, 8)} />
          ) : activeFilter === "categories" ? (
            <CategoryMap items={insights.categoryMapItems} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    {currentGraph.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {currentGraph.description}
                  </p>
                </div>
                <CurrentGraphIcon className="h-8 w-8 text-primary" />
              </div>

              <MiniAffinityGraph
                nodes={currentGraph.nodes}
                links={currentGraph.links}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {currentGraph.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-border bg-background px-3 py-2">
                    <p className="text-lg font-bold text-foreground">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>

              {showFallbackRecommendations && (
                <p className="mt-5 rounded-lg bg-primary/10 p-4 text-sm text-primary">
                  Todavía falta historial para detectar favoritos claros. Mientras tanto, te mostramos productos cercanos a tus primeras compras.
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            {activeFilter === "favorites" && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Tus productos recurrentes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Si repetís un producto, conviene destacarlo para recompra rápida o futura suscripción.
                </p>

                <div className="mt-5 space-y-3">
                  {favoriteCards.map((item, index) => {
                    return (
                      <Link key={item.product._id} href={`/productos/${item.product._id}`} className="flex items-center gap-4 rounded-lg border border-border bg-background p-3 hover:bg-secondary">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.quantity > 1 ? `Aparece ${item.quantity} veces en tu historial.` : "Buena opción para seguir explorando."}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                          #{index + 1}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {activeFilter === "bundles" && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Compras que pueden ir juntas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detectamos combinaciones desde pedidos previos para pensar bundles o sugerencias complementarias.
                </p>

                <div className="mt-5 space-y-3">
                  {insights.displayBundles.map((bundle, index) => (
                    <div key={`${bundle.products.map((product) => product._id).join("-")}-${index}`} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex items-center gap-3">
                        {bundle.products.map((product) => (
                          <Link key={product._id} href={`/productos/${product._id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                              <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
                            </div>
                            <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">{product.name}</p>
                          </Link>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Ideal para mostrar como “también va bien con esto” o armar un pack con beneficio.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFilter === "deals" && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Productos con descuento</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ofertas activas cargadas desde el panel de administración.
                </p>

                {insights.recommendedDeals.length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {insights.recommendedDeals.map((deal) => (
                      <Link key={deal.product.id} href={`/productos/${deal.product.id}`} className="rounded-lg border border-border bg-background p-3 hover:bg-secondary">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                          <Image src={deal.product.image} alt={deal.product.name} fill className="object-cover" />
                          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
                            -{getProductDiscount(deal.product)}%
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground">{deal.product.name}</p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <p className="text-sm font-bold text-primary">
                            {formatPrice(getProductFinalPrice(deal.product))}
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(deal.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border border-dashed border-border bg-background p-6 text-center">
                    <BadgePercent className="mx-auto h-9 w-9 text-muted-foreground" />
                    <p className="mt-3 font-medium text-foreground">No hay descuentos activos</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cuando cargues descuentos desde el panel admin, van a aparecer acá.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeFilter === "categories" && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Categorías para ordenar mejor</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Te muestra dónde se concentra tu historial y qué categorías conviene destacar.
                </p>

                <div className="mt-5 space-y-3">
                  {(insights.categories.length ? insights.categories : [{ name: "Productos materos", products: data.stats.purchasedProducts }]).map((category) => (
                    <Link key={category.name} href={`/productos?category=${encodeURIComponent(category.name)}`} className="block rounded-lg border border-border bg-background p-4 hover:bg-secondary">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{category.products} productos relacionados</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function RecomendacionesPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()
  const [data, setData] = useState<RecommendationResponse | null>(null)
  const [discountedProducts, setDiscountedProducts] = useState<ApiProduct[]>([])
  const [catalogProducts, setCatalogProducts] = useState<ApiProduct[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeInsightFilter, setActiveInsightFilter] = useState<InsightFilter>("favorites")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!token) return

    Promise.all([
      fetchRecommendations(token, 8),
      fetchProducts(1, 100).catch(() => ({ products: [] })),
    ])
      .then(([response, productsData]) => {
        const benefitProducts = response.benefits?.length
          ? response.benefits
          : productsData.products.filter((product) => isProductDiscounted(product))

        setData(response)
        setCatalogProducts(productsData.products)
        setDiscountedProducts(
          benefitProducts
            .filter((product) => isProductDiscounted(product))
            .sort((a, b) => getProductDiscount(b) - getProductDiscount(a))
        )
        setErrorMessage(null)
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage("No pudimos cargar recomendaciones. Revisá que el backend esté reiniciado y disponible.")
      })
      .finally(() => setIsLoadingRecommendations(false))
  }, [token])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Motor de recomendaciones
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
                  Recomendado para vos
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                  Sugerencias construidas desde tu historial de compras y productos relacionados por usuarios, pedidos y categorías.
                </p>
              </div>

              {data && (
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-foreground">{data.stats.purchasedProducts}</p>
                    <p className="text-xs text-muted-foreground">productos</p>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-foreground">{data.stats.categories}</p>
                    <p className="text-xs text-muted-foreground">categorías</p>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-foreground">{data.stats.recommendations}</p>
                    <p className="text-xs text-muted-foreground">sugerencias</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4">
            {isLoadingRecommendations ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  Recomendaciones no disponibles
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            ) : data && data.recommendations.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data.recommendations.map((item) => (
                  <RecommendationCard key={item.product_id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  Todavía no hay suficiente historial
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Cuando hagas tus primeras compras vamos a poder encontrar productos cercanos a tus gustos.
                </p>
                <Link
                  href="/productos"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Ver productos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <MateKitBuilder />

        {data && (
          <RecommendationInsights
            data={data}
            discountedProducts={discountedProducts}
            catalogProducts={catalogProducts}
            activeFilter={activeInsightFilter}
            onFilterChange={setActiveInsightFilter}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
