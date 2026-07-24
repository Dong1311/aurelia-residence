'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { PROJECT } from '@/data/chapters'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { CLIP, EASE, INTRO, SCRUB } from '@/lib/motion'
import { imageAlt, imageSrc } from '@/lib/images'
import { curtainLifted } from '@/lib/ready'

interface Conditions {
  isDesktop?: boolean
  isTablet?: boolean
  isMobile?: boolean
}

const META = [
  { label: 'Typology', value: PROJECT.typology },
  { label: 'Status', value: PROJECT.status },
  { label: 'Area', value: PROJECT.area },
  { label: 'Scope', value: 'Architecture & interiors' },
]

const NOTES = [
  {
    title: 'Orientation',
    body: 'The plan is set on an east–west axis. Rooms are measured by the hour they are used rather than by the function they carry.',
  },
  {
    title: 'Section',
    body: 'A single roof plane lifts toward the water. Its underside is finished in oiled timber so the low afternoon sun is returned into the plan.',
  },
  {
    title: 'Threshold',
    body: 'There is no front door in the conventional sense — arrival is a sequence of three shaded openings, each narrower than the last.',
  },
  {
    title: 'Restraint',
    body: 'Four materials, no more. Everything that could have been a detail was resolved as a joint or left out entirely.',
  },
]

/**
 * Hero → Statement as ONE continuous, shared-element sequence.
 *
 * The hero photograph does not shrink into a centred landscape and vanish.
 * Instead a single frame travels: it holds full-bleed, then reframes so its box
 * exactly matches the destination portrait frame of the statement, the exterior
 * is masked over by the interior inside that now-stable frame, and only then
 * does the statement copy resolve. It closes on the completed statement layout
 * and holds before releasing.
 *
 * The reframe is a genuine shared-element morph animated manually
 * (top/left/width/height, recomputed on every refresh). Flip.fit does the same
 * width/height morph under the hood, but computing the box ourselves keeps it
 * deterministic under pin + scrub + responsive refresh, so Flip would be novelty
 * here rather than leverage.
 *
 * Under reduced motion nothing pins: the stylesheet lays the exterior banner,
 * the interior figure and the copy out in ordinary document order.
 */
