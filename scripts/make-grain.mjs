#!/usr/bin/env node
/**
 * Generates the film-grain tile used by the `.grain` overlay.
 *
 * The overlay used to be an inline SVG `feTurbulence` painted through
 * `mix-blend-mode: overlay` on a fixed full-viewport layer. That forced the
 * compositor to re-blend the whole page every frame and was, by measurement,
 * the single largest source of scroll jank. A pre-rendered tile drawn with
 * ordinary alpha blending costs one static composited layer instead.
 *
 * Deterministic (fixed seed), so re-running produces a byte-identical tile.
 *
 * Usage: node scripts/make-grain.mjs
 */

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SIZE = 96
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'grain.webp',
)

/** Small deterministic PRNG (mulberry32) so the tile never changes. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(0x4155_5245) // "AURE"
const pixels = Buffer.alloc(SIZE * SIZE * 4)

for (let i = 0; i < SIZE * SIZE; i += 1) {
  // Monochrome speckle: some grains lighter than the page, some darker, so the
  // texture reads as film rather than as a grey wash. Alpha carries the
  // strength; the stylesheet then scales the whole layer down to ~0.045.
  const v = random()
  const tone = v < 0.5 ? 0 : 255
  const alpha = Math.round(Math.abs(v - 0.5) * 2 * 190)

  const o = i * 4
  pixels[o] = tone
  pixels[o + 1] = tone
  pixels[o + 2] = tone
  pixels[o + 3] = alpha
}

await mkdir(path.dirname(OUT), { recursive: true })

const info = await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .webp({ lossless: true, effort: 6 })
  .toFile(OUT)

process.stdout.write(
  `  grain tile → public/grain.webp  ${SIZE}×${SIZE} · ${(info.size / 1024).toFixed(1)} kB\n`,
)
