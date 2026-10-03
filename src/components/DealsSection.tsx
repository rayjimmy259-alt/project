import { Link } from "react-router-dom";
import type { Product } from "../types";
import { MAX_COMPARE } from "../constants";

interface DealsSectionProps {
  products: Product[];
  onToggleCompare: (id: string) => void;
  compareIds: Set<string>;
}

export function DealsSection({ products, onToggleCompare, compareIds }: DealsSectionProps) {
  const deals = products.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 4);
  if (deals.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink-50">Ofertas destacadas</h2>
          <p className="mt-1 text-sm text-ink-400">
            Precios referenciales; confirma el valor y la disponibilidad en la tienda
          </p>
        </div>
        <span className="badge bg-accent-500/15 text-accent-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
          </span>
          En oferta ahora
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {deals.map((deal) => {
          const discount = Math.round(((deal.oldPrice! - deal.price) / deal.oldPrice!) * 100);
          const isSelected = compareIds.has(deal.id);
          return (
            <Link
              key={deal.id}
              to={`/producto/${deal.slug}`}
              className="card group overflow-hidden hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/5"
            >
              <div className="relative aspect-square overflow-hidden bg-ink-850">
                <img
                  src={deal.image}
                  alt={deal.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 badge bg-accent-500 text-white font-bold">-{discount}%</span>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-xs text-ink-400">{deal.brand}</p>
                <h3 className="mt-1 text-sm font-medium text-ink-100 line-clamp-2 min-h-[2.5rem]">{deal.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-accent-400">${deal.price.toLocaleString()}</span>
                  <span className="text-xs text-ink-500 line-through">${deal.oldPrice!.toLocaleString()}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleCompare(deal.id);
                  }}
                  disabled={compareIds.size >= MAX_COMPARE && !isSelected}
                  aria-pressed={isSelected}
                  className={`mt-3 w-full rounded-lg py-2 text-xs font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "bg-primary-500 text-white hover:bg-primary-600"
                      : "border border-ink-700 text-ink-200 hover:border-primary-500 hover:text-primary-400"
                  }`}
                >
                  {isSelected ? "En comparación" : "Comparar"}
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
