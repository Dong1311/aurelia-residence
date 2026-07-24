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
          const slot = slotRef.current
          if (!stage || !frame || !slot) return

          const I = INTRO

          // Live destination box: the statement's portrait frame, in stage
          // coordinates. Read through functions so `invalidateOnRefresh` re-fits
          // it after any resize or pin re-measure.
          const destTop = () => slot.getBoundingClientRect().top - stage.getBoundingClientRect().top
          const destLeft = () => slot.getBoundingClientRect().left - stage.getBoundingClientRect().left
          const destWidth = () => slot.getBoundingClientRect().width
          const destHeight = () => slot.getBoundingClientRect().height

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
            },
          })

          // 0 → holdOpen: the hero holds full-bleed (no tween touches the frame).
          const reframeAt = I.holdOpen

          // Reframe: the frame's box travels from full-bleed to the portrait slot.
          // Its cover image re-fits without distortion as the aspect changes.
          timeline.fromTo(
            frame,
            {
              top: 0,
              left: 0,
              width: () => stage.clientWidth,
              height: () => stage.clientHeight,
            },
            {
              top: destTop,
              left: destLeft,
              width: destWidth,
              height: destHeight,
              ease: EASE.frame,
              duration: I.reframe,
            },
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
