'use client'

import { useRef } from 'react'
import { Media } from '@/components/aurelia/Media'
import { CHAPTERS } from '@/data/chapters'
import { gsap, useGSAP, MEDIA } from '@/lib/gsap'
import { CLIP, EASE, JOURNEY, SCRUB } from '@/lib/motion'
import { imageAlt, imageSrc } from '@/lib/images'

interface Conditions {
  isDesktop?: boolean
  isTablet?: boolean
  isMobile?: boolean
}

/**
 * Five rooms on one pinned, scrubbed timeline.
 *
 * Each room gets three explicit phases:
 *   settle  — the room holds and drifts gently in place (position only)
 *   passage — the next room's frame masks in while its image scales down once
 *   arrival — the caption and tick appear after 60% of the new image is revealed
 *
 * Two rules keep it clean:
 *   • every image is scaled by exactly ONE tween (its passage scale-in). Its
 *     settle drift touches only yPercent, so no two tweens ever fight `scale`.
 *   • the frame owns the mask; the inner wrapper owns the transform — they never
 *     animate the same node.
 *
 * The progress rule, room name and tick are read from the timeline's own
 * `progress()` / `time()` inside `onUpdate` — never from `self.progress` — so
 * under numeric scrub the UI tracks the frame actually on screen and the three
 * always change together.
 *
 * Under reduced motion no timeline is built; the stylesheet returns the rooms to
 * ordinary stacked document flow.
 */
