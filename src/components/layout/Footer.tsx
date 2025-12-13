import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 w-full mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Follow Us Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 uppercase">Síguenos</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="#"
                className="bg-lego-blue text-white rounded-full p-2 hover:bg-lego-blue-light transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-black text-white rounded-full p-2 hover:bg-lego-gray-darker transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <button className="bg-black text-white px-4 py-2 font-bold text-sm hover:bg-lego-gray-darker transition-colors flex items-center gap-2">
              <span className="text-lego-yellow">●</span>
              MENOS CLICS MÁS BRICKS
            </button>
          </div>

          {/* Shop Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 uppercase">Compra</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/temas" className="hover:text-lego-red transition-colors">
                  Temas
                </Link>
              </li>
              <li>
                <Link href="/interes" className="hover:text-lego-red transition-colors">
                  Interés
                </Link>
              </li>
              <li>
                <Link href="/exclusivos" className="hover:text-lego-red transition-colors">
                  Exclusivos
                </Link>
              </li>
              <li>
                <Link href="/nuevos" className="hover:text-lego-red transition-colors">
                  Nuevos
                </Link>
              </li>
              <li>
                <Link href="/adultos" className="hover:text-lego-red transition-colors">
                  Adultos
                </Link>
              </li>
              <li>
                <Link href="/hogar" className="hover:text-lego-red transition-colors">
                  Hogar
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="hover:text-lego-red transition-colors">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          {/* Users Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 uppercase">Usuarios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="hover:text-lego-red transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-lego-red transition-colors">
                  Historial de Pedidos
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="hover:text-lego-red transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/programa-elite" className="hover:text-lego-red transition-colors">
                  Programa Elite
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 uppercase">Tienda CACUS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pqr" className="hover:text-lego-red transition-colors">
                  PQR
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-lego-red transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-lego-red transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/piezas-faltantes" className="hover:text-lego-red transition-colors">
                  Piezas Faltantes
                </Link>
              </li>
              <li>
                <Link href="/tiendas" className="hover:text-lego-red transition-colors">
                  Nuestras Tiendas
                </Link>
              </li>
              <li>
                <Link href="/sostenible" className="hover:text-lego-red transition-colors">
                  CACUS Sostenible
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <Link href="/legales" className="hover:text-lego-red transition-colors">
              LEGALES
            </Link>
            <span>|</span>
            <Link href="/privacidad" className="hover:text-lego-red transition-colors">
              POLÍTICA DE PRIVACIDAD
            </Link>
            <span>|</span>
            <Link href="/terminos" className="hover:text-lego-red transition-colors">
              TÉRMINOS Y CONDICIONES
            </Link>
            <span>|</span>
            <Link href="/despachos" className="hover:text-lego-red transition-colors">
              POLÍTICA DE DESPACHOS Y DEVOLUCIONES
            </Link>
            <span>|</span>
            <Link href="/reembolso" className="hover:text-lego-red transition-colors">
              POLÍTICA DE REEMBOLSO DE DINERO
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Propiedad artística © {new Date().getFullYear()} CACUS GIFT COLOMBIA.</p>
          <p className="mt-2">Barranquilla, Colombia | Tel: +57 XXX XXX XXXX</p>
        </div>
      </div>
    </footer>
  );
}

