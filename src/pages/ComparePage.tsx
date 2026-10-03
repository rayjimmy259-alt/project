import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product, StoreOffer } from "../types";
import { useProducts } from "../lib/ProductsContext";
import { MAX_COMPARE } from "../constants";
import { formatPrice, getProductStartingPrice } from "../utils";
import { withAffiliateTracking } from "../utils/affiliate";

interface ComparePageProps {
  compareIds: Set<string>;
  onToggleCompare: (id: string) => void;
  onClearCompare: () => void;
}

type ComparisonRow =
  | { label: string; key: string; type: "text" | "number"; higherIsBetter?: boolean }
  | { label: string; key: "price"; type: "price" }
  | { label: string; key: "store"; type: "store" }
  | { label: string; key: "score"; type: "score" };

const featureRows: ComparisonRow[] = [
  { label: "KiScore", key: "score", type: "score" },
  { label: "Mejor precio", key: "price", type: "price" },
  { label: "Tienda sugerida", key: "store", type: "store" },
  { label: "Procesador", key: "Procesador", type: "text" },
  { label: "Pantalla", key: "Pantalla", type: "text" },
  { label: "Batería", key: "Batería", type: "number", higherIsBetter: true },
  { label: "Cámara", key: "Cámara", type: "text" },
  { label: "RAM", key: "RAM", type: "number", higherIsBetter: true },
  { label: "Almacenamiento", key: "Almacenamiento", type: "number", higherIsBetter: true },
];

const specAliases: Record<string, string[]> = {
  procesador: ["procesador", "cpu", "chip"],
  pantalla: ["pantalla", "display"],
  bateria: ["bateria", "autonomia"],
  camara: ["camara", "camaras"],
  ram: ["ram", "memoriaram"],
  almacenamiento: ["almacenamiento", "storage"],
};

