'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { PROJECT } from '@/data/chapters'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { EASE, NIGHT, SCRUB } from '@/lib/motion'
import { DECORATIVE_ALT, imageAlt, imageSrc } from '@/lib/images'

interface Conditions {
  isDesktop?: boolean
  isTablet?: boolean
  isMobile?: boolean
}

/**
 * Day turns to night.
 *
 * The daylight and night photographs are two different buildings, so a bare
 * cross-wipe would betray the cut. Instead a solid architectural shutter travels
 * across the frame: the daylight scene is dimmed, the shutter closes over it,
 * the image is swapped to night *behind* the closed panel, then the shutter
 * opens to reveal the night scene settling from a slight scale. The heading and
 * CTA arrive only once night is established. A final hold precedes the unpin.
 */
export function NightClosing() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        { isDesktop: MEDIA.desktop, isTablet: MEDIA.tablet, isMobile: MEDIA.mobile },
        (context) => {
          const { isDesktop, isMobile } = (context.conditions ?? {}) as Conditions
          const N = NIGHT

          // Night starts hidden; the shutter starts off the top edge.
          gsap.set('.night__layer--night', { autoAlpha: 0 })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: isDesktop ? '+=125%' : isMobile ? '+=80%' : '+=100%',
              pin: '.night__stage',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: SCRUB.pinned,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
          })

          // 1 — dim the daylight scene.
          timeline.fromTo(
            '.night__darken',
            { opacity: 0 },
            { opacity: 1, ease: EASE.frame, duration: N.darken },
            0,
          )

          // 2 — the shutter closes over the frame.
          const closeAt = N.darken
          timeline.fromTo(
            '.night__shutter',
            { yPercent: -102 },
            { yPercent: 0, ease: EASE.frame, duration: N.shutter },
            closeAt,
          )

          // 3 — swap day → night behind the fully-closed panel (the seam between
          // the two buildings is never on screen).
          const covered = closeAt + N.shutter
          timeline.set('.night__layer--day', { autoAlpha: 0 }, covered)
          timeline.set('.night__layer--night', { autoAlpha: 1 }, covered)

          // 4 — the night image settles from a slight scale as it is revealed
          // (its one and only scale tween).
          timeline.fromTo(
            '.night__layer--night .media__inner',
            { scale: N.nightScaleFrom },
            { scale: 1, ease: EASE.drift, duration: N.shutter + 0.6 },
            covered,
          )

          // 5 — the shutter opens, revealing night.
          timeline.fromTo(
            '.night__shutter',
            { yPercent: 0 },
            { yPercent: 102, ease: EASE.frame, duration: N.shutter },
            covered,
          )

          // 6 — heading + CTA, once night is mostly established.
          timeline.fromTo(
            '.night__reveal',
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, ease: EASE.settle, duration: 0.5, stagger: 0.12 },
            covered + N.shutter * N.copyAt,
          )

          // 7 — stable final hold before the pin releases.
          timeline.to({}, { duration: N.holdFinal }, covered + N.shutter + 0.15)
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="night is-dark" id="nightfall" ref={scope} tabIndex={-1}>
      <div className="night__stage">
        {/* Daylight plate — the surface the shutter closes over. */}
        <Media
          className="night__layer night__layer--day"
          motion
          src={imageSrc('exterior-day')}
          alt={DECORATIVE_ALT}
          sizes="100vw"
        />

        {/* Dim pass applied to the daylight scene before the shutter closes. */}
        <div className="night__darken" aria-hidden="true" />

        <Media
          className="night__layer night__layer--night media--night"
          motion
          src={imageSrc('exterior-night')}
          alt={imageAlt('exterior-night')}
          sizes="100vw"
        />

        {/* The architectural shutter — a solid panel that hides the change of
            building. The hairline rule reads it as a deliberate portal. */}
        <div className="night__shutter" aria-hidden="true">
          <span className="night__shutter-rule" />
        </div>

        <div className="night__scrim" />

        <div className="night__content shell">
          <p className="eyebrow night__reveal">04 — After hours</p>
          <h2 className="night__title display display--lg night__reveal">
            Architecture continues <em>after sunset</em>.
          </h2>

          <div className="night__actions night__reveal">
            <a className="cta" href={`mailto:${PROJECT.enquiryEmail}?subject=Aurelia%20enquiry`}>
              <i aria-hidden="true" />
              Enquire about Aurelia
            </a>
            <p className="eyebrow">{PROJECT.enquiryEmail}</p>
          </div>

          <p className="night__disclaimer night__reveal">
            Aurelia is a fictional residence. The address above is a
            demonstration placeholder and is not monitored — nothing sent to it
            will reach anyone.
          </p>
        </div>
      </div>
    </section>
  )
}
