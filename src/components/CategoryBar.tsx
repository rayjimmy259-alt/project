import * as Icons from "lucide-react";
import { categories } from "../data/categories";
import { useProducts } from "../lib/ProductsContext";

interface CategoryBarProps {
  selected: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  const { products } = useProducts();

  return (
    <section className="border-b border-ink-800 bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-thin">
          <button
            onClick={() => onSelect("all")}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selected === null || selected === "all"
                ? "bg-primary-500 text-white"
                : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
            }`}
          >
            <Icons.LayoutGrid className="h-4 w-4" />
            Todos
          </button>
          {categories.map((cat) => {
            const Icon = (Icons as any)[cat.icon] || Icons.Circle;
            const productCount = products.filter((product) => product.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selected === cat.id
                    ? "bg-primary-500 text-white"
                    : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
                <span className={`text-xs ${selected === cat.id ? "text-primary-200" : "text-ink-500"}`}>
                  {productCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
