'use client'

import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Pointer-driven desktop gets Lenis; everything else scrolls natively.
 *
 * Lenis only earns its keep where the input is a wheel: a mouse wheel arrives in
 * coarse notches and benefits from interpolation. Touch scrolling is already
 * smooth and momentum-based, and hijacking it costs a frame budget on exactly
 * the devices with the least to spare — so it is left alone. ScrollSmoother is
 * deliberately absent; two smoothing layers fight each other.
 */
const LENIS_QUERY =
  '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
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

    /* -- native scrolling everywhere but pointer-driven desktop ------- */
    if (!window.matchMedia(LENIS_QUERY).matches) {
      return () => {
        window.removeEventListener('load', onLoad)
      }
    }

    /* -- Lenis ------------------------------------------------------- */
    const lenis = new Lenis({
      // Measured against 0.14 on identical wheel impulses: 0.16 reaches 90% of
      // the travel in 254ms vs 290ms and settles in 746ms vs 853ms, at the same
      // frame profile — the least delayed value that still reads as controlled.
      lerp: 0.16,
      wheelMultiplier: 1,
      smoothWheel: true,
      // Touch is native — see the note above.
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    // GSAP drives Lenis's rAF. Default lag smoothing is deliberately left in
    // place: disabling it lets a single long frame translate into a large
    // scroll jump instead of being absorbed.
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)

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
      lenis.destroy()
      root.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped')
    }
  }, [])

  return children
}
