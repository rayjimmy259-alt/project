import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { categories } from "../data/categories";
import { MAX_COMPARE } from "../constants";
import { useProducts } from "../lib/ProductsContext";
import { getProductStartingPrice } from "../utils";
import type { Product } from "../types";

interface CategoryListingPageProps {
  compareIds: Set<string>;
  onToggleCompare: (id: string) => void;
}

type SortOption = "popular" | "price-asc" | "price-desc" | "rating";
type SpecFacet = { label: string; values: string[] };

const categoryAliases: Record<string, string> = {
  celulares: "smartphones",
  smartphones: "smartphones",
  laptops: "laptops",
  audio: "audio-auriculares",
  "audio-auriculares": "audio-auriculares",
  wearables: "wearables",
  "perifericos-pc": "perifericos-pc",
  "accesorios-computadora": "accesorios-computadora",
  cargadores: "cargadores",
  chargers: "cargadores",
  "power-accessories": "cargadores",
  camaras: "camaras",
  gaming: "gaming",
  tablets: "tablets",
  tv: "tv",
};

function getStartingPrice(product: Product): number {
  return getProductStartingPrice(product);
}

function isAvailable(product: Product): boolean {
  return product.inStock && product.offers.some((offer) => offer.inStock);
}

function getCategoryTitle(slug: string, categoryId: string | undefined): string {
  if (slug === "celulares") return "Celulares";
  return categories.find((category) => category.id === categoryId)?.name ?? "Categoría";
}

