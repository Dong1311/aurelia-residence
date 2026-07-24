'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { DECORATIVE_ALT, imageSrc } from '@/lib/images'
import type { AssetId } from '@/data/assets'

interface Plate {
  key: string
  asset: AssetId
  variant: 'a' | 'b' | 'c' | 'd' | 'e'
  /** Parallax amount in percent; sign sets the direction. */
  speed: number
  position: string
  label: string
  sizes: string
  /** Small render boxes source the 960px derivative instead of the master. */
  compact?: boolean
}

/**
 * Five plates, all re-crops of photographs already introduced elsewhere on the
 * page — no additional downloads. Repeats are decorative and carry empty alt
 * text so a screen reader is not read the same room twice.
 */
const PLATES: Plate[] = [
  {
    key: 'terrace',
    asset: 'exterior-day',
    variant: 'a',
    speed: -6,
    position: '50% 78%',
    label: 'Deck & pool · west terrace',
    sizes: '(min-width: 48rem) 62vw, 92vw',
  },
  {
    key: 'stair-detail',
    asset: 'staircase',
    variant: 'b',
    speed: 9,
    position: '48% 30%',
    label: 'Vault · upper landing',
    sizes: '(min-width: 48rem) 30vw, 68vw',
  },
  {
    key: 'lounge-crop',
    asset: 'living-room-editorial',
    variant: 'c',
    speed: -4,
    position: '54% 62%',
    label: 'Sunken seating · detail',
    sizes: '(min-width: 48rem) 46vw, 74vw',
    compact: true,
  },
  {
    key: 'bath-crop',
    asset: 'bathroom',
    variant: 'd',
    speed: 7,
    position: '62% 46%',
    label: 'Bathing court · basin wall',
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

        // Scroll-linked marquee. Deliberately not an autoplaying loop — it moves
        // only while the visitor moves, and stops when they do.
        gsap.fromTo(
          '.marquee__track',
          { xPercent: 4 },
          {
            xPercent: -26,
            ease: 'none',
            scrollTrigger: {
              trigger: '.marquee',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        )

        // Plates drift at their own rates, which is what makes the grid read as
        // layered rather than as a row of cards.
        //
        // The drift is applied to the photograph *inside* its frame, not to the
        // figure. Moving the figures themselves made neighbouring plates
        // overlap their own captions at the extremes of the range; this keeps
        // the layout fixed and the movement purely optical. The images are held
        // slightly oversized so no edge is ever exposed.
        select('.gallery__item').forEach((item) => {
          const speed = Number(item.getAttribute('data-speed') ?? 0)
          const image = item.querySelector('img')

          if (image) {
            gsap.fromTo(
              image,
              { yPercent: -speed, scale: 1.16 },
              {
                yPercent: speed,
                scale: 1.16,
                ease: 'none',
                scrollTrigger: {
                  trigger: item,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                  invalidateOnRefresh: true,
                },
              },
            )
          }

          gsap.fromTo(
            item.querySelector('.media'),
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.3,
              ease: 'power3.out',
              scrollTrigger: { trigger: item, start: 'top 88%', once: true },
            },
          )
        })
      })

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="gallery" id="gallery" ref={scope} tabIndex={-1}>
      <h2 className="sr-only">Editorial gallery</h2>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((pass) =>
            MARQUEE_WORDS.map((word) => <span key={`${pass}-${word}`}>{word}</span>),
          )}
        </div>
      </div>

      <div className="shell shell--wide">
        <div className="gallery__grid">
          {PLATES.map((plate) => (
            <figure
              key={plate.key}
              className={`gallery__item gallery__item--${plate.variant}`}
              data-speed={plate.speed}
            >
              <Media
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
    </section>
  )
}
