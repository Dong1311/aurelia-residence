import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Every production image is a local file under `public/images/`, prepared by
    // `pnpm assets:fetch`. No remote pattern is configured on purpose — the site
    // must never hotlink a third-party image host.
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    // Next 16 requires every quality used by `next/image` to be declared.
    qualities: [75, 82, 86],
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920, 2400],
    imageSizes: [128, 256, 384, 512],
  },
}

// Next 16 no longer runs ESLint during `next build`; `pnpm lint` is the gate.

export default nextConfig