export function IntroSequence() {
  const scope = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      /* -- hero title intro (plays once the curtain lifts) ------------- */

      mm.add(MEDIA.motion, () => {
        const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        intro
          .from('.intro__hero .hero__line', { yPercent: 45, opacity: 0, duration: 1.2, stagger: 0.14 }, 0.1)
          .from('.intro__hero .hero__meta > div', { y: 22, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.5)
          .from('.intro__hero .hero__cue', { opacity: 0, duration: 0.8 }, 0.85)

        const unsubscribe = curtainLifted.on(() => intro.play())
        return () => unsubscribe()
      })

      /* -- pinned shared-element sequence ----------------------------- */

      mm.add(
        { isDesktop: MEDIA.desktop, isTablet: MEDIA.tablet, isMobile: MEDIA.mobile },
        (context) => {
          const { isDesktop, isMobile } = (context.conditions ?? {}) as Conditions
          const stage = stageRef.current
          const frame = frameRef.current
          const inner = innerRef.current
          const slot = slotRef.current
          if (!stage || !frame || !inner || !slot) return

          const I = INTRO

          /* -- shared-element geometry ---------------------------------
             The frame's box never changes. Its visible window is a clip-path,
             and the photography inside is moved by ONE uniform transform.

             A cover-fitted image is always drawn at `scale × source`, so moving
             between two cover-fits (the stage, then the slot) is always a
             uniform scale plus a translation — no distortion, and no layout.
             Every value is read through a function so `invalidateOnRefresh`
             re-measures it after a resize or a pin re-measure. */

          const dest = () => {
            const s = slot.getBoundingClientRect()
            const t = stage.getBoundingClientRect()
            return { left: s.left - t.left, top: s.top - t.top, width: s.width, height: s.height }
          }

          // Source aspect of the travelling photograph (both plates are 2:3).
          const ratio = () => {
            const img = inner.querySelector<HTMLImageElement>('.intro__interior img')
            return img && img.naturalWidth > 0 ? img.naturalWidth / img.naturalHeight : 2 / 3
          }

          // Cover scale for a box, up to the shared 1/sourceHeight factor.
          const cover = (w: number, h: number, r: number) => Math.max(w / r, h)

          const scaleTo = () => {
            const d = dest()
            const r = ratio()
            return cover(d.width, d.height, r) / cover(stage.clientWidth, stage.clientHeight, r)
          }
          const xTo = () => {
            const d = dest()
            return d.left + d.width / 2 - stage.clientWidth / 2
          }
          const yTo = () => {
            const d = dest()
            return d.top + d.height / 2 - stage.clientHeight / 2
          }
          const clipTo = () => {
            const d = dest()
            const right = stage.clientWidth - (d.left + d.width)
            const bottom = stage.clientHeight - (d.top + d.height)
            return `inset(${d.top}px ${right}px ${bottom}px ${d.left}px)`
          }

          gsap.set('.intro__interior', { clipPath: CLIP.hiddenBottom })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: isDesktop ? '+=175%' : isMobile ? '+=120%' : '+=150%',
              pin: '.intro__stage',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: SCRUB.pinned,
              invalidateOnRefresh: true,
              refreshPriority: 4,
              // Promote the moving layer only while the intro is in play, then
              // release it — no permanently-composited full-screen layer.
              onToggle: (self) => {
                inner.style.willChange = self.isActive ? 'transform' : 'auto'
              },
            },
          })

          // 0 → holdOpen: the hero holds full-bleed (no tween touches the frame).
          const reframeAt = I.holdOpen

          // Reframe, part 1 — the visible window contracts to the slot rect.
          // clip-path is paint-only; the old width/height/top/left animation
          // forced a layout of this subtree on every scrubbed frame.
          timeline.fromTo(
            frame,
            { clipPath: 'inset(0px 0px 0px 0px)' },
            { clipPath: clipTo, ease: EASE.frame, duration: I.reframe },
            reframeAt,
          )

          // Reframe, part 2 — the photography inside travels to the slot with a
          // single uniform scale + translate.
          timeline.fromTo(
            inner,
            { x: 0, y: 0, scale: 1 },
            { x: xTo, y: yTo, scale: scaleTo, ease: EASE.frame, duration: I.reframe },
            reframeAt,
          )

          // Hero title + scrim leave as the frame reframes.
          timeline.to(
            '.intro__hero',
            { autoAlpha: 0, y: -30, ease: EASE.exit, duration: I.reframe * 0.55 },
            reframeAt,
          )
          timeline.to('.intro__scrim', { autoAlpha: 0, ease: EASE.frame, duration: I.reframe }, reframeAt)

          // Exterior settles from a slight scale across the reframe (its one
          // and only scale tween).
          timeline.fromTo(
            '.intro__exterior .media__inner',
            { scale: I.heroScaleFrom },
            { scale: 1, ease: EASE.drift, duration: I.reframe },
            reframeAt,
          )

          // Swap: inside the now-stable frame, the interior masks over the
          // exterior and settles from its own slight scale.
          const swapAt = reframeAt + I.reframe
          timeline.fromTo(
            '.intro__interior',
            { clipPath: CLIP.hiddenBottom },
            { clipPath: CLIP.shown, ease: EASE.frame, duration: I.swap },
            swapAt,
          )
          timeline.fromTo(
            '.intro__interior .media__inner',
            { scale: I.interiorScaleFrom },
            { scale: 1, ease: EASE.drift, duration: I.swap },
            swapAt,
          )

          // Copy resolves once the destination frame is recognizable.
          timeline.fromTo(
            '.intro__copy',
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, ease: EASE.settle, duration: 0.6, stagger: 0.08 },
            swapAt + I.swap * I.copyAt,
          )

          // Completed-layout hold before the pin releases.
          timeline.to({}, { duration: I.holdFinal }, swapAt + I.swap + 0.1)
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="intro is-hero" id="project" ref={scope} tabIndex={-1}>
      <div className="intro__stage" ref={stageRef}>
        {/* The travelling shared frame — full-bleed, then the portrait slot. */}
        <div className="intro__frame" ref={frameRef}>
          {/* The only transformed layer — the frame above it just changes its
              clip window, so neither element ever animates layout. */}
          <div className="intro__frame-inner" ref={innerRef}>
            <Media
              className="intro__exterior"
              motion
              priority
              quality={86}
              signalReady
              src={imageSrc('exterior-day')}
              alt={imageAlt('exterior-day')}
              sizes="100vw"
            />
            <Media
              className="intro__interior"
              motion
              src={imageSrc('living-room-editorial')}
              alt={imageAlt('living-room-editorial')}
              sizes="(min-width: 60rem) 45vw, 100vw"
            />
          </div>
        </div>

        {/* Hero title contrast scrim (fades as the frame reframes). */}
        <div className="intro__scrim" aria-hidden="true" />

        {/* Hero title layer, over the full-bleed frame. */}
        <div className="intro__hero">
          <h1 className="hero__title display display--xl">
            <span className="sr-only">
              {PROJECT.name} — {PROJECT.subtitle}
            </span>
            <span className="hero__line hero__line--a" aria-hidden="true">
              House
            </span>
            <span className="hero__line hero__line--b" aria-hidden="true">
              of Light
            </span>
          </h1>

          <div className="intro__hero-foot">
            <dl className="hero__meta">
              {META.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="hero__cue">
              <i aria-hidden="true" />
              Scroll
            </p>
          </div>
        </div>

        {/* Statement layout (destination). Copy hidden until the frame lands. */}
        <div className="intro__layout">
          <div className="intro__grid">
            <div className="intro__head">
              <p className="eyebrow intro__copy">01 — The idea</p>
              <h2 className="intro__title display display--lg intro__copy">
                Designed around the changing character of <em>daylight</em>.
              </h2>

              <div className="intro__notes">
                {NOTES.map((note) => (
                  <div className="intro__note intro__copy" key={note.title}>
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <figure className="intro__figure">
              {/* Destination box. Empty under motion; carries the interior
                  figure under reduced motion, where nothing travels into it. */}
              <div className="intro__slot" ref={slotRef}>
                <Media
                  className="intro__slot-media"
                  src={imageSrc('living-room-editorial')}
                  alt={imageAlt('living-room-editorial')}
                  sizes="(min-width: 60rem) 45vw, 100vw"
                />
              </div>
              <figcaption className="intro__figcaption intro__copy">
                <span>Terrace lounge, west</span>
                <span>Fig. 01</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
