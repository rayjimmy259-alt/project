import { Link } from "react-router-dom";
import type { Product } from "../types";
import { getProductStartingPrice } from "../utils";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  isDisabled: boolean;
  showOffersAction?: boolean;
  showFromPrice?: boolean;
}

export function ProductCard({
  product,
  isSelected,
  onToggleCompare,
  isDisabled,
  showOffersAction = false,
  showFromPrice = false,
}: ProductCardProps) {
  const pricedOffers = product.offers
    .filter((offer) => Number.isFinite(offer.price) && offer.price > 0)
    .sort((a, b) => a.price - b.price);
  const startingPrice = getProductStartingPrice(product);
  const lowestOffer = pricedOffers.find((offer) => offer.inStock) ?? pricedOffers[0];
  const displayPrice = startingPrice || product.price;
  const discount = product.oldPrice && displayPrice > 0
    ? Math.round(((product.oldPrice - displayPrice) / product.oldPrice) * 100)
    : 0;
  const featuredBadge = product.badge ??
    (product.rating >= 4.8 ? "Mejor calidad/precio" : product.rating >= 4.7 ? "Recomendado" : undefined);
  const qualityPriceScore = Math.max(
    0,
    Math.min(10, product.qualityPriceScore ?? (product.rating > 0 ? product.rating * 2 : 7.5))
  );
  const sortedOffers = pricedOffers.slice(0, 3);

  return (
    <div
      className={`card group flex h-full flex-col overflow-hidden border-ink-800 bg-ink-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-600 hover:shadow-xl hover:shadow-black/20 ${
        isSelected ? "border-primary-500 ring-2 ring-primary-500/20" : ""
      }`}
    >
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 p-5">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm font-medium text-slate-500">
              Imagen no disponible
            </div>
          )}
          <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
            {featuredBadge ?? "Recomendado"}
          </span>
          <span className="absolute bottom-3 left-3 rounded-full border border-violet-200 bg-violet-100/95 px-2.5 py-1 text-[11px] font-bold text-violet-800 shadow-sm">
            KiScore {qualityPriceScore.toFixed(1)}/10
          </span>
          {discount > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/45">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">Agotado</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-bold uppercase tracking-[0.12em] text-primary-400">{product.brand}</span>
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-ink-200">{product.rating}</span>
            <span className="text-xs text-ink-500">({product.reviews.toLocaleString()})</span>
          </div>
        </div>

        <Link to={`/producto/${product.slug}`}>
          <h3 className="mb-3 min-h-[2.75rem] text-[15px] font-bold leading-snug text-ink-50 line-clamp-2 transition-colors hover:text-primary-400">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <span className="block text-xs text-ink-400">{showFromPrice ? "Desde" : "Precio"}</span>
            <span className="text-2xl font-extrabold tracking-tight text-ink-50">
              {displayPrice > 0 ? `$${displayPrice.toLocaleString()}` : "Consultar"}
            </span>
          </div>
          {product.oldPrice && displayPrice > 0 && displayPrice < product.oldPrice && (
            <span className="pb-1 text-xs text-ink-500 line-through">${product.oldPrice.toLocaleString()}</span>
          )}
        </div>

        {showOffersAction ? (
          <div className="mb-4 rounded-lg border border-ink-800 bg-ink-950/60 p-2.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Mejores ofertas · {pricedOffers.length} tiendas
            </p>
            <div className="space-y-1.5">
              {sortedOffers.map((offer) => (
                <div key={offer.store} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-ink-300">{offer.store}</span>
                  <span className="shrink-0 font-semibold text-ink-100">${offer.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-ink-400">Tienda:</span>
            <span className="text-xs font-medium text-ink-200">{lowestOffer?.store ?? product.store}</span>
          </div>
        )}

        <div className={`mt-auto ${showOffersAction ? "space-y-2" : ""}`}>
          {showOffersAction && (
            <Link
              to={`/producto/${product.slug}`}
              className="btn-primary w-full px-2 py-2.5 text-sm shadow-lg shadow-primary-500/15"
            >
              Ver ofertas
            </Link>
          )}
          <button
            onClick={() => onToggleCompare(product.id)}
            disabled={isDisabled && !isSelected}
            aria-pressed={isSelected}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-95 ${
              isSelected
                ? "border border-primary-500/50 bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
                : isDisabled
                ? "cursor-not-allowed border border-ink-700 text-ink-500"
                : "border border-ink-700 text-ink-300 hover:border-primary-500 hover:text-primary-300"
            }`}
          >
            {isSelected ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {showOffersAction ? "Añadido a comparar" : "En comparación"}
              </span>
            ) : isDisabled ? (
              "Máximo alcanzado"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {showOffersAction ? "Añadir a comparar" : "Comparar"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
