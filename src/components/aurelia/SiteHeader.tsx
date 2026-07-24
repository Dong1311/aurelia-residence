'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { ScrollTrigger, useGSAP } from '@/lib/gsap'
import { NAV_LINKS, PROJECT } from '@/data/chapters'

/**
 * Fixed header. It carries three appearances — light over the hero photograph,
 * solid ivory over the editorial body, and light again over the night scene —
 * so the label always has contrast against whatever is behind it.
 */
export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null)

  // Only the landing page opens on a full-bleed photograph. Everywhere else the
  // header starts solid; the light-on-light variant would be invisible.
  const overHero = usePathname() === '/'

  useGSAP(() => {
    const header = headerRef.current
    if (!header || !overHero) return

    const setScrolled = (value: boolean) => header.setAttribute('data-scrolled', String(value))
    const setInverted = (value: boolean) => header.setAttribute('data-invert', String(value))

    const triggers: ScrollTrigger[] = []

    // Numeric bounds are absolute scroll positions: solid from 80px onwards.
    triggers.push(
      ScrollTrigger.create({
        start: 80,
        end: 'max',
        onToggle: (self) => setScrolled(self.isActive),
      }),
    )

    // The intro (over its full-bleed hero), the journey and the closing scene
    // are all dark surfaces — the header rides them as a light-on-dark bar.
    for (const selector of ['#project', '#spaces', '#nightfall']) {
      const element = document.querySelector<HTMLElement>(selector)
      if (!element) continue
      triggers.push(
        ScrollTrigger.create({
          trigger: element,
          start: 'top 6%',
          end: 'bottom 6%',
          onToggle: (self) => setInverted(self.isActive),
        }),
      )
    }

    return () => {
      for (const trigger of triggers) trigger.kill()
    }
  }, { dependencies: [overHero] })

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-scrolled={overHero ? 'false' : 'true'}
      data-invert="false"
    >
      <Link href="/" className="wordmark">
        {PROJECT.name}
        <small>{PROJECT.subtitle}</small>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {/* On very narrow phones only Spaces and Credits survive — Credits
            stays because the licence links must remain reachable. */}
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            data-secondary={link.label === 'Project' || link.label === 'Materials' ? 'true' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
