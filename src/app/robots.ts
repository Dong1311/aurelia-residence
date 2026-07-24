import type { MetadataRoute } from 'next'

/**
 * Aurelia does not exist. Keeping the demonstration out of search indexes stops
 * a fictional building from turning up as if it were a real property.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
