import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, Scale, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/categories";

interface HeaderProps {
  onCategorySelect: (categoryId: string) => void;
  compareCount: number;
}

interface RegionalSettings {
  country: string;
  language: string;
  currency: string;
}

const regionalSettingsKey = "techcompare.regional-settings";
const defaultRegionalSettings: RegionalSettings = {
  country: "EC",
  language: "es",
  currency: "USD",
};

const countries = [
  { value: "EC", label: "EC Ecuador" },
  { value: "US", label: "US Estados Unidos" },
  { value: "MX", label: "MX México" },
  { value: "CO", label: "CO Colombia" },
  { value: "PE", label: "PE Perú" },
  { value: "CL", label: "CL Chile" },
  { value: "AR", label: "AR Argentina" },
  { value: "ES", label: "ES España" },
];

const languages = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

const currencies = [
  { value: "USD", label: "dólar estadounidense · USD · US$" },
  { value: "EUR", label: "euro · EUR · €" },
  { value: "MXN", label: "peso mexicano · MXN · $" },
  { value: "COP", label: "peso colombiano · COP · $" },
  { value: "PEN", label: "sol peruano · PEN · S/" },
  { value: "CLP", label: "peso chileno · CLP · $" },
  { value: "ARS", label: "peso argentino · ARS · $" },
];

function readRegionalSettings(): RegionalSettings {
  try {
    const stored = localStorage.getItem(regionalSettingsKey);
    if (!stored) return defaultRegionalSettings;
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return defaultRegionalSettings;
    const settings = parsed as Partial<RegionalSettings>;
    return {
      country: countries.some((country) => country.value === settings.country)
        ? settings.country!
        : defaultRegionalSettings.country,
      language: languages.some((language) => language.value === settings.language)
        ? settings.language!
        : defaultRegionalSettings.language,
      currency: currencies.some((currency) => currency.value === settings.currency)
        ? settings.currency!
        : defaultRegionalSettings.currency,
    };
  } catch {
    return defaultRegionalSettings;
  }
}

export function Header({ onCategorySelect, compareCount }: HeaderProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionalModalOpen, setRegionalModalOpen] = useState(false);
  const [regionalSettings, setRegionalSettings] = useState(readRegionalSettings);
  const [regionalDraft, setRegionalDraft] = useState(regionalSettings);
  const [regionalError, setRegionalError] = useState<string | null>(null);
  const closeModalButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!regionalModalOpen) return;
    closeModalButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRegionalModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [regionalModalOpen]);

  const selectCategory = (categoryId: string) => {
    onCategorySelect(categoryId);
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  };

  const openRegionalSettings = () => {
    setRegionalDraft(regionalSettings);
    setRegionalError(null);
    setRegionalModalOpen(true);
  };

  const saveRegionalSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      localStorage.setItem(regionalSettingsKey, JSON.stringify(regionalDraft));
      setRegionalSettings(regionalDraft);
      setRegionalError(null);
      setRegionalModalOpen(false);
    } catch {
      setRegionalError("No se pudo guardar la configuración en este navegador.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-lg shadow-slate-950/10">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-white sm:text-2xl"
          aria-label="ComparaTech, inicio"
        >
          ComparaTech
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-5 xl:gap-7 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoriesOpen((open) => !open)}
              aria-expanded={categoriesOpen}
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-white/80 transition-colors hover:text-white"
            >
              CATEGORÍAS
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
            </button>
            {categoriesOpen && (
              <div className="absolute left-0 top-full z-50 mt-4 min-w-56 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-white/40">{category.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={openRegionalSettings}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Abrir configuración regional"
            title="Configuración regional"
          >
            <Globe className="h-[18px] w-[18px]" />
          </button>
          <span className="hidden text-white/60 sm:block" aria-hidden="true">
            <UserRound className="h-[18px] w-[18px]" />
          </span>
          <Link
            to="/comparar"
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10 sm:px-4"
            aria-label={`Comparar productos${compareCount ? `, ${compareCount} seleccionados` : ""}`}
          >
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Comparar</span>
            {compareCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-400 px-1 text-[11px] font-bold text-slate-950">
                {compareCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Navegación móvil" className="border-t border-white/10 bg-slate-950/95 px-4 py-3 lg:hidden">
          <div className="mb-3 flex gap-2 border-b border-white/10 pb-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Inicio
            </Link>
            <Link
              to="/comparar"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Comparar{compareCount > 0 ? ` (${compareCount})` : ""}
            </Link>
          </div>
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-white/45">CATEGORÍAS</p>
          <div className="grid max-h-[min(60vh,28rem)] grid-cols-2 gap-1 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className="rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {category.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      {regionalModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRegionalModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="regional-settings-title"
            className="relative w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl sm:p-8"
          >
            <button
              ref={closeModalButtonRef}
              type="button"
              onClick={() => setRegionalModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-800 hover:text-white"
              aria-label="Cerrar configuración regional"
            >
              <X className="h-5 w-5" />
            </button>

            <h2
              id="regional-settings-title"
              className="mb-7 pr-8 text-center text-xl font-bold text-ink-50 sm:text-2xl"
            >
              Configuración regional
            </h2>

            <form onSubmit={saveRegionalSettings} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-200">País</span>
                <select
                  value={regionalDraft.country}
                  onChange={(event) =>
                    setRegionalDraft((draft) => ({ ...draft, country: event.target.value }))
                  }
                  className="input-field"
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-200">Idioma</span>
                <select
                  value={regionalDraft.language}
                  onChange={(event) =>
                    setRegionalDraft((draft) => ({ ...draft, language: event.target.value }))
                  }
                  className="input-field"
                >
                  {languages.map((language) => (
                    <option key={language.value} value={language.value}>{language.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-200">Moneda</span>
                <select
                  value={regionalDraft.currency}
                  onChange={(event) =>
                    setRegionalDraft((draft) => ({ ...draft, currency: event.target.value }))
                  }
                  className="input-field"
                >
                  {currencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>{currency.label}</option>
                  ))}
                </select>
              </label>

              {regionalError && (
                <p role="alert" className="text-sm text-error-400">{regionalError}</p>
              )}

              <button type="submit" className="btn-primary w-full bg-primary-600 hover:bg-primary-500">
                Guardar
              </button>
            </form>
          </section>
        </div>
      )}
    </header>
  );
}
