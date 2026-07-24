/**
 * Canonical photography records for AURELIA — House of Light.
 *
 * Every photograph is licensed under the Pexels license and is downloaded,
 * re-encoded and served locally by `scripts/fetch-assets.mjs`. The attribution
 * fields below (`photographer`, `sourcePage`, `pexelsId`, `licenseUrl`) are a
 * licence obligation of this repository and must not be removed.
 *
 * Keep this list byte-for-byte in sync with `ASSET_MANIFEST` in
 * `scripts/fetch-assets.mjs`.
 */

export type AssetId =
  | 'exterior-day'
  | 'exterior-night'
  | 'living-room-main'
  | 'living-room-editorial'
  | 'kitchen'
  | 'staircase'
  | 'bedroom'
  | 'bathroom'

export interface AssetRecord {
  id: AssetId
  pexelsId: number
  filename: string
  role: string
  photographer: string
  sourcePage: string
  directDownloadUrl: string
  licenseUrl: string
  alt: string
}

export const ASSET_MANIFEST: readonly AssetRecord[] = [
  {
    id: 'exterior-day',
    pexelsId: 28586202,
    filename: 'exterior-day',
    role: 'Primary hero exterior',
    photographer: 'Jonathan Borba',
    sourcePage:
      'https://www.pexels.com/photo/modern-luxury-home-with-glass-facade-and-pool-28586202/',
    directDownloadUrl:
      'https://images.pexels.com/photos/28586202/pexels-photo-28586202.jpeg?cs=srgb&dl=pexels-jonathanborba-28586202.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Modern white residence with a glass facade, timber deck and swimming pool',
  },
  {
    id: 'exterior-night',
    pexelsId: 12975922,
    filename: 'exterior-night',
    role: 'Closing night scene',
    photographer: 'Jahangir Alam Jahan',
    sourcePage:
      'https://www.pexels.com/photo/a-house-with-a-swimming-pool-at-night-12975922/',
    directDownloadUrl:
      'https://images.pexels.com/photos/12975922/pexels-photo-12975922.jpeg?cs=srgb&dl=pexels-jahangir-alam-jahan-279240197-12975922.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Illuminated modern house and swimming pool at night',
  },
  {
    id: 'living-room-main',
    pexelsId: 7534563,
    filename: 'living-room-main',
    role: 'Living room chapter',
    photographer: 'Max Vakhtbovych',
    sourcePage:
      'https://www.pexels.com/photo/luxury-living-room-in-modern-apartment-7534563/',
    directDownloadUrl:
      'https://images.pexels.com/photos/7534563/pexels-photo-7534563.jpeg?cs=srgb&dl=pexels-artbovich-7534563.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Spacious luxury apartment with a light-filled living and dining area',
  },
  {
    id: 'living-room-editorial',
    pexelsId: 15173314,
    filename: 'living-room-editorial',
    role: 'Editorial image and layered gallery',
    photographer: 'alleksana',
    sourcePage: 'https://www.pexels.com/photo/modern-interior-design-15173314/',
    directDownloadUrl:
      'https://images.pexels.com/photos/15173314/pexels-photo-15173314.jpeg?cs=srgb&dl=pexels-alleksana-15173314.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Minimalist neutral-toned interior with a curved wooden table',
  },
  {
    id: 'kitchen',
    pexelsId: 15220867,
    filename: 'kitchen',
    role: 'Kitchen chapter',
    photographer: 'Hiba Q. Omar',
    sourcePage:
      'https://www.pexels.com/photo/modern-minimalist-kitchen-interior-design-15220867/',
    directDownloadUrl:
      'https://images.pexels.com/photos/15220867/pexels-photo-15220867.jpeg?cs=srgb&dl=pexels-hiba-q-omar-106562569-15220867.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Modern kitchen with a marble island, timber cabinetry and pendant lights',
  },
  {
    id: 'staircase',
    pexelsId: 15535457,
    filename: 'staircase',
    role: 'Architectural detail chapter',
    photographer: 'Denys Gromov',
    sourcePage:
      'https://www.pexels.com/photo/interior-staircase-of-modern-building-15535457/',
    directDownloadUrl:
      'https://images.pexels.com/photos/15535457/pexels-photo-15535457.jpeg?cs=srgb&dl=pexels-jdgromov-15535457.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Sculptural curved staircase in a bright contemporary interior',
  },
  {
    id: 'bedroom',
    pexelsId: 7598140,
    filename: 'bedroom',
    role: 'Bedroom chapter',
    photographer: 'Max Vakhtbovych',
    sourcePage:
      'https://www.pexels.com/photo/luxury-contemporary-bedroom-interior-design-7598140/',
    directDownloadUrl:
      'https://images.pexels.com/photos/7598140/pexels-photo-7598140.jpeg?cs=srgb&dl=pexels-artbovich-7598140.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Spacious contemporary bedroom with large windows and neutral furniture',
  },
  {
    id: 'bathroom',
    pexelsId: 7031574,
    filename: 'bathroom',
    role: 'Bathroom chapter',
    photographer: 'Max Vakhtbovych',
    sourcePage:
      'https://www.pexels.com/photo/minimalist-luxury-interior-design-of-modern-bathroom-7031574/',
    directDownloadUrl:
      'https://images.pexels.com/photos/7031574/pexels-photo-7031574.jpeg?cs=srgb&dl=pexels-artbovich-7031574.jpg&fm=jpg',
    licenseUrl: 'https://www.pexels.com/license/',
    alt: 'Minimalist light-gray bathroom with a freestanding bathtub and double sinks',
  },
]

export const HERO_ASSET_ID: AssetId = 'exterior-day'

/** Attribution grouped by photographer, for the footer and the credits page. */
export const PHOTOGRAPHERS = Array.from(
  ASSET_MANIFEST.reduce((map, asset) => {
    const existing = map.get(asset.photographer) ?? []
    existing.push(asset)
    map.set(asset.photographer, existing)
    return map
  }, new Map<string, AssetRecord[]>()),
).map(([name, assets]) => ({ name, assets }))
