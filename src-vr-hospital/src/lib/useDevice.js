import { useCallback, useEffect, useState } from 'react'

/**
 * Decides which experience to render.
 *
 *   'immersive' — the full WebGL scroll-scrubbed camera path
 *   'lite'      — 2D parallax + fade using the same photos and copy
 *
 * The lite path exists for devices where a WebGL scrub is the wrong trade: a
 * phone on mobile data, a machine that cannot run it, or someone who has asked
 * for less motion. It is a fallback, not a punishment — anything capable of the
 * 3D version should get it, and the visitor can always overrule the guess.
 *
 * Precedence: an explicit choice (this session's toggle, or ?mode= in the URL)
 * always wins over the guess below.
 */

const STORAGE_KEY = 'vr-hospital:mode'

function fromQuery() {
  if (typeof window === 'undefined') return null
  const mode = new URLSearchParams(window.location.search).get('mode')
  if (mode === 'lite' || mode === '2d') return 'lite'
  if (mode === '3d' || mode === 'immersive') return 'immersive'
  return null
}

function fromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'lite' || stored === 'immersive' ? stored : null
  } catch {
    return null
  }
}

let webglCache
function hasWebGL() {
  if (webglCache !== undefined) return webglCache
  try {
    const canvas = document.createElement('canvas')
    webglCache = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    webglCache = false
  }
  return webglCache
}

/** The guess, used only when the visitor has not chosen for themselves. */
export function detectMode() {
  if (typeof window === 'undefined') return 'lite'

  // Asked for less motion, or cannot draw it at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'lite'
  if (!hasWebGL()) return 'lite'

  // Asked for less data.
  const conn = navigator.connection
  if (conn && (conn.saveData || /(^|-)[23]g$/.test(conn.effectiveType || ''))) return 'lite'

  // Genuinely weak hardware. Four cores is an ordinary laptop.
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) {
    return 'lite'
  }

  const width = window.innerWidth
  const coarse = window.matchMedia('(pointer: coarse)').matches

  // A small viewport has nowhere to put the scene.
  if (width < 900) return 'lite'

  // A touch screen on its own means nothing — plenty of capable laptops have
  // one. Paired with a phone-or-small-tablet viewport, it means a phone.
  if (coarse && width < 1024) return 'lite'

  return 'immersive'
}

export function useExperienceMode() {
  const [chosen, setChosen] = useState(() => fromQuery() ?? fromStorage())
  const [detected, setDetected] = useState(detectMode)

  useEffect(() => {
    // Re-guess on a real viewport change (rotation, window resize), never on
    // the small resizes mobile browsers fire while scrolling.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (Math.abs(window.innerWidth - lastWidth) < 80) return
      lastWidth = window.innerWidth
      setDetected(detectMode())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const choose = useCallback((mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Private browsing; the choice still holds for this page view.
    }
    setChosen(mode)
    window.scrollTo(0, 0)
  }, [])

  return [chosen ?? detected, choose]
}
