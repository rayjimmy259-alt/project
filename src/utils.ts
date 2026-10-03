import type { Product } from "./types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatPrice(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function extractNumber(value: string): number | null {
  const cleaned = value.replace(/,/g, "").replace(/[,]/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return isNaN(num) ? null : num;
}

export function getMinOfferPrice(offers: { price: number }[]): number {
  const validPrices = offers
    .map((offer) => offer.price)
    .filter((price) => Number.isFinite(price) && price > 0);
  return validPrices.length ? Math.min(...validPrices) : 0;
}

export function getProductStartingPrice(
  product: Pick<Product, "price" | "offers">
): number {
  const availablePrices = product.offers
    .filter((offer) => offer.inStock)
    .map((offer) => offer.price)
    .filter((price) => Number.isFinite(price) && price > 0);
  if (availablePrices.length) return Math.min(...availablePrices);

  const listedPrice = getMinOfferPrice(product.offers);
  if (listedPrice > 0) return listedPrice;
  return Number.isFinite(product.price) && product.price > 0 ? product.price : 0;
}
