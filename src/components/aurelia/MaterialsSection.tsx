'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { MATERIALS } from '@/data/chapters'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { DECORATIVE_ALT, imageSrc } from '@/lib/images'


/**
 * A sticky heading against a scrolling column of material notes.
 *
 * The four swatches are tight crops of photographs already on the page — the
 * surface is the subject, so the crop is pushed in with a transform rather than
 * by fetching another image.
 */
export function MaterialsSection() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        const root = scope.current
        if (!root) return
        const select = gsap.utils.selector(root)

        gsap.from('[data-reveal]', {
          y: 28,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: 'top 74%', once: true },
        })

        select('.material').forEach((material) => {
          gsap.from(material, {
            y: 40,
            opacity: 0,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: material, start: 'top 86%', once: true },
          })

          // A short drift inside the crop keeps the swatch alive without
          // pretending the camera moved.
          gsap.fromTo(
            material.querySelector('.material__frame img'),
            { yPercent: -3 },
            {
              yPercent: 3,
              ease: 'none',
              scrollTrigger: {
                trigger: material,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        })
      })

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="materials" id="materials" ref={scope} tabIndex={-1}>
      <div className="shell materials__grid">
        <div className="materials__sticky">
          <p className="eyebrow" data-reveal>
            03 — Palette
          </p>
          <h2 className="display display--lg materials__title" data-reveal>
            Four materials, <em>held still</em>.
          </h2>
          <p className="prose-note materials__lede" data-reveal>
            Aurelia is built from a deliberately short list. Each surface was
            chosen for how it behaves at the two ends of the day rather than for
            how it photographs at noon.
          </p>
        </div>

        <ol className="materials__list">
          {MATERIALS.map((material) => (
            <li className="material" key={material.index}>
              <Media
                className="material__frame"
                // The master, not the 960px derivative: these crops magnify a
                // small region, so they need the detail.
                src={imageSrc(material.asset)}
                // A close crop of a room described elsewhere — decorative.
                alt={DECORATIVE_ALT}
                // The swatch is 14rem wide but its image is scaled ~2.6x inside
                // the frame, so it needs a correspondingly larger source to
                // stay sharp — hence a `sizes` value far above the box width.
                sizes="(min-width: 40rem) 600px, 240vw"
                style={
                  {
                    '--crop-scale': material.crop.scale,
                    '--plate-position': material.crop.position,
                  } as React.CSSProperties
                }
              />

              <div className="material__body">
                <div className="material__meta">
                  <span className="eyebrow">{material.index}</span>
                  <span className="eyebrow">{material.latin}</span>
                </div>
                <h3 className="display">{material.name}</h3>
                <p>{material.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
