'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { heroImageReady } from '@/lib/ready'

interface MediaProps {
  src: string
  /** Empty string marks a decorative repeat of a photograph described elsewhere. */
  alt: string
  sizes: string
  className?: string
  imageClassName?: string
  style?: CSSProperties
  priority?: boolean
  quality?: number
  /** The hero photograph reports readiness so the preloader knows when to leave. */
  signalReady?: boolean
}

/**
 * A framed, fill-mode `next/image`.
 *
 * The frame carries an ivory-to-clay gradient. If an asset is missing after
 * `pnpm assets:fetch`, the gradient is what the visitor sees — a composed
 * surface rather than a broken image icon. On success the photograph fades in
 * over it, which also removes the hard pop of a late-decoding image.
 */
export function Media({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  style,
  priority = false,
  quality = 82,
  signalReady = false,
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
      className={className ? `media ${className}` : 'media'}
      data-loaded={loaded ? 'true' : 'false'}
      style={style}
    >
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
  )
}
