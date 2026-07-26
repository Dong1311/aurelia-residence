import type { MetadataRoute } from 'next'

/** Open to search engines. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
  }
}
