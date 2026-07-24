'use client'

import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { gsap, ScrollTrigger, MEDIA } from '@/lib/gsap'

/**
 * The single smooth-scroll system on the page.
 *
 * Lenis drives the scroll position and ScrollTrigger reads it — ScrollSmoother
 * is deliberately absent, because two smoothing layers fight each other. Lenis
 * is skipped entirely under `prefers-reduced-motion`, where native scrolling is
 * both faster and what the visitor asked for.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement

    /* -- pinned layouts must be re-measured once webfonts settle ---- */
    const refresh = () => ScrollTrigger.refresh()
    let fontsSettled = false
    document.fonts?.ready.then(() => {
      fontsSettled = true
      refresh()
    })
    const onLoad = () => {
      if (!fontsSettled) refresh()
    }
    window.addEventListener('load', onLoad)

    /* -- reduced motion: native scrolling, no Lenis ------------------ */
    if (window.matchMedia(MEDIA.reduced).matches) {
      return () => {
        window.removeEventListener('load', onLoad)
      }
    }

    /* -- Lenis ------------------------------------------------------- */
    const lenis = new Lenis({
      // A light lerp keeps the page responsive; heavier smoothing reads as lag.
      lerp: 0.11,
      wheelMultiplier: 1,
      smoothWheel: true,
      // Native touch scrolling is left alone — it is already smooth and
      // hijacking it breaks momentum and accessibility gestures.
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    /* -- keep in-page anchors working -------------------------------- */
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.button !== 0) return

      const anchor = (event.target as HTMLElement | null)?.closest?.('a')
      const href = anchor?.getAttribute('href')
      if (!anchor || !href) return

      // Accepts both `#spaces` and `/#spaces`, the latter used by the header so
      // the same navigation works from the credits route.
      const hash = href.startsWith('#')
        ? href
        : href.startsWith('/#') && window.location.pathname === '/'
          ? href.slice(1)
          : null
      if (!hash || hash === '#') return

      const target = document.querySelector<HTMLElement>(hash)
      if (!target) return

      // Capture phase, so this runs before React's delegated handler on the
      // root container. Without stopping propagation, `next/link` would also
      // act on the hash and the page would land twice — visibly overshooting.
      event.preventDefault()
      event.stopPropagation()

      lenis.scrollTo(target, { offset: 0 })
      // Move focus so keyboard and screen-reader users land where sighted
      // users do; `preventScroll` leaves the animation to Lenis.
      target.focus({ preventScroll: true })
      window.history.replaceState(null, '', hash)
    }

    document.addEventListener('click', onAnchorClick, true)

    return () => {
      document.removeEventListener('click', onAnchorClick, true)
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      root.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped')
    }
  }, [])

  return children
}
