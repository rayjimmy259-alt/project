export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-50">Política de privacidad</h1>
      <p className="mt-2 text-sm text-ink-400">Última actualización: {new Date().toLocaleDateString("es")}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
        <section>
          <h2 className="text-lg font-semibold text-ink-100">1. Información que recopilamos</h2>
          <p className="mt-2">
            Esta versión no solicita datos personales ni requiere una cuenta. Para mostrar el catálogo,
            la aplicación consulta Supabase; las búsquedas y comparaciones se procesan en tu navegador.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-100">2. Cookies y almacenamiento local</h2>
          <p className="mt-2">
            La configuración regional que guardas se almacena localmente en tu navegador. No utilizamos
            cookies de seguimiento ni herramientas de analítica de terceros en esta versión.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-100">3. Datos de productos y precios</h2>
          <p className="mt-2">
            El catálogo puede incluir ofertas obtenidas de la base de datos o datos locales de demostración
            si no está disponible. Los precios y la disponibilidad pueden cambiar; verifica siempre la
            información directamente con el vendedor.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-100">4. Enlaces externos</h2>
          <p className="mt-2">
            Los enlaces de oferta pueden dirigirte a tiendas externas. Al salir de ComparaTech, se aplican
            las condiciones y prácticas de privacidad del sitio de destino.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-100">5. Cambios a esta política</h2>
          <p className="mt-2">
            Podemos actualizar esta política en cualquier momento. Te recomendamos revisar esta página
            periódicamente para mantenerte informado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-100">6. Contacto</h2>
          <p className="mt-2">
            Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de los
            canales habituales de ComparaTech.
          </p>
        </section>
      </div>

      <div className="mt-10 rounded-xl border border-ink-700 bg-ink-850 p-5">
        <p className="text-sm text-ink-400">
          Esta es una aplicación de demostración. La información presentada aquí no constituye asesoramiento
          legal y debe adaptarse según las necesidades reales de tu proyecto.
        </p>
      </div>
    </div>
  );
}