function getSpecFacets(categoryProducts: Product[]): SpecFacet[] {
  return ["RAM", "Almacenamiento"].flatMap((label) => {
    const values = Array.from(
      new Set(
        categoryProducts.flatMap((product) =>
          product.specs
            .filter((spec) => spec.label.toLowerCase() === label.toLowerCase())
            .map((spec) => spec.value)
        )
      )
    ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return values.length ? [{ label, values }] : [];
  });
}

function FilterOptions({
  categoryProducts,
  priceBounds,
  priceRange,
  onPriceChange,
  selectedBrands,
  onBrandChange,
  specFacets,
  selectedSpecs,
  onSpecChange,
  stores,
  selectedStores,
  onStoreChange,
  availableOnly,
  onAvailabilityChange,
  onClear,
}: {
  categoryProducts: Product[];
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  selectedBrands: Set<string>;
  onBrandChange: (brand: string) => void;
  specFacets: SpecFacet[];
  selectedSpecs: Record<string, Set<string>>;
  onSpecChange: (label: string, value: string) => void;
  stores: string[];
  selectedStores: Set<string>;
  onStoreChange: (store: string) => void;
  availableOnly: boolean;
  onAvailabilityChange: () => void;
  onClear: () => void;
}) {
  const brands = Array.from(new Set(categoryProducts.map((product) => product.brand))).sort();

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-ink-100">Rango de precio</h3>
          <button onClick={onClear} className="text-xs text-primary-400 hover:text-primary-300">
            Limpiar
          </button>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm text-ink-300">
          <span>${priceRange[0].toLocaleString()}</span>
          <span>${priceRange[1].toLocaleString()}</span>
        </div>
        <span className="mb-1 block text-xs text-ink-400">Precio mínimo</span>
        <input
          type="range"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step="1"
          value={priceRange[0]}
          onChange={(event) =>
            onPriceChange([Math.min(Number(event.target.value), priceRange[1]), priceRange[1]])
          }
          className="mb-3 h-2 w-full cursor-pointer accent-primary-500"
          aria-label="Precio mínimo"
        />
        <span className="mb-1 block text-xs text-ink-400">Precio máximo</span>
        <input
          type="range"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step="1"
          value={priceRange[1]}
          onChange={(event) =>
            onPriceChange([priceRange[0], Math.max(Number(event.target.value), priceRange[0])])
          }
          className="h-2 w-full cursor-pointer accent-primary-500"
          aria-label="Precio máximo"
        />
      </div>

      <FilterGroup title="Marca">
        {brands.map((brand) => (
          <CheckboxOption
            key={brand}
            label={brand}
            checked={selectedBrands.has(brand)}
            onChange={() => onBrandChange(brand)}
          />
        ))}
      </FilterGroup>

      {specFacets.map((facet) => (
        <FilterGroup key={facet.label} title={facet.label}>
          {facet.values.map((value) => (
            <CheckboxOption
              key={value}
              label={value}
              checked={selectedSpecs[facet.label]?.has(value) ?? false}
              onChange={() => onSpecChange(facet.label, value)}
            />
          ))}
        </FilterGroup>
      ))}

      <FilterGroup title="Tienda">
        {stores.map((store) => (
          <CheckboxOption
            key={store}
            label={store}
            checked={selectedStores.has(store)}
            onChange={() => onStoreChange(store)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Disponibilidad">
        <CheckboxOption
          label="Solo disponibles"
          checked={availableOnly}
          onChange={onAvailabilityChange}
        />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-semibold text-ink-100">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-300 hover:text-ink-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-ink-600 bg-ink-850 text-primary-500 focus:ring-primary-500"
      />
      {label}
    </label>
  );
}

export function CategoryListingPage({ compareIds, onToggleCompare }: CategoryListingPageProps) {
  const { slug = "" } = useParams<{ slug: string }>();
  const { products } = useProducts();
  const categoryId = categoryAliases[slug.toLowerCase()];
  const categoryProducts = useMemo(
    () => products.filter((product) => product.category === categoryId),
    [categoryId, products]
  );
  const specFacets = useMemo(() => getSpecFacets(categoryProducts), [categoryProducts]);
  const stores = useMemo(
    () =>
      Array.from(
        new Set(categoryProducts.flatMap((product) => product.offers.map((offer) => offer.store)))
      ).sort(),
    [categoryProducts]
  );
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = categoryProducts.map(getStartingPrice);
    return prices.length ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] : [0, 0];
  }, [categoryProducts]);

  const [priceRange, setPriceRange] = useState<[number, number]>(priceBounds);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, Set<string>>>({});
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  useEffect(() => {
    setPriceRange(priceBounds);
    setSelectedBrands(new Set());
    setSelectedSpecs({});
    setSelectedStores(new Set());
    setAvailableOnly(false);
  }, [slug, priceBounds]);

  const filteredProducts = useMemo(() => {
    const result = categoryProducts.filter((product) => {
      const price = getStartingPrice(product);
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedBrands.size && !selectedBrands.has(product.brand)) return false;
      if (availableOnly && !isAvailable(product)) return false;
      if (
        Object.entries(selectedSpecs).some(([label, values]) => {
          if (!values.size) return false;
          const spec = product.specs.find((item) => item.label.toLowerCase() === label.toLowerCase());
          return !spec || !values.has(spec.value);
        })
      ) {
        return false;
      }
      if (
        selectedStores.size &&
        !product.offers.some((offer) => selectedStores.has(offer.store))
      ) {
        return false;
      }
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        return result.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
      case "price-desc":
        return result.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
      case "rating":
        return result.sort((a, b) => b.rating - a.rating);
      case "popular":
        return result.sort((a, b) => b.reviews - a.reviews);
    }
  }, [categoryProducts, priceRange, selectedBrands, selectedSpecs, selectedStores, availableOnly, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) => {
      const next = new Set(current);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  };

  const toggleSpec = (label: string, value: string) => {
    setSelectedSpecs((current) => {
      const next = { ...current, [label]: new Set(current[label] ?? []) };
      next[label].has(value) ? next[label].delete(value) : next[label].add(value);
      return next;
    });
  };

  const toggleStore = (store: string) => {
    setSelectedStores((current) => {
      const next = new Set(current);
      next.has(store) ? next.delete(store) : next.add(store);
      return next;
    });
  };

  const clearFilters = () => {
    setPriceRange(priceBounds);
    setSelectedBrands(new Set());
    setSelectedSpecs({});
    setSelectedStores(new Set());
    setAvailableOnly(false);
  };

  const filterOptions = (
    <FilterOptions
      categoryProducts={categoryProducts}
      priceBounds={priceBounds}
      priceRange={priceRange}
      onPriceChange={setPriceRange}
      selectedBrands={selectedBrands}
      onBrandChange={toggleBrand}
      specFacets={specFacets}
      selectedSpecs={selectedSpecs}
      onSpecChange={toggleSpec}
      stores={stores}
      selectedStores={selectedStores}
      onStoreChange={toggleStore}
      availableOnly={availableOnly}
      onAvailabilityChange={() => setAvailableOnly((current) => !current)}
      onClear={clearFilters}
    />
  );

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-5 flex items-center gap-2 text-sm text-ink-400">
          <Link to="/" className="hover:text-primary-400">Inicio</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink-200">{getCategoryTitle(slug, categoryId)}</span>
        </nav>

        <header className="mb-7">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-400">ComparaTech</p>
          <h1 className="text-3xl font-bold text-ink-50 sm:text-4xl">
            {getCategoryTitle(slug, categoryId)}
          </h1>
          <p className="mt-2 text-ink-300">
            Compara precios, encuentra las mejores ofertas y elige tu próximo equipo.
          </p>
        </header>

        {categoryProducts.length > 0 ? (
          <>
            <details className="card mb-5 p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-ink-100">
                <SlidersHorizontal className="h-4 w-4 text-primary-400" />
                Filtros
              </summary>
              <div className="mt-5 border-t border-ink-700 pt-5">{filterOptions}</div>
            </details>

            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="card sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto p-5 lg:block">
                <div className="mb-5 flex items-center gap-2 border-b border-ink-700 pb-4">
                  <SlidersHorizontal className="h-4 w-4 text-primary-400" />
                  <h2 className="font-semibold text-ink-50">Filtros</h2>
                </div>
                {filterOptions}
              </aside>

              <section aria-label={`Productos de ${getCategoryTitle(slug, categoryId)}`}>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-ink-300" aria-live="polite">
                    <span className="font-semibold text-ink-100">{filteredProducts.length}</span>{" "}
                    producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
                  </p>
                  <label className="flex items-center gap-3 text-sm text-ink-400">
                    Ordenar por
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-ink-100 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="price-asc">Menor precio</option>
                      <option value="popular">Más populares</option>
                      <option value="price-desc">Mayor precio</option>
                      <option value="rating">Mejor valorados</option>
                    </select>
                  </label>
                </div>

                {filteredProducts.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSelected={compareIds.has(product.id)}
                        onToggleCompare={onToggleCompare}
                        isDisabled={compareIds.size >= MAX_COMPARE}
                        showOffersAction
                        showFromPrice
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card flex flex-col items-center px-6 py-16 text-center">
                    <X className="mb-3 h-8 w-8 text-ink-500" />
                    <h2 className="text-lg font-semibold text-ink-100">No hay productos con estos filtros</h2>
                    <p className="mt-1 text-sm text-ink-400">Prueba ajustando o quitando algunos filtros.</p>
                    <button onClick={clearFilters} className="btn-ghost mt-5">Limpiar filtros</button>
                  </div>
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="card px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-ink-100">Categoría no encontrada</h2>
            <p className="mt-2 text-sm text-ink-400">No encontramos productos para esta categoría.</p>
            <Link to="/" className="btn-primary mt-5">Volver al inicio</Link>
          </div>
        )}
      </div>
    </main>
  );
}
