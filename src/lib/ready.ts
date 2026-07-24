/**
 * Tiny one-shot signals used to sequence the opening of the page without
 * coupling the components to each other's mount order.
 *
 *   heroImageReady — the hero photograph has decoded; the preloader may leave.
 *   curtainLifted  — the preloader has finished leaving; the hero may play.
 *
 * Subscribers that arrive after a signal has fired still run, so neither
 * component needs to know which one mounted first.
 */

export interface Signal {
  /** Fires the signal. Repeat calls are ignored. */
  mark(): void
  /** Subscribes. Returns an unsubscribe function suitable for effect cleanup. */
  on(callback: () => void): () => void
  /** Whether the signal has already fired. */
  readonly fired: boolean
}

function createSignal(name: string): Signal {
  const eventName = `aurelia:${name}`
  let fired = false

  return {
    get fired() {
      return fired
    },
    mark() {
      if (fired || typeof window === 'undefined') return
      fired = true
      window.dispatchEvent(new Event(eventName))
    },
    on(callback) {
      if (typeof window === 'undefined') return () => {}
      if (fired) {
        callback()
        return () => {}
      }
      window.addEventListener(eventName, callback, { once: true })
      return () => window.removeEventListener(eventName, callback)
    },
  }
}

export const heroImageReady = createSignal('hero-image-ready')
export const curtainLifted = createSignal('curtain-lifted')
