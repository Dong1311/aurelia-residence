'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

/**
 * Single registration point for GSAP. ES modules are evaluated once per bundle,
 * so importing from here guarantees the plugins are registered exactly once and
 * never during server rendering.
 */
let registered = false

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
  registered = true
}

/** Media queries shared by every scroll scene, so breakpoints stay consistent. */
export const MEDIA = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  tablet: '(min-width: 640px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 639.98px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const

export { gsap, ScrollTrigger, useGSAP }
