import { useEffect, useState } from 'react'
import Lenis from 'lenis'

/**
 * Lenis drives the page instead of native scrolling, so every animation reads
 * from one inertial value rather than from raw wheel events.
 *
 * Touch smoothing is deliberately left off: phones already have good native
 * momentum, and intercepting it makes a page feel laggy rather than smooth.
 */
export function useSmoothScroll(enabled = true, { startStopped = false } = {}) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    // A scroll story that reopens halfway down is disorienting, and a restored
    // position also lands before ScrollTrigger has measured anything.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    })

    // The intro locks the page; Lenis starts stopped and is released when it
    // finishes.
    if (startStopped) instance.stop()

    let frame
    const raf = (time) => {
      instance.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    setLenis(instance)
    // Handy for debugging and for anything that needs to move the page without
    // fighting Lenis (native window.scrollTo does fight it).
    window.__lenis = instance

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      if (window.__lenis === instance) delete window.__lenis
      setLenis(null)
    }
  }, [enabled])

  return lenis
}
