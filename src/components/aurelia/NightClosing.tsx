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

          // The bar travels from fully off the left edge to fully off the right.
          const barWidth = () => shutter.getBoundingClientRect().width
          const travelFrom = () => -barWidth()
          const travelTo = () => stage.clientWidth

          // The reveal edge tracks the bar's centre. Over the bar's full travel
          // (stageW + barW) the centre crosses the stage between these two
          // normalized times, so the mask runs on exactly that sub-window and
          // the seam never leaves the bar.
          const span = 1 + N.shutterWidth
          const maskStart = N.shutterWidth / 2 / span
          const maskDuration = 1 / span

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

          // 1 — the daylight plate dims. Peaks at 0.42: dusk, not black.
          timeline.fromTo(
            '.night__darken',
            { opacity: 0 },
            { opacity: N.dimTo, ease: EASE.frame, duration: N.dimIn },
            0,
          )

          // 2 — the bar crosses the frame. Scrubbed movement is linear.
          const travelAt = N.dimIn
          timeline.fromTo(
            shutter,
            { x: travelFrom },
            { x: travelTo, ease: 'none', duration: N.shutter },
            travelAt,
          )

          // 3 — the night plate is unmasked behind the bar's centre.
          timeline.fromTo(
            '.night__layer--night',
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: N.shutter * maskDuration },
            travelAt + N.shutter * maskStart,
          )

          // 4 — the night image settles from a slight scale (its only scale tween).
          timeline.fromTo(
            '.night__layer--night .media__inner',
            { scale: N.nightScaleFrom },
            { scale: 1, ease: 'none', duration: N.shutter },
            travelAt,
          )

          // 5 — the dim is released, so it is at 0 over the finished night scene.
          timeline.to(
            '.night__darken',
            { opacity: 0, ease: EASE.frame, duration: N.shutter * 0.45 },
            travelAt + N.shutter * 0.45,
          )

          // 6 — heading + CTA once the night image is mostly visible.
          timeline.fromTo(
            '.night__reveal',
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, ease: EASE.settle, duration: 0.45, stagger: 0.1 },
            travelAt + N.shutter * N.copyAt,
          )

          // 7 — stable final hold before the pin releases.
          timeline.to({}, { duration: N.holdFinal }, travelAt + N.shutter + 0.05)
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
