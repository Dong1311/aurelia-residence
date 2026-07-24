'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { curtainLifted } from '@/lib/ready'

interface Conditions {
  isDesktop?: boolean
  isTablet?: boolean
  isMobile?: boolean
}

/**
 * Owns every hero animation: the settling intro, and the pinned sequence that
 * reframes the photograph, drifts the title apart, draws the architectural grid
 * and clips the image down into an editorial plate before releasing the scroll.
 *
 * All selectors are scoped to this subtree, all tweens live inside a `useGSAP`
 * context, and the `matchMedia` instance is reverted on unmount — so nothing
 * leaks and nothing is created during server rendering.
 */
export function HeroTransition({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      /* ---------------- intro ---------------------------------------- */

      mm.add(MEDIA.motion, () => {
        const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

        intro
          .fromTo('.hero__media', { scale: 1.08 }, { scale: 1, duration: 2.1, ease: 'power2.out' }, 0)
          .from(
            '.hero__line',
            { yPercent: 45, opacity: 0, duration: 1.25, stagger: 0.14 },
            0.15,
          )
          .from('.hero__meta > div', { y: 22, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.55)
          .from('.hero__cue', { opacity: 0, duration: 0.8 }, 0.9)

        // Hold the reveal until the curtain has actually lifted.
        const unsubscribe = curtainLifted.on(() => intro.play())
        return () => unsubscribe()
      })

      /* ---------------- pinned transformation ------------------------ */

      mm.add(
        { isDesktop: MEDIA.desktop, isTablet: MEDIA.tablet, isMobile: MEDIA.mobile },
        (context) => {
          const { isDesktop, isMobile } = (context.conditions ?? {}) as Conditions

          // Shorter journeys on smaller screens: a phone should not spend two
          // screen-heights of scrolling on a single frame.
          const distance = isDesktop ? '+=140%' : isMobile ? '+=80%' : '+=110%'
          const inset = isDesktop
            ? 'inset(14% 12% 14% 12%)'
            : isMobile
              ? 'inset(9% 5% 9% 5%)'
              : 'inset(11% 8% 11% 8%)'

          const timeline = gsap.timeline({
            defaults: { ease: 'none', duration: 1, immediateRender: false },
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: distance,
              pin: '.hero__viewport',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: 1,
              invalidateOnRefresh: true,
              // Pins are refreshed top-down so their spacing stays consistent.
              refreshPriority: 3,
            },
          })

          timeline
            .fromTo(
              '.hero__media',
              { scale: 1, yPercent: 0 },
              { scale: isMobile ? 1.1 : 1.2, yPercent: isMobile ? -2 : -5, ease: 'power1.in' },
              0,
            )
            .fromTo(
              '.hero__frame',
              { clipPath: 'inset(0% 0% 0% 0%)' },
              { clipPath: inset, ease: 'power2.inOut' },
              0,
            )
            .fromTo('.hero__scrim', { opacity: 1 }, { opacity: 0.4 }, 0)
            .fromTo(
              '.hero__line--a',
              { xPercent: 0, yPercent: 0, opacity: 1 },
              { xPercent: isMobile ? -6 : -14, yPercent: -55, opacity: 0, ease: 'power1.in' },
              0,
            )
            .fromTo(
              '.hero__line--b',
              { xPercent: 0, yPercent: 0, opacity: 1 },
              { xPercent: isMobile ? 6 : 14, yPercent: 55, opacity: 0, ease: 'power1.in' },
              0,
            )
            .fromTo(
              ['.hero__meta', '.hero__cue'],
              { opacity: 1, y: 0 },
              { opacity: 0, y: -18, duration: 0.45 },
              0,
            )

          if (!isMobile) {
            timeline
              .fromTo(
                '.hero__grid span',
                { scaleY: 0, opacity: 0 },
                { scaleY: 1, opacity: 0.5, duration: 0.55, stagger: 0.05, ease: 'power2.out' },
                0.08,
              )
              .to('.hero__grid span', { opacity: 0.14, duration: 0.35 }, 0.72)
          }

          timeline.fromTo(
            '.hero__caption',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.6,
          )
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return <div ref={scope}>{children}</div>
}
