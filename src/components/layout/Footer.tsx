'use client';

import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Follow Us Section */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t.footer.followUs}</h3>
            <div className={styles.socialIcons}>
              <a
                href="https://facebook.com"
                className={styles.socialIcon}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                className={`${styles.socialIcon} ${styles.instagram}`}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <button className={styles.bricksButton}>
              <span className={styles.bricksDot}>●</span>
              {t.footer.lessClicksMoreBricks}
            </button>
          </div>

          {/* Shop Section */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t.footer.shop}</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/temas" className={styles.link}>
                  {t.navigation.themes}
                </Link>
              </li>
              <li>
                <Link href="/interes" className={styles.link}>
                  {t.navigation.interest}
                </Link>
              </li>
              <li>
                <Link href="/nuevos" className={styles.link}>
                  {t.navigation.new}
                </Link>
              </li>
              <li>
                <Link href="/adultos" className={styles.link}>
                  {t.navigation.adults}
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className={styles.link}>
                  {t.navigation.offers}
                </Link>
              </li>
            </ul>
          </div>

          {/* Users Section */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t.footer.users}</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/account" className={styles.link}>
                  {t.footer.myAccount}
                </Link>
              </li>
              <li>
                <Link href="/orders" className={styles.link}>
                  {t.footer.orderHistory}
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className={styles.link}>
                  {t.footer.newsletter}
                </Link>
              </li>
              <li>
                <Link href="/programa-elite" className={styles.link}>
                  {t.footer.eliteProgram}
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Section */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t.footer.store}</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/pqr" className={styles.link}>
                  {t.footer.pqr}
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className={styles.link}>
                  {t.footer.returns}
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className={styles.link}>
                  {t.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link href="/piezas-faltantes" className={styles.link}>
                  {t.footer.missingPieces}
                </Link>
              </li>
              <li>
                <Link href="/tiendas" className={styles.link}>
                  {t.footer.ourStores}
                </Link>
              </li>
              <li>
                <Link href="/sostenible" className={styles.link}>
                  {t.footer.sustainable}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className={styles.legalSection}>
          <div className={styles.legalLinks}>
            <Link href="/legales" className={styles.legalLink}>
              {t.footer.legal}
            </Link>
            <span className={styles.separator}>|</span>
            <Link href="/privacidad" className={styles.legalLink}>
              {t.footer.privacy}
            </Link>
            <span className={styles.separator}>|</span>
            <Link href="/terminos" className={styles.legalLink}>
              {t.footer.terms}
            </Link>
            <span className={styles.separator}>|</span>
            <Link href="/despachos" className={styles.legalLink}>
              {t.footer.shipping}
            </Link>
            <span className={styles.separator}>|</span>
            <Link href="/reembolso" className={styles.legalLink}>
              {t.footer.refund}
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>{t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}</p>
          <p>{t.footer.contact}</p>
        </div>
      </div>
    </footer>
  );
}
