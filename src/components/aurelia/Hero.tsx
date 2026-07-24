import { Media } from '@/components/aurelia/Media'
import { PROJECT } from '@/data/chapters'
import { imageAlt, imageSrc } from '@/lib/images'

const META = [
  { label: 'Typology', value: PROJECT.typology },
  { label: 'Status', value: PROJECT.status },
  { label: 'Area', value: PROJECT.area },
  { label: 'Scope', value: 'Architecture & interiors' },
]

/**
 * The opening frame. Markup only — every animation lives in `HeroTransition`,
 * which keeps this a server component and ships no JavaScript of its own.
 */
export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__viewport">
        <div className="hero__frame">
          <Media
            className="hero__media"
            src={imageSrc('exterior-day')}
            alt={imageAlt('exterior-day')}
            sizes="100vw"
            priority
            quality={86}
            signalReady
          />
          <div className="hero__scrim" />
        </div>

        {/* A thin architectural grid, drawn in during the pinned sequence. */}
        <div className="hero__grid" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="hero__content">
          <h1 className="hero__title display display--xl">
            <span className="sr-only">
              {PROJECT.name} — {PROJECT.subtitle}
            </span>
            {/* Split so the two halves can drift apart on scroll. The accessible
                name is carried by the visually hidden line above. */}
            <span className="hero__line hero__line--a" aria-hidden="true">
              House
            </span>
            <span className="hero__line hero__line--b" aria-hidden="true">
              of Light
            </span>
          </h1>

          <p className="hero__caption eyebrow">
            {PROJECT.name} · {PROJECT.location} · {PROJECT.status}
          </p>

          <div className="hero__foot">
            <dl className="hero__meta">
              {META.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="hero__cue">
              <i aria-hidden="true" />
              Scroll
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