function normalizeLabel(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function getSpecValue(product: Product, specKey: string): string {
  const aliases = specAliases[normalizeLabel(specKey)] ?? [normalizeLabel(specKey)];
  const spec = product.specs.find((item) => aliases.includes(normalizeLabel(item.label)));
  return spec?.value || "—";
}

function getKiScore(product: Product): number {
  return Math.max(0, Math.min(10, product.qualityPriceScore ?? (product.rating > 0 ? product.rating * 2 : 7.5)));
}

function getBestOffer(product: Product): StoreOffer | undefined {
  return product.offers
    .filter((offer) => Number.isFinite(offer.price) && offer.price > 0)
    .slice()
    .sort((left, right) => {
      if (left.inStock !== right.inStock) return left.inStock ? -1 : 1;
      return left.price - right.price;
    })[0];
}

function getNumericValue(product: Product, row: ComparisonRow): number | null {
  if (row.type === "price") {
    const price = getProductStartingPrice(product);
    return price > 0 ? price : null;
  }
  if (row.type === "score") return getKiScore(product);
  if (row.type !== "number") return null;

  const raw = getSpecValue(product, row.key);
  const match = raw.match(/(\d+(?:[.,]\d+)?)\s*(TB|GB|MB|MAH|H|HORAS)?/i);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return null;
  const unit = match[2]?.toUpperCase();
  if (unit === "TB") return value * 1024;
  if (unit === "MB") return value / 1024;
  return value;
}

function findBestIndex(products: Product[], row: ComparisonRow): number {
  if (row.type !== "price" && row.type !== "score" && row.type !== "number") return -1;
  const values = products
    .map((product, index) => ({ index, value: getNumericValue(product, row) }))
    .filter((item): item is { index: number; value: number } => item.value !== null);
  if (values.length < 2) return -1;
  const higherIsBetter = row.type === "score" || (row.type === "number" && row.higherIsBetter);
  return values.reduce((best, current) => (
    higherIsBetter
      ? current.value > best.value ? current : best
      : current.value < best.value ? current : best
  )).index;
}

function AddProductPicker({
  onPick,
  excludeIds,
}: {
  onPick: (id: string) => void;
  excludeIds: Set<string>;
}) {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const available = products.filter((product) => !excludeIds.has(product.id));
    if (!query.trim()) return available.slice(0, 6);
    const normalizedQuery = query.toLowerCase().trim();
    return available
      .filter((product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 6);
  }, [products, excludeIds, query]);

  return (
    <div ref={ref} className="relative min-h-[250px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex h-full min-h-[250px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-700 bg-ink-900/40 p-5 text-ink-400 transition-all hover:border-primary-500 hover:bg-ink-850 hover:text-primary-400"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-current text-2xl" aria-hidden="true">+</span>
        <span className="text-sm font-medium">Agregar producto</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-ink-700 bg-ink-850 shadow-2xl">
          <div className="border-b border-ink-700 p-3">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto..."
              aria-label="Buscar producto para comparar"
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder-ink-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-sm text-ink-400">No se encontraron productos.</p>
            ) : results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onPick(product.id);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-ink-800"
              >
                <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-100">{product.name}</span>
                  <span className="block text-xs text-ink-400">{product.brand}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-primary-400">
                  {getProductStartingPrice(product) > 0 ? formatPrice(getProductStartingPrice(product)) : "Consultar"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ComparePage({ compareIds, onToggleCompare, onClearCompare }: ComparePageProps) {
  const { products: allProducts } = useProducts();
  const productsById = useMemo(() => new Map(allProducts.map((product) => [product.id, product])), [allProducts]);
  const items = useMemo(
    () => Array.from(compareIds).map((id) => productsById.get(id)).filter((product): product is Product => Boolean(product)).slice(0, MAX_COMPARE),
    [compareIds, productsById]
  );

  const customRows = useMemo(() => {
    const labels = Array.from(new Set(items.flatMap((product) => product.specs.map((spec) => spec.label))));
    const knownAliases = new Set(Object.values(specAliases).flat().concat(["modelo", "marca", "categoria", "rating"]));
    return labels
      .filter((label) => !knownAliases.has(normalizeLabel(label)))
      .map((label): ComparisonRow => ({ label, key: label, type: "text" }));
  }, [items]);
  const rows = [...featureRows, ...customRows];
  const emptySlots = MAX_COMPARE - items.length;

  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-4 flex items-center gap-2 text-sm text-ink-400">
          <Link to="/" className="transition-colors hover:text-primary-400">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-200">Comparar</span>
        </nav>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-50 sm:text-3xl">Comparador frente a frente</h1>
            <p className="mt-1 text-sm text-ink-400">
              {items.length
                ? `Comparando ${items.length} de ${MAX_COMPARE} productos. Desliza la tabla para ver todas las columnas.`
                : `Elige hasta ${MAX_COMPARE} productos para comparar precios, KiScore y especificaciones.`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearCompare}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-ink-700 px-4 py-2 text-sm font-medium text-ink-200 transition-all hover:border-error-500/50 hover:text-error-400 sm:self-auto"
            >
              Limpiar comparación
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className="rounded-xl border-2 border-dashed border-ink-700 px-4 py-10 text-center sm:px-8 sm:py-16">
            <h2 className="text-xl font-semibold text-ink-100">Empieza a comparar</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
              Busca un producto en cada espacio o vuelve al catálogo y selecciona “Comparar” en sus tarjetas.
            </p>
            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: MAX_COMPARE }, (_, index) => (
                <AddProductPicker key={index} onPick={onToggleCompare} excludeIds={compareIds} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <p className="mb-2 text-xs text-ink-400 sm:hidden">Desliza horizontalmente para comparar los productos →</p>
            <div
              className="overflow-x-auto overscroll-x-contain rounded-xl border border-ink-800 shadow-xl"
              role="region"
              aria-label="Tabla comparativa de productos; desliza horizontalmente para ver todas las columnas"
              tabIndex={0}
            >
              <table className="w-full table-fixed border-collapse" style={{ minWidth: `${176 + MAX_COMPARE * 224}px` }}>
                <colgroup>
                  <col style={{ width: "176px" }} />
                  {Array.from({ length: MAX_COMPARE }, (_, index) => (
                    <col key={index} style={{ width: "224px" }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="bg-ink-900">
                    <th scope="col" className="sticky left-0 z-20 border-b border-r border-ink-800 bg-ink-900 p-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400 sm:p-4">
                      Producto
                    </th>
                    {items.map((product) => {
                      const score = getKiScore(product);
                      return (
                        <th key={product.id} scope="col" className="border-b border-ink-800 p-3 text-left align-top font-normal sm:p-4">
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="mb-3 aspect-[4/3] w-full rounded-lg bg-ink-850 object-contain"
                              loading="lazy"
                            />
                            <button
                              type="button"
                              onClick={() => onToggleCompare(product.id)}
                              aria-label={`Quitar ${product.name} de la comparación`}
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/90 text-ink-200 shadow hover:bg-error-500 hover:text-white"
                            >
                              <span aria-hidden="true">×</span>
                            </button>
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wide text-primary-400">{product.brand}</p>
                          <h2 className="mt-1 min-h-10 text-sm font-semibold leading-snug text-ink-100">{product.name}</h2>
                          <p className="mt-2 inline-flex rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-300">
                            KiScore {score.toFixed(1)}/10
                          </p>
                        </th>
                      );
                    })}
                    {Array.from({ length: emptySlots }, (_, index) => (
                      <th key={`empty-${index}`} scope="col" className="border-b border-ink-800 p-3 align-top font-normal sm:p-4">
                        <AddProductPicker onPick={onToggleCompare} excludeIds={compareIds} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => {
                    const bestIndex = findBestIndex(items, row);
                    return (
                      <tr key={row.key} className={rowIndex % 2 === 0 ? "bg-ink-900/70" : "bg-ink-850/60"}>
                        <th scope="row" className="sticky left-0 z-10 border-r border-ink-800 bg-ink-900 p-3 text-left text-xs font-semibold text-ink-300 sm:p-4 sm:text-sm">
                          {row.label}
                        </th>
                        {items.map((product, index) => {
                          const isBest = bestIndex === index;
                          const offer = getBestOffer(product);
                          let content: React.ReactNode;

                          if (row.type === "price") {
                            const price = getProductStartingPrice(product);
                            content = price > 0 ? formatPrice(price) : "Consultar";
                          } else if (row.type === "store") {
                            content = offer
                              ? offer.url && offer.url !== "#"
                                ? (
                                  <a href={withAffiliateTracking(offer.url, offer.store)} target="_blank" rel="nofollow sponsored noopener noreferrer" className="font-semibold text-primary-300 underline decoration-primary-500/40 underline-offset-4 hover:text-primary-200">
                                    {offer.store} · Ver oferta
                                  </a>
                                )
                                : <span>{offer.store}</span>
                              : <span>Sin ofertas disponibles</span>;
                          } else if (row.type === "score") {
                            content = `${getKiScore(product).toFixed(1)}/10`;
                          } else {
                            content = getSpecValue(product, row.key);
                          }

                          return (
                            <td key={product.id} className={`break-words border-b border-ink-800 p-3 text-center text-sm text-ink-100 sm:p-4 ${isBest ? "bg-success-500/10 font-semibold text-success-300" : ""}`}>
                              {content}
                              {isBest && (
                                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-success-400">
                                  {row.type === "price" ? "Mejor precio" : row.type === "score" ? "Mayor KiScore" : "Mejor"}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        {Array.from({ length: emptySlots }, (_, index) => (
                          <td key={`empty-${index}`} className="border-b border-ink-800 p-3 text-center text-sm text-ink-500 sm:p-4">
                            —
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr className="bg-ink-900/70">
                    <th scope="row" className="sticky left-0 z-10 border-r border-ink-800 bg-ink-900 p-3 text-left text-xs font-semibold text-ink-300 sm:p-4 sm:text-sm">
                      Valoración
                    </th>
                    {items.map((product) => (
                      <td key={product.id} className="border-b border-ink-800 p-3 text-center text-sm text-ink-100 sm:p-4">
                        {product.rating > 0 ? `${product.rating.toFixed(1)}/5 · ${product.reviews.toLocaleString()} reseñas` : "Sin valoraciones"}
                      </td>
                    ))}
                    {Array.from({ length: emptySlots }, (_, index) => (
                      <td key={`empty-rating-${index}`} className="border-b border-ink-800 p-3 text-center text-sm text-ink-500 sm:p-4">—</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 rounded-lg border border-ink-700 bg-ink-850 px-4 py-3 text-xs leading-relaxed text-ink-400">
              Los datos de KiScore, precios, disponibilidad y especificaciones pueden ser referenciales. Confirma el precio y las condiciones en la tienda antes de comprar.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
