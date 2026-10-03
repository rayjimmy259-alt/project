const amazonAssociateTag = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG?.trim();
const mercadoLibreAffiliateId = import.meta.env.VITE_ML_AFFILIATE_ID?.trim();
const mercadoLibreAffiliateParam =
  import.meta.env.VITE_ML_AFFILIATE_PARAM?.trim() || "matt_tool";

function isAmazon(store: string, hostname: string): boolean {
  return /amazon/i.test(store) || /(^|\.)amazon\./i.test(hostname);
}

function isMercadoLibre(store: string, hostname: string): boolean {
  return /mercado\s*libre/i.test(store) || /(^|\.)mercadolibre\./i.test(hostname);
}

export function withAffiliateTracking(url: string, store: string): string {
  try {
    const destination = new URL(url);
    if (destination.protocol !== "http:" && destination.protocol !== "https:") {
      return url;
    }

    if (isAmazon(store, destination.hostname) && amazonAssociateTag) {
      destination.searchParams.set("tag", amazonAssociateTag);
    } else if (
      isMercadoLibre(store, destination.hostname) &&
      mercadoLibreAffiliateId &&
      /^[a-zA-Z0-9_-]+$/.test(mercadoLibreAffiliateParam)
    ) {
      destination.searchParams.set(
        mercadoLibreAffiliateParam,
        mercadoLibreAffiliateId,
      );
    }

    return destination.toString();
  } catch {
    return url;
  }
}
