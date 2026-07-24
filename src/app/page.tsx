import { EditorialGallery } from '@/components/aurelia/EditorialGallery'
import { Hero } from '@/components/aurelia/Hero'
import { HeroTransition } from '@/components/aurelia/HeroTransition'
import { MaterialsSection } from '@/components/aurelia/MaterialsSection'
import { NightClosing } from '@/components/aurelia/NightClosing'
import { Preloader } from '@/components/aurelia/Preloader'
import { SpatialJourney } from '@/components/aurelia/SpatialJourney'
import { StatementSection } from '@/components/aurelia/StatementSection'

export default function HomePage() {
  return (
    <>
      <Preloader />

      {/* Hero markup is a server component; HeroTransition owns its motion. */}
      <HeroTransition>
        <Hero />
      </HeroTransition>

      <StatementSection />
      <SpatialJourney />
      <EditorialGallery />
      <MaterialsSection />
      <NightClosing />
    </>
  )
}
