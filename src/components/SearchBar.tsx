import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/categories";
import { useProducts } from "../lib/ProductsContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: string) => void;
}

export function SearchBar({ onSearch, onCategorySelect }: SearchBarProps) {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = query
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : products.slice(0, 4);

  const popularTags = ["iPhone 15", "Galaxy S24", "MacBook", "AirPods", "PS5"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setFocused(false);
  };

  const handleSuggestionClick = (product: { name: string; slug: string }) => {
    setQuery(product.name);
    setFocused(false);
    navigate(`/producto/${product.slug}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Busca smartphones, laptops, audífonos..."
            className="w-full rounded-xl border border-ink-700 bg-ink-850/90 py-3.5 pl-12 pr-28 text-sm text-ink-100 placeholder-ink-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-95"
          >
            Buscar
          </button>
        </div>
      </form>

      {focused && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-ink-700 bg-ink-850 shadow-2xl animate-scale-in">
          {!query && (
            <div className="border-b border-ink-700 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Búsquedas populares</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      onSearch(tag);
                      setFocused(false);
                    }}
                    className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-200 transition-colors hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-400">
              {query ? "Resultados sugeridos" : "Productos destacados"}
            </p>
            {suggestions.length === 0 ? (
              <p className="px-3 py-4 text-sm text-ink-400">No encontramos resultados para "{query}"</p>
            ) : (
              suggestions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSuggestionClick(p)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-ink-800"
                >
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-100">{p.name}</p>
                    <p className="text-xs text-ink-400">{p.brand}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-400">${p.price}</span>
                </button>
              ))
            )}
          </div>
          {!query && (
            <div className="border-t border-ink-700 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Categorías</p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategorySelect(cat.id);
                      setFocused(false);
                    }}
                    className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs text-ink-200 transition-colors hover:bg-ink-700"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
