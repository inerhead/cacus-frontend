import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Tienda CACUS Gift
        </h1>

        <p className="text-center mb-8 text-lg text-muted-foreground">
          Plataforma e-commerce de juguetes educativos y didácticos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🎨 Catálogo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explora nuestra selección de juguetes educativos
            </p>
            <Link
              href="/productos"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver productos →
            </Link>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🔐 Autenticación</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu cuenta o inicia sesión
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Iniciar sesión →
            </Link>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">⭐ Programa de Lealtad</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Acumula puntos con cada compra
            </p>
            <Link
              href="/loyalty"
              className="text-sm font-medium text-primary hover:underline"
            >
              Conocer más →
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Características</h2>
          <ul className="space-y-2 text-left max-w-2xl mx-auto">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Clasificación multinivel (edad, pedagogía, tipo de juego, habilidades)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Autenticación con Google y Facebook</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Sistema de carrito persistente</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Procesamiento de pagos con PSE</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Programa de lealtad similar a LEGO Elite</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
