import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Product, StoreOffer } from "../types";
import { products as mockProducts } from "../data/products";
import { isSupabaseConfigured, supabase } from "./supabase";

interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  notice: string | null;
  reload: () => void;
}

type DataRow = Record<string, unknown>;

const ProductsContext = createContext<ProductsContextValue | null>(null);

function isDataRow(value: unknown): value is DataRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValue(row: DataRow, camelCase: string, snakeCase?: string): unknown {
  return row[camelCase] ?? (snakeCase ? row[snakeCase] : undefined);
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeId(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return safeString(value, fallback);
}

function parseBrand(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const brand = parseBrand(item);
      if (brand !== "Generico") return brand;
    }
  }
  if (isDataRow(value)) {
    for (const candidate of [value.name, value.brand_name, value.label]) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    if (value.brand !== value) return parseBrand(value.brand);
  }
  return "Generico";
}

function safeNumber(value: unknown, fallback = 0): number {
  if (value == null || (typeof value === "string" && !value.trim())) return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && (value === 0 || value === 1)) return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "t", "1", "yes", "si", "sí"].includes(normalized)) return true;
    if (["false", "f", "0", "no"].includes(normalized)) return false;
  }
  return fallback;
}

function optionalNumber(value: unknown): number | undefined {
  return value == null ? undefined : safeNumber(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseSpecs(value: unknown): Product["specs"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((spec) => {
    if (!isDataRow(spec)) return [];
    const label = safeString(
      getValue(spec, "label", "name") ??
        getValue(spec, "spec_name", "key") ??
        spec.spec_key,
      ""
    );
    const specValue = safeString(getValue(spec, "value", "spec_value"), "");
    return label && specValue ? [{ label, value: specValue }] : [];
  });
}

function parseGallery(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  return value.filter((image): image is string => typeof image === "string" && image.trim().length > 0);
}

function parseOffers(value: unknown): StoreOffer[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((offer) => {
    if (!isDataRow(offer)) return [];
    const nestedStore = isDataRow(offer.store) ? offer.store : undefined;
    const store = safeString(
      nestedStore?.name ?? offer.store,
      "Tienda"
    );
    const inStock = safeBoolean(getValue(offer, "inStock", "in_stock"), true);
    const freeShippingValue = getValue(offer, "freeShipping", "free_shipping");
    const urlValue = optionalString(getValue(offer, "url", "affiliate_url"));
    const logoValue = optionalString(offer.logo) ?? optionalString(nestedStore?.logo_url);

    return {
      store,
      logo: logoValue ?? store.toLowerCase().replace(/\s+/g, "-"),
      price: safeNumber(offer.price),
      oldPrice: optionalNumber(getValue(offer, "oldPrice", "old_price")),
      inStock,
      freeShipping: safeBoolean(freeShippingValue, false),
      url: urlValue ?? "#",
    };
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseProduct(value: unknown, index: number): Product {
  if (!isDataRow(value)) {
    return {
      id: `supabase-${index}`,
      slug: `producto-${index + 1}`,
      name: `Producto ${index + 1}`,
      brand: "Generico",
      category: "otros",
      image: "",
      price: 0,
      rating: 0,
      reviews: 0,
      specs: [],
      store: "Tienda",
      inStock: true,
      description: "Producto tecnológico.",
      offers: [],
    };
  }

  const name = safeString(value.name, `Producto ${index + 1}`);
  const brand = parseBrand(value.brand);
  const categoryRelation = isDataRow(value.category) ? value.category : undefined;
  const category = safeString(
    categoryRelation?.slug ?? categoryRelation?.name ?? value.category,
    "otros"
  ).toLowerCase();
  const slugValue = optionalString(value.slug);
  const descriptionValue = optionalString(value.description);
  const badge = optionalString(value.badge);
  const offers = parseOffers(getValue(value, "offers", "product_offers"));
  const lowestOffer = offers.reduce<StoreOffer | undefined>(
    (lowest, offer) => (!lowest || offer.price < lowest.price ? offer : lowest),
    undefined
  );
  const explicitAvailability = getValue(value, "inStock", "in_stock");

  return {
    id: safeId(value.id, `supabase-${index}`),
    slug: slugValue || slugify(name),
    name,
    brand,
    category,
    image: safeString(getValue(value, "image", "image_url"), ""),
    gallery: parseGallery(value.gallery),
    price: safeNumber(value.price, lowestOffer?.price ?? 0),
    oldPrice: optionalNumber(getValue(value, "oldPrice", "old_price")),
    qualityPriceScore: optionalNumber(getValue(value, "qualityPriceScore", "quality_price_score")),
    rating: safeNumber(getValue(value, "rating", "average_rating")),
    reviews: safeNumber(getValue(value, "reviews", "review_count")),
    specs: parseSpecs(getValue(value, "specs", "product_specs")),
    store: safeString(value.store, lowestOffer?.store ?? "Tienda"),
    inStock: safeBoolean(
      explicitAvailability,
      offers.length ? offers.some((offer) => offer.inStock) : true
    ),
    badge,
    description: descriptionValue ?? `${name} de ${brand}. Consulta sus especificaciones y ofertas disponibles.`,
    offers,
  };
}

function parseProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseProduct);
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [request, setRequest] = useState(0);

  const reload = useCallback(() => setRequest((current) => current + 1), []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      setNotice(null);
      if (!isSupabaseConfigured || !supabase) {
        setProducts(mockProducts);
        setNotice("Usando catálogo de demostración: configura una clave Supabase válida para cargar datos reales.");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("products")
          .select("*,brand:brands(name),category:categories(name,slug),product_offers(*,store:stores(name,logo_url)),product_specs(*)");
        if (queryError) {
          if (!active) return;
          setProducts(mockProducts);
          setNotice(`No se pudo cargar Supabase (${queryError.message}). Se muestra el catálogo de demostración.`);
          return;
        }
        if (!active) return;
        const normalizedProducts = parseProducts(data);
        if (normalizedProducts.length === 0 && mockProducts.length > 0) {
          setProducts(mockProducts);
          setNotice("La tabla products está vacía. Se muestra el catálogo de demostración.");
        } else {
          setProducts(normalizedProducts);
        }
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : "Error desconocido al consultar products.";
        if (active) {
          setProducts(mockProducts);
          setNotice(`${message} Se muestra el catálogo de demostración.`);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, [request]);

  return (
    <ProductsContext.Provider value={{ products, isLoading, error, notice, reload }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe utilizarse dentro de ProductsProvider.");
  }
  return context;
}
