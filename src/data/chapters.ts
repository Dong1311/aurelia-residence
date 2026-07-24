import type { AssetId } from '@/data/assets'

/** Project facts. Aurelia is fictional; the location is deliberately unplaced. */
export const PROJECT = {
  name: 'Aurelia',
  subtitle: 'House of Light',
  status: 'Completed 2026',
  area: '780 m²',
  typology: 'Coastal residence',
  location: 'Undisclosed coastline',
  discipline: 'Architecture, interiors, landscape',
  enquiryEmail: 'studio@aurelia.example',
  disclaimer:
    'Fictional concept site created for design and development demonstration. Stock photographs may depict different properties.',
} as const

export interface Chapter {
  index: string
  name: string
  asset: AssetId
  /** Two short lines, kept separate so the caption can break predictably. */
  lines: readonly [string, string]
  /** Start and end `object-position` for the slow reframe within the scene. */
  framing: { from: string; to: string }
}

export const CHAPTERS: readonly Chapter[] = [
  {
    index: '01',
    name: 'Living',
    asset: 'living-room-main',
    lines: [
      'An open room shaped by long sightlines',
      'and quiet material contrast.',
    ],
    // On wide viewports this photograph is cropped vertically, so the vertical
    // component is what actually reads: the frame lifts from the floor plane
    // towards the ceiling as the chapter plays.
    framing: { from: '74% 60%', to: '50% 34%' },
  },
  {
    index: '02',
    name: 'Kitchen',
    asset: 'kitchen',
    lines: ['Stone gathers the plan around', 'a precise, social centre.'],
    framing: { from: '48% 60%', to: '54% 44%' },
  },
  {
    index: '03',
    name: 'Passage',
    asset: 'staircase',
    lines: ['A sculptural stair turns circulation', 'into an event of light.'],
    framing: { from: '40% 38%', to: '56% 52%' },
  },
  {
    index: '04',
    name: 'Rest',
    asset: 'bedroom',
    lines: ['Private rooms soften the palette', 'and slow the rhythm.'],
    framing: { from: '52% 58%', to: '46% 42%' },
  },
  {
    index: '05',
    name: 'Bathing',
    asset: 'bathroom',
    lines: [
      'A restrained retreat composed from',
      'water, stone and reflection.',
    ],
    framing: { from: '44% 52%', to: '58% 46%' },
  },
]

export interface Material {
  index: string
  name: string
  latin: string
  body: string
  asset: AssetId
  /** Close crop: a tight `object-position` plus a scale pushes into the detail. */
  crop: { position: string; scale: number }
}

export const MATERIALS: readonly Material[] = [
  {
    index: 'M.01',
    name: 'Stone',
    latin: 'Pale travertine, honed',
    body: 'Floors and the kitchen monolith are cut from a single pale bed. Honed rather than polished, so the surface holds light instead of throwing it back.',
    asset: 'kitchen',
    crop: { position: '46% 70%', scale: 2.6 },
  },
  {
    index: 'M.02',
    name: 'Timber',
    latin: 'Coastal oak, oiled',
    body: 'Decking, soffits and the deep window reveals are oiled oak. Left to silver at the seaward edge and kept warm where the house is inhabited.',
    asset: 'exterior-day',
    crop: { position: '30% 94%', scale: 2.7 },
  },
  {
    index: 'M.03',
    name: 'Glass',
    latin: 'Low-iron, minimal frame',
    body: 'Full-height low-iron glazing removes the green cast from the sea view. Frames are recessed into the structure so the opening reads as absence.',
    asset: 'staircase',
    crop: { position: '38% 14%', scale: 2.5 },
  },
  {
    index: 'M.04',
    name: 'Water',
    latin: 'Still pool, dark bed',
    body: 'A shallow pool runs along the western terrace. Its only task is to double the sky and carry moving light back onto the underside of the roof.',
    asset: 'exterior-day',
    crop: { position: '90% 96%', scale: 2.9 },
  },
]

/** Navigation used by the header and the footer. */
export const NAV_LINKS = [
  { label: 'Project', href: '/#project' },
  { label: 'Spaces', href: '/#spaces' },
  { label: 'Materials', href: '/#materials' },
  { label: 'Credits', href: '/credits' },
] as const
