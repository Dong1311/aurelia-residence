'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { CLIP, EASE, GALLERY, SCRUB } from '@/lib/motion'
import { DECORATIVE_ALT, imageSrc } from '@/lib/images'
import type { AssetId } from '@/data/assets'

interface Plate {
  key: string
  asset: AssetId
  variant: 'a' | 'b' | 'c' | 'd' | 'e'
  /** Drift amount in percent; sign sets the direction. Kept in the 3–5 band. */
  speed: number
  position: string
  label: string
  sizes: string
  /** Small render boxes source the 960px derivative instead of the master. */
  compact?: boolean
}

/**
 * Five plates, all re-crops of photographs already introduced elsewhere — no
 * additional downloads. Repeats are decorative and carry empty alt text so a
 * screen reader is not read the same room twice.
 *
 * Plate A is a crop of the bathing scene the spatial journey ends on, so the
 * journey reads straight through into the gallery instead of cutting.
 */
const PLATES: Plate[] = [
  {
    key: 'bathing-bridge',
    asset: 'bathroom',
    variant: 'a',
    speed: -3,
    position: '48% 48%',
    label: 'Bathing · continued',
    sizes: '(min-width: 48rem) 62vw, 92vw',
  },
  {
    key: 'stair-detail',
    asset: 'staircase',
    variant: 'b',
    speed: 5,
    position: '48% 30%',
    label: 'Vault · upper landing',
    sizes: '(min-width: 48rem) 30vw, 68vw',
    compact: true,
  },
  {
    key: 'lounge-crop',
    asset: 'living-room-editorial',
    variant: 'c',
    speed: -3,
    position: '54% 62%',
    label: 'Sunken seating · detail',
    sizes: '(min-width: 48rem) 46vw, 74vw',
    compact: true,
  },
  {
    key: 'terrace',
    asset: 'exterior-day',
    variant: 'd',
    speed: 4,
    position: '50% 78%',
    label: 'Deck & pool · west terrace',
    sizes: '(min-width: 48rem) 30vw, 68vw',
    compact: true,
  },
  {
    key: 'kitchen-wide',
    asset: 'kitchen',
    variant: 'e',
    speed: -3,
    position: '50% 52%',
    label: 'Kitchen · long section',
    sizes: '92vw',
  },
]

const MARQUEE_WORDS = ['Light', 'Stone', 'Timber', 'Glass', 'Water', 'Silence', 'Horizon']

export function EditorialGallery() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        const root = scope.current
        if (!root) return
        const select = gsap.utils.selector(root)

        // Each plate reveals and drifts on ONE scroll-linked timeline — no
        // time-based reveal racing an unrelated scrubbed parallax. The figure
        // and caption never move; only the inner image, held slightly oversized
        // so the drift never exposes an edge.
        select('.gallery__item').forEach((item) => {
          const speed = gsap.utils.clamp(-GALLERY.parallaxMax, GALLERY.parallaxMax, Number(item.getAttribute('data-speed') ?? 0))
          const inner = item.querySelector('.media__inner')
          const frame = item.querySelector('.media')
          if (!inner || !frame) return

          gsap.set(inner, { scale: GALLERY.oversize })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              end: 'bottom 10%',
              scrub: SCRUB.parallax,
              invalidateOnRefresh: true,
            },
          })

          tl.fromTo(
            frame,
            { clipPath: CLIP.hiddenBottom },
            { clipPath: CLIP.shown, ease: EASE.frame, duration: GALLERY.reveal },
            0,
          ).fromTo(
            inner,
            { yPercent: -speed },
            { yPercent: speed, ease: EASE.drift, duration: 1 },
            0,
          )
        })

        // Scroll-linked marquee — moves only while the visitor moves. Decorative,
        // so it keeps a small numeric scrub float.
        gsap.fromTo(
          '.marquee__track',
          { xPercent: 4 },
          {
            xPercent: -24,
            ease: EASE.drift,
            scrollTrigger: {
              trigger: '.marquee',
              start: 'top bottom',
              end: 'bottom top',
              scrub: SCRUB.parallax,
              invalidateOnRefresh: true,
            },
          },
        )
      })

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="gallery" id="gallery" ref={scope} tabIndex={-1}>
      <h2 className="sr-only">Editorial gallery</h2>

      <div className="shell shell--wide">
        <div className="gallery__grid">
          {PLATES.map((plate) => (
            <figure
              key={plate.key}
              className={`gallery__item gallery__item--${plate.variant}`}
              data-speed={plate.speed}
            >
              <Media
                motion
                src={imageSrc(plate.asset, plate.compact ? 'compact' : 'master')}
                // Every plate is a re-crop of a photograph already described in
                // an earlier section, so it is decorative here.
                alt={DECORATIVE_ALT}
                sizes={plate.sizes}
                imageClassName="gallery__image"
                style={{ '--plate-position': plate.position } as React.CSSProperties}
              />
              <figcaption className="gallery__label">{plate.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Sits after the bridge plate, so the gallery opens on the continued
          bathing crop and the marquee becomes a closing texture band. */}
      <div className="marquee marquee--trailing" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((pass) =>
            MARQUEE_WORDS.map((word) => <span key={`${pass}-${word}`}>{word}</span>),
          )}
        </div>
      </div>
    </section>
  )
}
