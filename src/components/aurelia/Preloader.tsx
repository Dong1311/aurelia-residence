'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { curtainLifted, heroImageReady } from '@/lib/ready'

/** Never hold the page hostage to a slow network. */
const MAX_WAIT_MS = 3200

/**
 * A curtain, not a loading screen.
 *
 * It leaves as soon as the local hero photograph has decoded — there is no
 * padded timer and no fake percentage. Under reduced motion it is a short
 * opacity fade instead of a wipe.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const reduced = window.matchMedia(MEDIA.reduced).matches

      const exit = gsap.timeline({
        paused: true,
        onComplete: () => {
          setHidden(true)
          curtainLifted.mark()
        },
      })

      if (reduced) {
        exit.to(root, { autoAlpha: 0, duration: 0.25, ease: 'none' })
      } else {
        exit
          .to('.preloader__fill', { scaleX: 1, duration: 0.5, ease: 'power2.inOut' })
          .to('.preloader__mark', { opacity: 0, y: -12, duration: 0.55, ease: 'power2.in' }, '-=0.15')
          .to('.preloader__bar', { opacity: 0, duration: 0.3, ease: 'none' }, '<')
          .to(
            root,
            { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'power3.inOut' },
            '-=0.3',
          )
      }

      // A slow creep while waiting, so the line is honest about "working"
      // without pretending to know a percentage.
      const creep = reduced
        ? null
        : gsap.to('.preloader__fill', { scaleX: 0.72, duration: 1.8, ease: 'power1.out' })

      const start = () => {
        creep?.kill()
        exit.play()
      }

      const unsubscribe = heroImageReady.on(start)
      const timer = window.setTimeout(start, MAX_WAIT_MS)

      return () => {
        unsubscribe()
        window.clearTimeout(timer)
      }
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className="preloader" hidden={hidden}>
      {/* Without JavaScript the curtain would never lift. */}
      <noscript>
        <style>{'.preloader{display:none!important}'}</style>
      </noscript>
      <p className="preloader__mark">Aurelia</p>
      <div className="preloader__bar">
        <span className="preloader__fill" />
      </div>
      <span className="sr-only" role="status">
        Loading the Aurelia residence
      </span>
    </div>
  )
}
