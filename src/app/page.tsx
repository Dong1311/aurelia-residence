import { EditorialGallery } from '@/components/aurelia/EditorialGallery'
import { IntroSequence } from '@/components/aurelia/IntroSequence'
import { MaterialsSection } from '@/components/aurelia/MaterialsSection'
import { NightClosing } from '@/components/aurelia/NightClosing'
import { Preloader } from '@/components/aurelia/Preloader'
import { SpatialJourney } from '@/components/aurelia/SpatialJourney'

export default function HomePage() {
  return (
    <>
      <Preloader />

      {/* Hero and the architectural statement are one continuous, shared-element
          sequence — the hero photograph reframes into the statement figure. */}
      <IntroSequence />

      <SpatialJourney />
      <EditorialGallery />
      <MaterialsSection />
      <NightClosing />
    </>
  )
}
