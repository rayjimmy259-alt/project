import { Link } from "react-router-dom";
import { ArrowUpRight, Headphones, Laptop, Smartphone } from "lucide-react";
import { useRelatedProducts } from "../lib/useRelatedProducts";
import { formatPrice, getProductStartingPrice } from "../utils";
import { withAffiliateTracking } from "../utils/affiliate";

interface RelatedProductsListProps {
  articleId: string;
}

function getCategoryIcon(category: string) {
  if (category === "audio") return Headphones;
  if (category === "laptops") return Laptop;
  return Smartphone;
}

function getAffiliateOffer(product: ReturnType<typeof useRelatedProducts>[number]) {
  return [...product.offers]
    .filter((offer) => Number.isFinite(offer.price) && offer.price > 0 && /^https?:\/\//i.test(offer.url))
    .sort((a, b) => a.price - b.price)[0];
}

export function RelatedProductsList({ articleId }: RelatedProductsListProps) {
  const products = useRelatedProducts(articleId);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-500/15 via-ink-900 to-accent-500/10 p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
            Recomendaciones para ti
          </p>
          <h2 className="mt-1 text-2xl font-bold text-ink-50 sm:text-3xl">Completa tu Setup</h2>
          <p className="mt-2 text-sm text-ink-300">
            Descubre dispositivos que combinan con tu producto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const Icon = getCategoryIcon(product.category);
            const affiliateOffer = getAffiliateOffer(product);
            const affiliateUrl = affiliateOffer
              ? withAffiliateTracking(affiliateOffer.url, affiliateOffer.store)
              : undefined;

            return (
              <article
                key={product.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-700/80 bg-ink-950/70"
              >
                <Link to={`/producto/${product.slug}`} className="group block">
                  <div className="flex aspect-[4/3] items-center justify-center bg-ink-850 p-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Icon aria-hidden="true" className="h-12 w-12 text-ink-500" />
                    )}
                  </div>
                  <div className="p-4 pb-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-300">
                      {product.brand}
                    </p>
                    <h3 className="mt-1 min-h-10 text-sm font-semibold text-ink-100 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                </Link>

                <div className="mt-auto px-4 pb-4">
                  <p className="mb-3 text-lg font-bold text-ink-50">
                    Desde {formatPrice(getProductStartingPrice(product))}
                  </p>
                  {affiliateUrl ? (
                    <a
                      href={affiliateUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                    >
                      Ver oferta
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      to={`/producto/${product.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-ink-700 px-3 py-2.5 text-sm font-semibold text-ink-200 transition-colors hover:border-primary-400 hover:text-white"
                    >
                      Ver producto
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
