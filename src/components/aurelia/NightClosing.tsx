'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { PROJECT } from '@/data/chapters'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { DECORATIVE_ALT, imageAlt, imageSrc } from '@/lib/images'

interface Conditions {
  isDesktop?: boolean
  isTablet?: boolean
  isMobile?: boolean
}

/**
 * Day turns to night.
 *
 * The daylight exterior sits underneath and the night photograph is wiped down
 * over it with a vertical `clip-path` mask, driven by scroll. The heading and
 * the enquiry action arrive once the wipe has passed the halfway point.
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

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: isDesktop ? '+=110%' : isMobile ? '+=65%' : '+=85%',
              pin: '.night__stage',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: 0.8,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
          })

          timeline
            .fromTo(
              '.night__layer--night',
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 },
              0,
            )
            .fromTo(
              '.night__layer--day img',
              { scale: 1.06 },
              { scale: 1, ease: 'none', duration: 1, immediateRender: false },
              0,
            )
            .fromTo(
              '.night__reveal',
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                ease: 'power3.out',
                duration: 0.5,
                stagger: 0.12,
                immediateRender: false,
              },
              0.55,
            )
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="night is-dark" id="nightfall" ref={scope} tabIndex={-1}>
      <div className="night__stage">
        {/* Daylight plate — the surface the night is wiped over. */}
        <Media
          className="night__layer night__layer--day"
          src={imageSrc('exterior-day')}
          alt={DECORATIVE_ALT}
          sizes="100vw"
        />

        <Media
          className="night__layer night__layer--night media--night"
          src={imageSrc('exterior-night')}
          alt={imageAlt('exterior-night')}
          sizes="100vw"
        />

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
