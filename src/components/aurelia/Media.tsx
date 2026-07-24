'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { heroImageReady } from '@/lib/ready'

interface MediaProps {
  src: string
  /** Empty string marks a decorative repeat of a photograph described elsewhere. */
  alt: string
  sizes: string
  className?: string
  /** Class for the inner transform wrapper — the element GSAP scales/drifts. */
  innerClassName?: string
  imageClassName?: string
  style?: CSSProperties
  priority?: boolean
  quality?: number
  /** The hero photograph reports readiness so the preloader knows when to leave. */
  signalReady?: boolean
  /**
   * Motion mode. When set, the photograph carries no CSS opacity fade — GSAP is
   * the only system that reveals it (via the frame's clip-path mask). Used by
   * Journey, Gallery and NightClosing so a scene never fights its own load-in.
   */
  motion?: boolean
  /**
   * Rendered inside the frame, as a sibling of the transform wrapper — so it is
   * clipped by the frame's mask but unaffected by the image's transform. Used
   * for per-scene scrims.
   */
  children?: ReactNode
}

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * A framed, fill-mode `next/image` with a dedicated inner transform wrapper.
 *
 *   .media        — the frame. Owns the clip-path mask and the gradient/veil.
 *   .media__inner — the only element GSAP transforms (scale / x / y).
 *
 * Splitting the two means a scene can mask its frame and drift its image
 * independently, without the two tweens landing on the same node. The frame's
 * ivory-to-clay gradient is the graceful fallback if an asset is missing after
 * `pnpm assets:fetch`.
 */
export function Media({
  src,
  alt,
  sizes,
  className,
  innerClassName,
  imageClassName,
  style,
  priority = false,
  quality = 82,
  signalReady = false,
  motion = false,
  children,
}: MediaProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  // An image restored from cache can finish before React attaches `onLoad`.
  useEffect(() => {
    const image = frameRef.current?.querySelector('img')
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true)
      if (signalReady) heroImageReady.mark()
    }
  }, [signalReady])

  const handleSettled = () => {
    setLoaded(true)
    if (signalReady) heroImageReady.mark()
  }

  return (
    <div
      ref={frameRef}
      className={cx('media', motion && 'media--motion', className)}
      data-loaded={loaded ? 'true' : 'false'}
      style={style}
    >
      <div className={cx('media__inner', innerClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={imageClassName}
          onLoad={handleSettled}
          // A failed request must not stall the opening sequence.
          onError={handleSettled}
        />
      </div>
      {children}
    </div>
  )
}
