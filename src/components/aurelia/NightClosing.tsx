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
 * The two photographs are different buildings, so the cut has to be hidden —
 * but hiding it must not cost the viewer the picture. A narrow architectural
 * shutter (34vw) travels left to right; the night plate is revealed by a
 * clip-path whose edge tracks the centre of that bar. The seam between the two
 * buildings is therefore always underneath the bar, while the rest of the
 * viewport always shows photography. At no point is the frame covered.
 *
 * The dim pass peaks at 0.42 (never black) and is explicitly returned to 0, so
 * the overlay cannot survive on top of the finished night scene.
 */
export function NightClosing() {
  const scope = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const shutterRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        { isDesktop: MEDIA.desktop, isTablet: MEDIA.tablet, isMobile: MEDIA.mobile },
        (context) => {
          const { isDesktop, isTablet } = (context.conditions ?? {}) as Conditions
          const stage = stageRef.current
          const shutter = shutterRef.current
          if (!stage || !shutter) return

          const N = NIGHT
          const pin = isDesktop ? N.pinDesktop : isTablet ? N.pinTablet : N.pinMobile

          /* -- geometry -------------------------------------------------
             The night plate is unmasked left → right over [maskAt, maskAt+mask].
             The bar is driven at exactly the same velocity, offset so that its
             centre sits on the reveal edge for the whole crossing — the seam
             between the two buildings is never outside the bar. It enters and
             leaves fully off-screen, which is why its tween is longer than the
             mask's on both sides. */
          const barW = shutter.offsetWidth || stage.clientWidth * 0.18
          const ratio = barW / Math.max(1, stage.clientWidth)

          const shutterFrom = () => -shutter.offsetWidth * 1.5
          const shutterTo = () => stage.clientWidth + shutter.offsetWidth * 1.5
          const shutterAt = N.maskAt - N.mask * ratio
          const shutterDuration = N.mask * (1 + 3 * ratio)

          // The moment the night plate has fully covered the daylight one.
          const coveredAt = N.maskAt + N.mask

          /* -- starting state -------------------------------------------
             The night plate is present and painted from the start; only its
             mask hides it. It is never revealed by opacity. */
          gsap.set('.night__layer--night', {
            autoAlpha: 1,
            visibility: 'visible',
            clipPath: 'inset(0% 100% 0% 0%)',
          })
          gsap.set('.night__layer--day', { autoAlpha: 1, visibility: 'visible' })
          gsap.set(shutter, { x: shutterFrom, yPercent: 0 })
          gsap.set('.night__darken', { opacity: 0 })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: `+=${pin}%`,
              pin: '.night__stage',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: SCRUB.pinned,
              invalidateOnRefresh: true,
              refreshPriority: 1,
              // Promote only while the section is in play, then release, so the
              // bar does not hold a composited layer for the whole page.
              onToggle: (self) => {
                shutter.style.willChange = self.isActive ? 'transform' : 'auto'
              },
            },
          })

          // 1 — the daylight plate dims slightly. Dusk, never black.
          timeline.to(
            '.night__darken',
            { opacity: N.dimTo, ease: 'none', duration: N.dimIn },
            0,
          )

          // 2 — the night plate is unmasked left → right.
          timeline.fromTo(
            '.night__layer--night',
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: N.mask },
            N.maskAt,
          )

          // 3 — the bar rides the reveal edge, hiding the seam.
          timeline.fromTo(
            shutter,
            { x: shutterFrom },
            { x: shutterTo, ease: 'none', duration: shutterDuration },
            shutterAt,
          )

          // 4 — the night image settles from a slight scale (its only tween).
          timeline.fromTo(
            '.night__layer--night .media__inner',
            { scale: N.nightScaleFrom },
            { scale: 1, ease: 'none', duration: N.mask },
            N.maskAt,
          )

          // 5 — the dim is released, so it ends at exactly 0 over the night scene.
          timeline.to(
            '.night__darken',
            { opacity: 0, ease: 'none', duration: N.dimOut },
            N.dimOutAt,
          )

          // 6 — heading + CTA once the night image is mostly visible. Copy is an
          // independent layer, so expressive easing is fine here.
          timeline.fromTo(
            '.night__reveal',
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, ease: EASE.settle, duration: N.copyDuration, stagger: 0.07 },
            N.copyAt,
          )

          // 7 — only once the night plate completely covers it does the daylight
          // plate leave the compositor. Never before.
          timeline.set(
            '.night__layer--day',
            { autoAlpha: 0, visibility: 'hidden' },
            coveredAt,
          )

          // 8 — stable final hold before the pin releases.
          timeline.to({}, { duration: N.holdFinal }, shutterAt + shutterDuration)
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="night is-dark" id="nightfall" ref={scope} tabIndex={-1}>
      <div className="night__stage" ref={stageRef}>
        {/* Daylight plate — stays underneath; the night plate is unmasked over it. */}
        <Media
          className="night__layer night__layer--day"
          motion
          src={imageSrc('exterior-day')}
          alt={DECORATIVE_ALT}
          sizes="100vw"
        />

        {/* Dim pass over the daylight plate only (it sits below the night plate). */}
        <div className="night__darken" aria-hidden="true" />

        <Media
          className="night__layer night__layer--night media--night"
          motion
          src={imageSrc('exterior-night')}
          alt={imageAlt('exterior-night')}
          sizes="100vw"
        />

        {/* The architectural shutter: a narrow vertical bar travelling across,
            wide enough to cover the seam and nothing more. */}
        <div className="night__shutter" ref={shutterRef} aria-hidden="true">
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
