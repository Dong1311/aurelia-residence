import { ASSET_MANIFEST, type AssetId, type AssetRecord } from '@/data/assets'

const BY_ID = new Map<AssetId, AssetRecord>(ASSET_MANIFEST.map((asset) => [asset.id, asset]))

/** Which derivative `pnpm assets:fetch` produced: the 2400px master or the 960px variant. */
export type Variant = 'master' | 'compact'

export function getAsset(id: AssetId): AssetRecord {
  const asset = BY_ID.get(id)
  if (!asset) {
    // Unreachable while `AssetId` and `ASSET_MANIFEST` agree, but a clear
    // failure beats a silently broken `<img>` if the manifest is ever edited.
    throw new Error(`Unknown asset id "${id}". Check src/data/assets.ts.`)
  }
  return asset
}

/**
 * Local public path for an asset. `compact` returns the 960px derivative and is
 * used wherever the rendered box is small (thumbnails, material crops), so the
 * optimiser starts from a smaller master.
 */
export function imageSrc(id: AssetId, variant: Variant = 'master'): string {
  const { filename } = getAsset(id)
  return variant === 'compact' ? `/images/${filename}-960.webp` : `/images/${filename}.webp`
}

/** Alt text straight from the licensed manifest record. */
export function imageAlt(id: AssetId): string {
  return getAsset(id).alt
}

/**
 * Reused crops are decorative repetitions of photographs already described
 * elsewhere on the page, so they carry an empty alt attribute.
 */
export const DECORATIVE_ALT = ''
