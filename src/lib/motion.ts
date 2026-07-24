/**
 * Central motion vocabulary for the scroll experience.
 *
 * Durations here are *timeline units* (tween seconds), not wall-clock: every
 * narrative scene is scrubbed, so the browser maps scroll distance onto these
 * proportions. Keeping them in one place is what lets the scenes share a rhythm.
 * This is deliberately a flat data file — a vocabulary, not an animation engine.
 */

/** Named eases, so intent (a frame moving vs. copy settling) is readable. */
export const EASE = {
  frame: 'power2.inOut', // clip-path masks, reframes, shutters
  settle: 'power3.out', // arrivals — copy and images coming to rest
  exit: 'power1.in', // things leaving
  drift: 'none', // linear, scrubbed parallax/drift
} as const

/**
 * Scrub configuration — the fix for double smoothing.
 *
 * `pinned` narrative scenes use `true`: scroll maps 1:1 onto the timeline and
 * rides Lenis's smoothing directly, with no second smoothing pass stacked on
 * top. Only decorative parallax keeps a small numeric lag, where a little float
 * is the point and frame-accurate sync does not matter.
 */
export const SCRUB = {
  pinned: true as const,
  parallax: 0.6,
} as const

/** clip-path keyframes shared across scenes. */
export const CLIP = {
  shown: 'inset(0% 0% 0% 0%)',
  hiddenTop: 'inset(100% 0% 0% 0%)', // reveals upward as the top inset shrinks
  hiddenBottom: 'inset(0% 0% 100% 0%)', // reveals downward as the bottom inset shrinks
} as const

/** Spatial journey — three phases per room: settle → passage → arrival. */
export const JOURNEY = {
  holdOpen: 0.6, // the first room holds, static, before anything moves
  dwell: 0.9, // a room's on-screen settle (position drift only)
  passage: 1.2, // mask reveal + the incoming image's single scale-in
  arrivalAt: 0.62, // caption + tick flip at 62% of the passage (>60% revealed)
  holdFinal: 0.9, // the last room holds before the pin releases
  incomingScale: 1.06, // incoming image starts here and settles to 1
  drift: 2.4, // yPercent settle drift within a room
} as const

/** Hero → Statement continuous shared-element sequence. */
export const INTRO = {
  holdOpen: 0.7, // hero holds full-bleed before it reframes
  reframe: 1.3, // exterior travels into the portrait statement frame
  swap: 0.95, // exterior is masked over by the interior in that frame
  copyAt: 0.5, // statement copy begins once the frame is recognizable
  holdFinal: 1.1, // completed statement layout holds before unpin
  heroScaleFrom: 1.08, // hero image settles from here across the reframe
  interiorScaleFrom: 1.06,
} as const

/** Editorial gallery — reveal and drift share one scroll-linked timeline. */
export const GALLERY = {
  reveal: 0.18, // clip reveal duration as a fraction of the plate's scroll pass
  oversize: 1.08, // held scale so the drift never exposes an edge (was 1.16)
  parallaxMax: 5, // drift speeds live in the 3–5 band now (was 6–9)
} as const

/** Night closing — an architectural shutter hides the change of building. */
export const NIGHT = {
  darken: 0.5, // the daylight scene is dimmed first
  shutter: 1, // the dark panel travels across (cover, then uncover)
  nightScaleFrom: 1.05, // night image settles from here as it is revealed
  copyAt: 0.72, // heading + CTA arrive once night is mostly established
  holdFinal: 0.8,
} as const
