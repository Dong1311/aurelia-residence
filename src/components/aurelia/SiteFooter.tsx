import Link from 'next/link'
import { NAV_LINKS, PROJECT } from '@/data/chapters'

/**
 * Site footer: brand, navigation and the site copyright. Photography
 * attribution now lives solely on the /credits page.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer is-dark" id="credits">
      <div className="shell">
        <div className="footer__top">
          <div>
            <p className="wordmark">
              {PROJECT.name}
              <small>{PROJECT.subtitle}</small>
            </p>
            <p className="prose-note footer__lede">
              {PROJECT.typology} · {PROJECT.area} · {PROJECT.status}. Architecture
              shaped around natural light, stone, timber and water.
            </p>

            <nav aria-label="Footer">
              <ul className="footer__nav">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Seawintech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