export function SpatialJourney() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        { isDesktop: MEDIA.desktop, isTablet: MEDIA.tablet, isMobile: MEDIA.mobile },
        (context) => {
          const { isDesktop, isMobile } = (context.conditions ?? {}) as Conditions
          const root = scope.current
          if (!root) return

          const select = gsap.utils.selector(root)
          const frames = select('.journey__media') // outer: mask only
          const inners = frames.map((frame) => frame.querySelector('.media__inner'))
          const captions = select('.journey__caption')
          const ticks = select('.journey__ticks li')
          const fill = select('.journey__fill')[0]

          const count = Math.min(frames.length, captions.length)
          if (count < 2 || !fill) return

          const J = JOURNEY
          const drift = isMobile ? J.drift * 0.6 : J.drift

          /* -- initial state -------------------------------------------- */

          select('.journey__chapter').forEach((chapter, index) => {
            gsap.set(chapter, { zIndex: index + 1 })
          })
          gsap.set(frames.slice(1), { clipPath: CLIP.hiddenTop })
          gsap.set(captions.slice(1), { autoAlpha: 0, y: 28 })

          /* -- driver --------------------------------------------------- */

          // Scroll length per room. A phone gets roughly half a desktop's travel.
          const perChapter = isDesktop ? 100 : isMobile ? 55 : 78
          const setFill = gsap.quickSetter(fill, 'scaleX')
          // The time at which each room becomes active — filled as we build, read
          // by onUpdate to flip the tick in lockstep with the room name.
          const chapterStart: number[] = [0]
          let activeTick = 0

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: `+=${perChapter * count}%`,
              pin: '.journey__stage',
              pinSpacing: true,
              anticipatePin: 1,
              scrub: SCRUB.pinned,
              invalidateOnRefresh: true,
              refreshPriority: 2,
              onUpdate: (self) => {
                const tl = self.animation as gsap.core.Timeline | undefined
                if (!tl) return
                setFill(tl.progress())
                const time = tl.time()
                let next = 0
                for (let k = 0; k < chapterStart.length; k += 1) {
                  if (time + 1e-4 >= chapterStart[k]!) next = k
                }
                if (next !== activeTick) {
                  ticks[activeTick]?.setAttribute('data-active', 'false')
                  ticks[next]?.setAttribute('data-active', 'true')
                  activeTick = next
                }
              },
            },
          })

          /* -- opening hold + room 0 settle ----------------------------- */

          // Room 0 is static from 0 → holdOpen (holds before the first passage),
          // then drifts gently in place (position only — never scale).
          let at = J.holdOpen
          if (inners[0]) {
            timeline.fromTo(
              inners[0],
              { yPercent: 0 },
              { yPercent: drift, ease: EASE.drift, duration: J.dwell },
              at,
            )
          }
          timeline.addLabel(CHAPTERS[0]?.name.toLowerCase() ?? 'room-0', 0)
          at += J.dwell

          /* -- one passage per room boundary ---------------------------- */

          for (let i = 0; i < count - 1; i += 1) {
            const passStart = at
            const outInner = inners[i]
            const inFrame = frames[i + 1]
            const inInner = inners[i + 1]
            const outCap = captions[i]
            const inCap = captions[i + 1]

            // Outgoing room keeps drifting (position only) as it is covered.
            if (outInner) {
              timeline.to(
                outInner,
                { yPercent: drift * 1.7, ease: EASE.drift, duration: J.passage },
                passStart,
              )
            }

            // Outgoing caption leaves in the first part of the passage.
            if (outCap) {
              timeline.to(
                outCap,
                { autoAlpha: 0, y: -24, ease: EASE.exit, duration: J.passage * 0.4 },
                passStart,
              )
            }

            // The mask carries the transition — the frame is the only thing clipped.
            if (inFrame) {
              timeline.fromTo(
                inFrame,
                { clipPath: CLIP.hiddenTop },
                { clipPath: CLIP.shown, ease: EASE.frame, duration: J.passage },
                passStart,
              )
            }

            // The incoming image's ONE and only scale tween, plus a small settle
            // in position. It finishes at passStart + passage, well before the
            // next passage (passStart + passage + dwell).
            if (inInner) {
              timeline.fromTo(
                inInner,
                { scale: J.incomingScale, yPercent: -drift },
                { scale: 1, yPercent: 0, ease: EASE.settle, duration: J.passage },
                passStart,
              )
            }

            // Arrival: caption appears once ≥60% of the new image is revealed.
            const arrivalTime = passStart + J.passage * J.arrivalAt
            if (inCap) {
              timeline.fromTo(
                inCap,
                { autoAlpha: 0, y: 28 },
                { autoAlpha: 1, y: 0, ease: EASE.settle, duration: J.dwell * 0.7 },
                arrivalTime,
              )
            }
            chapterStart[i + 1] = arrivalTime
            timeline.addLabel(
              CHAPTERS[i + 1]?.name.toLowerCase() ?? `room-${i + 1}`,
              arrivalTime,
            )

            at = passStart + J.passage

            // Incoming room settle drift (position only) — begins only after its
            // scale-in has completely finished.
            if (inInner) {
              timeline.fromTo(
                inInner,
                { yPercent: 0 },
                { yPercent: drift, ease: EASE.drift, duration: J.dwell },
                at,
              )
            }
            at += J.dwell
          }

          // Stable final hold before the pin releases.
          timeline.to({}, { duration: J.holdFinal }, at)

          return () => {
            setFill(0)
            ticks.forEach((tick, index) =>
              tick.setAttribute('data-active', index === 0 ? 'true' : 'false'),
            )
          }
        },
      )

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section className="journey is-dark" id="spaces" ref={scope} tabIndex={-1}>
      <h2 className="sr-only">The spatial journey through Aurelia</h2>

      <div className="journey__stage">
        <div className="journey__scenes">
          {CHAPTERS.map((chapter) => (
            <article className="journey__chapter" key={chapter.index}>
              <Media
                className="journey__media"
                motion
                src={imageSrc(chapter.asset)}
                alt={imageAlt(chapter.asset)}
                sizes="100vw"
                // Static opening crop per room — no longer animated.
                style={{ '--frame-from': chapter.framing.from } as React.CSSProperties}
              />
              <div className="journey__caption">
                <p className="journey__index">
                  <span>Chapter {chapter.index}</span>
                  <i aria-hidden="true" />
                </p>
                <h3 className="journey__name display">{chapter.name}</h3>
                <p className="journey__lines">
                  <span>{chapter.lines[0]}</span>
                  <span>{chapter.lines[1]}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="journey__progress" aria-hidden="true">
          <div className="journey__track">
            <span className="journey__fill" />
          </div>
          <ol className="journey__ticks">
            {CHAPTERS.map((chapter, index) => (
              <li key={chapter.index} data-active={index === 0 ? 'true' : 'false'}>
                {chapter.index}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
