import { useRef } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatPrice } from "../utils";

interface SimilarProductsCarouselProps {
  products: Product[];
}

export function SimilarProductsCarousel({ products }: SimilarProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink-50">Productos similares</h2>
          <p className="mt-1 text-sm text-ink-400">Gadgets de la misma categoría y rango de precio</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            className="rounded-lg border border-ink-700 p-2 text-ink-300 transition-colors hover:border-ink-600 hover:bg-ink-800 hover:text-ink-100"
            aria-label="Anterior"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-lg border border-ink-700 p-2 text-ink-300 transition-colors hover:border-ink-600 hover:bg-ink-800 hover:text-ink-100"
            aria-label="Siguiente"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {products.map((product) => {
          const discount = product.oldPrice
            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
            : 0;
          return (
            <Link
              key={product.id}
              to={`/producto/${product.slug}`}
              className="card group w-64 shrink-0 overflow-hidden transition-all hover:border-ink-600 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-ink-850">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {discount > 0 && (
                  <span className="absolute right-2 top-2 badge bg-success-500 text-ink-950 font-bold">
                    -{discount}%
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-ink-400">{product.brand}</p>
                <h3 className="mt-1 text-sm font-medium text-ink-100 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-ink-300">{product.rating}</span>
                  <span className="text-xs text-ink-500">({product.reviews.toLocaleString()})</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-ink-50">{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-xs text-ink-500 line-through">{formatPrice(product.oldPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
