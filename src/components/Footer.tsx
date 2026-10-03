import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-ink-800 bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div>
              <span className="text-lg font-bold text-ink-50">ComparaTech</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-ink-400">
              Compara productos tecnológicos de distintas tiendas en un solo lugar. Encuentra la mejor opción para ti.
            </p>
            <p className="mt-3 text-xs text-ink-500">
              Los precios y la disponibilidad pueden cambiar. Confirma las condiciones con cada tienda.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-200">Explorar</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-400">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Inicio</Link></li>
              <li><span className="cursor-default">Smartphones</span></li>
              <li><span className="cursor-default">Laptops</span></li>
              <li><span className="cursor-default">Gaming</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink-200">Información</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-400">
              <li><Link to="/privacidad" className="hover:text-primary-400 transition-colors">Privacidad</Link></li>
              <li><span className="cursor-default">Términos de uso</span></li>
              <li><span className="cursor-default">Contacto</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-ink-800 pt-6 text-center text-xs text-ink-500">
          © {new Date().getFullYear()} ComparaTech. Demo con fines ilustrativos.
        </div>
      </div>
    </footer>
  );
}
