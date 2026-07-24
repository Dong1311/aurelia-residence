import type { Metadata } from 'next'
import Link from 'next/link'
import { Media } from '@/components/aurelia/Media'
import { ASSET_MANIFEST } from '@/data/assets'
import { PROJECT } from '@/data/chapters'
import { imageSrc } from '@/lib/images'

export const metadata: Metadata = {
  title: 'Image credits',
  description:
    'Photography credits and licence information for the Aurelia — House of Light demonstration site.',
}

export default function CreditsPage() {
  return (
    <section className="credits-page" tabIndex={-1}>
      <div className="shell">
        <p className="eyebrow">Colophon</p>
        <h1 className="display display--lg materials__title">Image credits</h1>

        <p className="prose-note materials__lede">
          Every photograph below is used under the{' '}
          <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer noopener">
            Pexels licence
          </a>
          . Each one is downloaded, re-encoded and served from this project&rsquo;s
          own <code>public/images</code> directory — nothing is hotlinked.
        </p>

        <div className="disclaimer-box">
          <strong>This is a fictional design demonstration.</strong> {PROJECT.disclaimer}{' '}
          Aurelia is not a real building, a real practice or a real address, and
          no photograph here should be read as depicting the project described on
          the home page. The photographs are stock images of eight different
          buildings, assembled as an art-directed narrative.
        </div>

        <div className="credits-table">
          {ASSET_MANIFEST.map((asset) => (
            <article className="credit-row" key={asset.id}>
              <Media
                className="credit-row__thumb"
                src={imageSrc(asset.id, 'compact')}
                alt=""
                sizes="12rem"
              />

              <dl>
                <dt>Role</dt>
                <dd>{asset.role}</dd>
                <dt>Photographer</dt>
                <dd>
                  <a href={asset.sourcePage} target="_blank" rel="noreferrer noopener">
                    {asset.photographer}
                  </a>
                </dd>
                <dt>Description</dt>
                <dd>{asset.alt}</dd>
              </dl>

              <dl>
                <dt>Source page</dt>
                <dd>
                  <a href={asset.sourcePage} target="_blank" rel="noreferrer noopener">
                    {asset.sourcePage}
                  </a>
                </dd>
                <dt>Pexels ID</dt>
                <dd>{asset.pexelsId}</dd>
                <dt>Licence</dt>
                <dd>
                  <a href={asset.licenseUrl} target="_blank" rel="noreferrer noopener">
                    {asset.licenseUrl}
                  </a>
                </dd>
                <dt>Local files</dt>
                <dd>
                  /images/{asset.filename}.webp
                  <br />
                  /images/{asset.filename}-960.webp
                </dd>
              </dl>
            </article>
          ))}
        </div>

        <p className="prose-note materials__lede">
          <Link href="/">Return to the residence</Link>
        </p>
      </div>
    </section>
  )
}
