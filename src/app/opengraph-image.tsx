import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Aurelia — House of Light. A fictional coastal residence, completed 2026.'

/**
 * Built from the local hero plate prepared by `pnpm assets:fetch`.
 *
 * The file is inlined as a data URI because the OG renderer has no access to
 * the running server, and it is a JPEG rather than a WebP because Satori — the
 * renderer behind `next/og` — cannot decode WebP. If the plate is missing the
 * card falls back to the ivory gradient, so the build never fails on it.
 */
async function heroDataUri(): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), 'public', 'images', 'og-hero.jpg')
    const buffer = await readFile(file)
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const hero = await heroDataUri()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundImage: 'linear-gradient(150deg, #f5f2eb 0%, #e2dbcc 48%, #cabda6 100%)',
        }}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '1200px',
              height: '630px',
              objectFit: 'cover',
              objectPosition: '50% 42%',
            }}
          />
        ) : null}

        {/* Satori needs an explicit box and `backgroundImage` for gradients —
            the `background` shorthand on an inset-only element renders nothing,
            which leaves the type sitting on bare white building. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '630px',
            display: 'flex',
            backgroundImage:
              'linear-gradient(to bottom, rgba(16,15,14,0.62) 0%, rgba(16,15,14,0.32) 38%, rgba(16,15,14,0.88) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '64px 72px',
            color: '#f5f2eb',
          }}
        >
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 12, textTransform: 'uppercase' }}>
            Aurelia
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', fontSize: 104, lineHeight: 1 }}>House of Light</div>
            <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, opacity: 0.82 }}>
              Coastal residence · 780 m² · Completed 2026
            </div>
            <div style={{ display: 'flex', fontSize: 17, letterSpacing: 1, opacity: 0.6 }}>
              Fictional concept site · stock photography
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
