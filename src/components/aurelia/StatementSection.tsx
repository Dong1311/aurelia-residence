'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { imageAlt, imageSrc } from '@/lib/images'

const NOTES = [
  {
    title: 'Orientation',
    body: 'The plan is set on an east–west axis. Rooms are measured by the hour they are used rather than by the function they carry.',
  },
  {
    title: 'Section',
    body: 'A single roof plane lifts toward the water. Its underside is finished in oiled timber so the low afternoon sun is returned into the plan.',
  },
  {
    title: 'Threshold',
    body: 'There is no front door in the conventional sense — arrival is a sequence of three shaded openings, each narrower than the last.',
  },
  {
    title: 'Restraint',
    body: 'Four materials, no more. Everything that could have been a detail was resolved as a joint or left out entirely.',
  },
]

/**
 * The architectural statement. Asymmetric by construction: the text column
 * starts low and the image column runs tall, with a slow parallax inside a
 * fixed clipped frame so the crop moves without the layout moving.
 */
export function StatementSection() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        // Copy settles as it arrives.
        gsap.from('[data-reveal]', {
          y: 34,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: scope.current,
            start: 'top 72%',
            once: true,
          },
        })

        // Mild parallax inside the clipped frame. The layer is oversized in CSS
        // so no edge is ever exposed.
        gsap.fromTo(
          '.statement__parallax',
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: {
              trigger: '.statement__frame',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9,
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
    <section className="statement" id="project" ref={scope} tabIndex={-1}>
      <div className="shell statement__grid">
        <div className="statement__head">
          <p className="eyebrow" data-reveal>
            01 — The idea
          </p>
          <h2 className="statement__title display display--lg" data-reveal>
            Designed around the changing character of <em>daylight</em>.
          </h2>

          <div className="statement__notes">
            {NOTES.map((note) => (
              <div className="statement__note" key={note.title} data-reveal>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </div>
            ))}
          </div>
        </div>

        <figure className="statement__figure">
          <div className="statement__frame">
            <Media
              className="statement__parallax"
              src={imageSrc('living-room-editorial')}
              alt={imageAlt('living-room-editorial')}
              sizes="(min-width: 60rem) 40vw, 92vw"
            />
          </div>
          <figcaption className="statement__figcaption">
            <span>Terrace lounge, west</span>
            <span>Fig. 01</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
