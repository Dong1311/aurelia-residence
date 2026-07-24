import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

/** An "A" monogram drawn in code — no font file and no downloaded asset. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#100f0e',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          {/* Two strokes and a crossbar: the letter as a section drawing. */}
          <path d="M14 50 L32 14 L50 50" stroke="#f5f2eb" strokeWidth="3.5" fill="none" />
          <path d="M22 40 L42 40" stroke="#cabda6" strokeWidth="2.5" />
        </svg>
      </div>
    ),
    size,
  )
}
