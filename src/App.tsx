import { useState, useMemo, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { CategoryBar } from "./components/CategoryBar";
import { DealsSection } from "./components/DealsSection";
import { ProductCard } from "./components/ProductCard";
import { Footer } from "./components/Footer";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ComparePage } from "./pages/ComparePage";
import { CategoryListingPage } from "./pages/CategoryListingPage";
import { MAX_COMPARE } from "./constants";
import { useProducts } from "./lib/ProductsContext";
import { getProductStartingPrice } from "./utils";

export default function App() {
  const navigate = useNavigate();
  const { products, isLoading, error, notice, reload } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("relevance");
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = products
      .map(getProductStartingPrice)
      .filter((price) => Number.isFinite(price) && price > 0);
    return prices.length ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] : [0, 0];
  }, [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>(priceBounds);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_COMPARE) return prev;
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    result = result.filter((product) => {
      const price = getProductStartingPrice(product);
      return price === 0 || (price >= priceRange[0] && price <= priceRange[1]);
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (q === "ofertas") {
        result = result.filter((p) => p.oldPrice && p.oldPrice > p.price);
      } else {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => getProductStartingPrice(a) - getProductStartingPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => getProductStartingPrice(b) - getProductStartingPrice(a));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        result.sort((a, b) => {
          const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return db - da;
        });
        break;
    }

    return result;
  }, [products, priceRange, searchQuery, selectedCategory, sortBy]);


  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    navigate("/");
    const el = document.getElementById("catalogo");
    el?.scrollIntoView({ behavior: "smooth" });
  }, [navigate]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    if (categoryId === "all") {
      setSelectedCategory(null);
      navigate("/");
      return;
    }
    navigate(`/categoria/${categoryId}`);
    setSearchQuery("");
  }, [navigate]);

  if (isLoading || error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header onCategorySelect={handleCategorySelect} compareCount={compareIds.size} />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="card max-w-xl p-8 text-center">
            {isLoading ? (
              <>
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-primary-500" />
                <h1 className="text-xl font-bold text-ink-50">Cargando catálogo</h1>
                <p className="mt-2 text-sm text-ink-400">Estamos consultando los productos en Supabase.</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-ink-50">No pudimos cargar el catálogo</h1>
                <p role="alert" className="mt-2 break-words text-sm text-error-400">{error}</p>
                <button type="button" onClick={reload} className="btn-primary mt-5">
                  Reintentar
                </button>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onCategorySelect={handleCategorySelect}
        compareCount={compareIds.size}
      />
      {notice && (
        <div role="status" className="border-b border-primary-500/20 bg-primary-500/10 px-4 py-2 text-center text-xs text-primary-200">
          {notice}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <main className="flex-1">
              <Hero onSearch={handleSearch} />
              <CategoryBar selected={selectedCategory} onSelect={handleCategorySelect} />
              <DealsSection
                products={products}
                onToggleCompare={toggleCompare}
                compareIds={compareIds}
              />

              <section id="catalogo" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-ink-50">
                      {selectedCategory && selectedCategory !== "all"
                        ? `${getCategoryName(selectedCategory)}`
                        : searchQuery
                        ? `Resultados: "${searchQuery}"`
                        : "Catálogo completo"}
                    </h2>
                    <p className="mt-1 text-sm text-ink-400">
                      {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-ink-400">Ordenar:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-ink-100 transition-all focus:border-primary-500 focus:outline-none"
                    >
                      <option value="relevance">Relevancia</option>
                      <option value="price-asc">Precio: menor a mayor</option>
                      <option value="price-desc">Precio: mayor a menor</option>
                      <option value="rating">Mejor valorados</option>
                      <option value="discount">Mayor descuento</option>
                    </select>
                  </div>
                </div>

                <details className="card mb-6 p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-ink-100">
                    Filtrar por precio
                    <span className="ml-2 font-normal text-ink-400">
                      ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
                    </span>
                  </summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-xs text-ink-400">
                      Mínimo: ${priceRange[0].toLocaleString()}
                      <input
                        type="range"
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        step="1"
                        value={priceRange[0]}
                        onChange={(event) =>
                          setPriceRange(([_, maximum]) => [
                            Math.min(Number(event.target.value), maximum),
                            maximum,
                          ])
                        }
                        className="mt-2 block h-2 w-full cursor-pointer accent-primary-500"
                        aria-label="Precio mínimo del catálogo"
                      />
                    </label>
                    <label className="text-xs text-ink-400">
                      Máximo: ${priceRange[1].toLocaleString()}
                      <input
                        type="range"
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        step="1"
                        value={priceRange[1]}
                        onChange={(event) =>
                          setPriceRange(([minimum]) => [
                            minimum,
                            Math.max(Number(event.target.value), minimum),
                          ])
                        }
                        className="mt-2 block h-2 w-full cursor-pointer accent-primary-500"
                        aria-label="Precio máximo del catálogo"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPriceRange(priceBounds)}
                      className="text-xs font-medium text-primary-400 hover:text-primary-300"
                    >
                      Restablecer precio
                    </button>
                  </div>
                </details>

                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink-800">
                      <svg className="h-8 w-8 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ink-200">No encontramos productos</h3>
                    <p className="mt-1 text-sm text-ink-400">Prueba con otra búsqueda o categoría.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(null);
                      }}
                      className="mt-4 btn-ghost"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSelected={compareIds.has(product.id)}
                        onToggleCompare={toggleCompare}
                        isDisabled={compareIds.size >= MAX_COMPARE}
                      />
                    ))}
                  </div>
                )}
              </section>
            </main>
          }
        />
        <Route
          path="/comparar"
          element={
            <ComparePage
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
              onClearCompare={() => setCompareIds(new Set())}
            />
          }
        />
        <Route
          path="/categoria/:slug"
          element={
            <CategoryListingPage
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
            />
          }
        />
        <Route
          path="/producto/:slug"
          element={
            <ProductDetailPage
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
              onSearch={handleSearch}
            />
          }
        />
        <Route path="/privacidad" element={<main className="flex-1"><PrivacyPage /></main>} />
      </Routes>

      <Footer />
    </div>
  );
}

function getCategoryName(id: string): string {
  const names: Record<string, string> = {
    smartphones: "Smartphones",
    laptops: "Laptops",
    audio: "Audio",
    wearables: "Wearables",
    camaras: "Cámaras",
    gaming: "Gaming",
    tablets: "Tablets",
    tv: "TV y Video",
  };
  return names[id] || id;
}
