'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { CHAPTERS } from '@/data/chapters'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { imageAlt, imageSrc } from '@/lib/images'

interface Conditions {
  isDesktop?: boolean
  isTablet?: boolean
  isMobile?: boolean
}

/**
 * Five rooms on one pinned timeline.
 *
 * Each scene is wiped in over the one before with a `clip-path` mask while the
 * outgoing photograph keeps drifting, so the change reads as moving through a
 * building rather than as a cross-fade. A single ScrollTrigger drives the whole
 * sequence, the chapter caption and the progress rule.
 *
 * Under reduced motion no timeline is built at all: the stylesheet returns the
 * five chapters to ordinary stacked document flow.
 */
export function SpatialJourney() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        { isDesktop: MEDIA.desktop, isTablet: MEDIA.tablet, isMobile: MEDIA.mobile },
        (context) => {
          const { isDesktop, isMobile } = (context.conditions ?? {}) as Conditions
          const root = scope.current
          if (!root) return

          const select = gsap.utils.selector(root)
          const frames = select('.journey__media')
          const images = frames.map((frame) => frame.querySelector('img'))
          const captions = select('.journey__caption')
          const ticks = select('.journey__ticks li')
          const fill = select('.journey__fill')[0]

          const count = Math.min(frames.length, captions.length)
          if (count < 2 || !fill) return

          /* -- initial state -------------------------------------------- */

          select('.journey__chapter').forEach((chapter, index) => {
            gsap.set(chapter, { zIndex: index + 1 })
          })
          gsap.set(frames.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' })
          gsap.set(captions.slice(1), { opacity: 0, y: 28 })

          /* -- driver ---------------------------------------------------- */

          // Scroll length per chapter. A phone gets roughly half the travel of a
          // desktop, so the section never becomes an endurance test.
          const perChapter = isDesktop ? 105 : isMobile ? 55 : 80
          const setFill = gsap.quickSetter(fill, 'scaleX')
          let activeTick = 0

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: `+=${perChapter * count}%`,
              pin: '.journey__stage',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: 0.8,
              invalidateOnRefresh: true,
              // Pins refresh from the top of the document downwards.
              refreshPriority: 2,
              onUpdate: (self) => {
                setFill(self.progress)
                // Chapter n owns timeline time n, and the caption swap happens
                // around n + 0.5 — so round rather than floor, or the tick lags
                // the room name by half a transition.
                const time = self.progress * (self.animation?.duration() ?? count)
                const next = Math.max(0, Math.min(count - 1, Math.floor(time + 0.5)))
                if (next !== activeTick) {
                  ticks[activeTick]?.setAttribute('data-active', 'false')
                  ticks[next]?.setAttribute('data-active', 'true')
                  activeTick = next
                }
              },
            },
          })

          /* -- one transition per room boundary -------------------------- */

          for (let index = 0; index < count - 1; index += 1) {
            const at = index
            const outgoingImage = images[index]
            const incomingFrame = frames[index + 1]
            const incomingImage = images[index + 1]
            const outgoingCaption = captions[index]
            const incomingCaption = captions[index + 1]

            if (outgoingImage && !isMobile) {
              timeline.to(outgoingImage, { scale: 1.14, ease: 'none', duration: 1 }, at)
            }

            if (outgoingCaption) {
              timeline.to(
                outgoingCaption,
                { opacity: 0, y: -26, ease: 'power1.in', duration: 0.4 },
                at,
              )
            }

            if (incomingFrame) {
              // The mask, not the opacity, is what carries the transition.
              timeline.to(
                incomingFrame,
                { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 },
                at,
              )
            }

            if (incomingImage) {
              timeline.fromTo(
                incomingImage,
                { scale: isMobile ? 1.08 : 1.18 },
                { scale: 1, ease: 'power2.out', duration: 1.25, immediateRender: false },
                at,
              )
            }

            if (incomingCaption) {
              timeline.to(
                incomingCaption,
                { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 },
                at + 0.45,
              )
            }
          }

          /* -- slow reframe inside each room ------------------------------ */

          // Skipped on phones: stacking another animated property on top of the
          // mask is not worth the paint cost there.
          if (!isMobile) {
            CHAPTERS.forEach((chapter, index) => {
              const image = images[index]
              if (!image) return
              timeline.to(
                image,
                { objectPosition: chapter.framing.to, ease: 'none', duration: 1.4 },
                Math.max(0, index - 0.4),
              )
            })
          }

          // Hold on the final room so it is not cut short by the unpin.
          timeline.to({}, { duration: 0.55 }, count - 1)

          return () => {
            setFill(0)
            ticks.forEach((tick, index) =>
              tick.setAttribute('data-active', index === 0 ? 'true' : 'false'),
            )
          }
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="journey is-dark" id="spaces" ref={scope} tabIndex={-1}>
      <h2 className="sr-only">The spatial journey through Aurelia</h2>

      <div className="journey__stage">
        <div className="journey__scenes">
          {CHAPTERS.map((chapter) => (
            <article className="journey__chapter" key={chapter.index}>
              <Media
                className="journey__media"
                src={imageSrc(chapter.asset)}
                alt={imageAlt(chapter.asset)}
                sizes="100vw"
                // Starting crop; the timeline drifts it towards `framing.to`.
                style={{ '--frame-from': chapter.framing.from } as React.CSSProperties}
              />
              <div className="journey__caption">
                <p className="journey__index">
                  <span>Chapter {chapter.index}</span>
                  <i aria-hidden="true" />
                </p>
                <h3 className="journey__name display">{chapter.name}</h3>
                <p className="journey__lines">
                  <span>{chapter.lines[0]}</span>
                  <span>{chapter.lines[1]}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="journey__progress" aria-hidden="true">
          <div className="journey__track">
            <span className="journey__fill" />
          </div>
          <ol className="journey__ticks">
            {CHAPTERS.map((chapter, index) => (
              <li key={chapter.index} data-active={index === 0 ? 'true' : 'false'}>
                {chapter.index}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
