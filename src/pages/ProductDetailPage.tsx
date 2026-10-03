import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProducts } from "../lib/ProductsContext";
import { StoreOfferCard } from "../components/StoreOfferCard";
import { RelatedProductsList } from "../components/RelatedProductsList";
import { formatPrice } from "../utils";
import { withAffiliateTracking } from "../utils/affiliate";
import { ProductReviews } from "../components/ProductReviews";

interface ProductDetailPageProps {
  compareIds: Set<string>;
  onToggleCompare: (id: string) => void;
  onSearch: (query: string) => void;
}

const specGroups: Record<string, string[]> = {
  "Rendimiento": ["Procesador", "RAM", "Gráfica", "CPU", "GPU"],
  "Almacenamiento": ["Almacenamiento"],
  "Pantalla": ["Pantalla", "Resolución"],
  "Batería": ["Batería", "Autonomía"],
  "Cámara": ["Cámara", "Sensores"],
  "Conectividad": ["Conectividad", "Resistencia", "Tipo", "Cancelación de ruido", "Carga rápida", "Peso", "Video", "Estabilización", "ISO", "Autofocus", "Vuelo", "Transmisión", "Lector"],
};

function getSpecGroup(label: string): string {
  for (const [group, labels] of Object.entries(specGroups)) {
    if (labels.some((l) => label.toLowerCase().includes(l.toLowerCase()))) {
      return group;
    }
  }
  return "Otros";
}

export function ProductDetailPage({ compareIds, onToggleCompare, onSearch }: ProductDetailPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState(0);

  const product = useMemo(() => products.find((item) => item.slug === slug), [products, slug]);

  if (!product) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-ink-800">
            <svg className="h-8 w-8 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-50">Producto no encontrado</h1>
          <p className="mt-2 text-sm text-ink-400">El producto que buscas no existe o ya no está disponible.</p>
          <button onClick={() => navigate("/")} className="mt-6 btn-primary">
            Volver al catálogo
          </button>
        </div>
      </main>
    );
  }

  const sortedOffers = product.offers
    .filter((offer) => Number.isFinite(offer.price) && offer.price > 0)
    .sort((a, b) => a.price - b.price);
  const bestPrice = sortedOffers[0]?.price ?? product.price;
  const maxPrice = sortedOffers.length
    ? Math.max(...sortedOffers.map((offer) => offer.price))
    : product.price;
  const priceRange = `${formatPrice(bestPrice)} – ${formatPrice(maxPrice)}`;

  const groupedSpecs = useMemo(() => {
    const groups: Record<string, { label: string; value: string }[]> = {};
    for (const spec of product.specs) {
      const group = getSpecGroup(spec.label);
      if (!groups[group]) groups[group] = [];
      groups[group].push(spec);
    }
    return groups;
  }, [product.specs]);

  const groupNames = Object.keys(groupedSpecs);
  const isComparing = compareIds.has(product.id);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-ink-400">
          <Link to="/" className="hover:text-primary-400 transition-colors">Inicio</Link>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span
            className="cursor-pointer hover:text-primary-400 transition-colors capitalize"
            onClick={() => {
              onSearch(product.category);
              navigate("/");
            }}
          >
            {product.category}
          </span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-ink-200 truncate">{product.name}</span>
        </nav>

        {/* Header section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="relative aspect-square bg-ink-850">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-400">
                  Imagen no disponible
                </div>
              )}
              {product.badge && (
                <span className="absolute left-4 top-4 badge bg-accent-500 text-white">{product.badge}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <span className="text-sm font-medium uppercase tracking-wide text-primary-400">{product.brand}</span>
            <h1 className="mt-1 text-3xl font-bold text-ink-50 sm:text-4xl">{product.name}</h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(product.rating) ? "text-warning-400" : "text-ink-700"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-ink-100">{product.rating}</span>
              <span className="text-sm text-ink-400">({product.reviews.toLocaleString()} reseñas)</span>
            </div>

            {/* Price range */}
            <div className="mt-6 rounded-xl border border-ink-700 bg-ink-850 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-400">Rango de precios</p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-ink-50">{formatPrice(bestPrice)}</span>
                <span className="text-sm text-ink-400">a {formatPrice(maxPrice)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Comparado entre {sortedOffers.length} tiendas · Precios y disponibilidad sujetos a cambios
              </p>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-ink-300">{product.description}</p>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => onToggleCompare(product.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                  isComparing
                    ? "bg-primary-500 text-white hover:bg-primary-600"
                    : "border border-ink-700 text-ink-200 hover:border-primary-500 hover:text-primary-400"
                }`}
              >
                {isComparing ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    En comparación
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir a comparación
                  </>
                )}
              </button>
              {sortedOffers[0] && /^https?:\/\//i.test(sortedOffers[0].url) && (
                <a
                  href={withAffiliateTracking(
                    sortedOffers[0].url,
                    sortedOffers[0].store,
                  )}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25 active:scale-95"
                >
                  Ver mejor oferta
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Store offers section */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink-50">Ofertas por tienda</h2>
              <p className="mt-1 text-sm text-ink-400">
                Compara precios entre {sortedOffers.length} tiendas · Precios sujetos a cambios
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sortedOffers.length ? (
              sortedOffers.map((offer, idx) => (
                <StoreOfferCard key={`${offer.store}-${idx}`} offer={offer} isBest={idx === 0} />
              ))
            ) : (
              <div className="card px-5 py-8 text-center text-sm text-ink-400">
                No hay ofertas disponibles para este producto por el momento.
              </div>
            )}
          </div>
        </section>

        <ProductReviews key={product.id} productId={product.id} />

        {/* Specs section */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-ink-50">Ficha técnica</h2>

          {groupNames.length ? (
            <>
              <div className="mb-6 flex flex-wrap gap-2 border-b border-ink-800 pb-3">
                {groupNames.map((name, idx) => (
                  <button
                    key={name}
                    onClick={() => setActiveTab(idx)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === idx
                        ? "bg-primary-500 text-white"
                        : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="card overflow-hidden animate-fade-in">
                <table className="w-full">
                  <tbody>
                    {groupedSpecs[groupNames[activeTab]]?.map((spec, idx) => (
                      <tr
                        key={spec.label}
                        className={idx % 2 === 0 ? "bg-ink-900/40" : "bg-ink-850/40"}
                      >
                        <td className="w-1/3 px-4 py-3 text-sm font-medium text-ink-300 sm:w-1/4 sm:px-6">
                          {spec.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink-100 sm:px-6">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="card px-5 py-8 text-center text-sm text-ink-400">
              Las especificaciones técnicas aún no están disponibles.
            </div>
          )}
        </section>
      </div>

      <RelatedProductsList articleId={product.id} />
    </main>
  );
}
