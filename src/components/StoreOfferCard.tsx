import type { StoreOffer } from "../types";
import { withAffiliateTracking } from "../utils/affiliate";

interface StoreLogoProps {
  store: string;
  logo: string;
  size?: number;
}

const storeColors: Record<string, { bg: string; text: string; label: string }> = {
  amazon: { bg: "#FF9900", text: "#232F3E", label: "a" },
  ml: { bg: "#FFE600", text: "#2D3277", label: "ML" },
  ebay: { bg: "#E53238", text: "#FFFFFF", label: "e" },
  aliexpress: { bg: "#FF4747", text: "#FFFFFF", label: "A" },
};

export function StoreLogo({ store, logo, size = 40 }: StoreLogoProps) {
  const colors = storeColors[logo] || { bg: "#3a4a66", text: "#fff", label: store.charAt(0) };

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: size * 0.4,
      }}
    >
      {colors.label}
    </div>
  );
}

interface StoreOfferCardProps {
  offer: StoreOffer;
  isBest: boolean;
}

export function StoreOfferCard({ offer, isBest }: StoreOfferCardProps) {
  const discount = offer.oldPrice
    ? Math.round(((offer.oldPrice - offer.price) / offer.oldPrice) * 100)
    : 0;
  const hasAffiliateUrl = /^https?:\/\//i.test(offer.url);
  const affiliateUrl = withAffiliateTracking(offer.url, offer.store);

  return (
    <div
      className={`card flex flex-col gap-3 p-4 transition-all hover:border-ink-600 sm:flex-row sm:items-center sm:justify-between ${
        isBest ? "border-success-500/50 ring-1 ring-success-500/20" : ""
      }`}
    >
      <div className="flex items-center gap-3 sm:w-48">
        <StoreLogo store={offer.store} logo={offer.logo} />
        <div>
          <p className="text-sm font-semibold text-ink-100">{offer.store}</p>
          {isBest && (
            <span className="badge bg-success-500/15 text-success-400 mt-0.5">Mejor precio</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-1">
        {offer.inStock ? (
          <span className="badge bg-success-500/15 text-success-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            En stock
          </span>
        ) : (
          <span className="badge bg-error-500/15 text-error-400">Agotado</span>
        )}
        {offer.freeShipping && (
          <span className="badge bg-primary-500/15 text-primary-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M9 12h6" />
            </svg>
            Envío gratis
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-lg font-bold ${isBest ? "text-success-400" : "text-ink-50"}`}>
              ${offer.price.toLocaleString()}
            </span>
            {offer.oldPrice && (
              <span className="text-xs text-ink-500 line-through">${offer.oldPrice.toLocaleString()}</span>
            )}
          </div>
          {discount > 0 && (
            <span className="text-xs text-success-400">-{discount}%</span>
          )}
        </div>
        {hasAffiliateUrl ? (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
              isBest
                ? "bg-success-500 text-ink-950 hover:bg-success-400"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            Ver oferta
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center rounded-lg bg-ink-800 px-4 py-2.5 text-sm font-medium text-ink-500">
            Oferta no disponible
          </span>
        )}
      </div>
    </div>
  );
}
