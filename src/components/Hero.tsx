import { useState, type FormEvent } from "react";
import { ArrowDown, Search } from "lucide-react";

interface HeroProps {
  onSearch: (query: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white sm:min-h-[570px]">
      <div
        className="absolute inset-0 -z-10 opacity-70"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 35%, rgba(147, 51, 234, 0.28), transparent 42%), radial-gradient(ellipse at 82% 62%, rgba(79, 70, 229, 0.2), transparent 45%)",
        }}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="animate-slide-up text-5xl font-extrabold lowercase leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            compáralo todo
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Teléfonos móviles, laptops, tarjetas gráficas, audífonos, y mucho más
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-9 flex w-full max-w-2xl flex-col gap-2 rounded-[1.75rem] bg-white p-2 shadow-2xl shadow-black/25 sm:flex-row sm:items-center sm:rounded-full"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Escribe aquí para comparar..."
                aria-label="Escribe aquí para comparar"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 sm:text-base"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              Comparar
            </button>
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToCatalog}
        aria-label="Desplazarse al catálogo"
        className="absolute bottom-6 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </section>
  );
}
