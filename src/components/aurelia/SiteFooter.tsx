import Link from 'next/link'
import { ASSET_MANIFEST } from '@/data/assets'
import { NAV_LINKS, PROJECT } from '@/data/chapters'

const LICENSE_URL = 'https://www.pexels.com/license/'

/**
 * Footer and image credits. Every photographer is named and linked to the exact
 * Pexels page the photograph came from — this is a licence obligation, not
 * decoration, so it is rendered on every page rather than hidden behind a link.
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
              {PROJECT.typology} · {PROJECT.area} · {PROJECT.status}. A fictional
              project developed as a design and engineering study.
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

          <div>
            <h2 className="eyebrow">Photography</h2>
            <ul className="credits-list">
              {ASSET_MANIFEST.map((asset) => (
                <li key={asset.id}>
                  <strong>{asset.role}</strong> —{' '}
                  <a href={asset.sourcePage} target="_blank" rel="noreferrer noopener">
                    {asset.photographer} on Pexels
                  </a>
                </li>
              ))}
            </ul>
            <p className="prose-note footer__license">
              All photographs are used under the{' '}
              <a href={LICENSE_URL} target="_blank" rel="noreferrer noopener">
                Pexels licence
              </a>
              . Full details on the{' '}
              <Link href="/credits">credits page</Link>.
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p>{PROJECT.disclaimer}</p>
          <p>© {PROJECT.name} — a demonstration, not a company.</p>
        </div>
      </div>
    </footer>
  )
}
