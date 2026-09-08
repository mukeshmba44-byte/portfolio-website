import { useEffect, useState } from 'react'

/**
 * Decides which experience to render.
 *
 *   'immersive' — the full WebGL scroll-scrubbed camera path (desktop/pointer)
 *   'lite'      — 2D parallax + fade using the same photos and copy
 *
 * The lite path exists because a full WebGL scrub is expensive to download and
 * to run; on a phone on mobile data it is the wrong trade. `?mode=lite` and
 * `?mode=3d` force either version, which is handy for testing and for showing
 * the 3D version on a laptop that reports a touch screen.
 */

const QUERY_OVERRIDE = () => {
  if (typeof window === 'undefined') return null
  const mode = new URLSearchParams(window.location.search).get('mode')
  if (mode === 'lite' || mode === '2d') return 'lite'
  if (mode === '3d' || mode === 'immersive') return 'immersive'
  return null
}

function detect() {
  const override = QUERY_OVERRIDE()
  if (override) return override

  if (typeof window === 'undefined') return 'lite'

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 1024
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Only genuinely weak machines. Four cores is an ordinary laptop, and this
  // scene is a dozen textured quads and a point cloud — well within it.
  const lowCore =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 2

  // Save-Data / slow connection is an explicit request for the cheap version.
  const conn = typeof navigator !== 'undefined' ? navigator.connection : null
  const thrifty =
    !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))

  if (coarse || small || reduced || lowCore || thrifty) return 'lite'
  return hasWebGL() ? 'immersive' : 'lite'
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

export function useExperienceMode() {
  const [mode, setMode] = useState(() => detect())

  useEffect(() => {
    // Only react to a genuine viewport change (rotation, window resize), and
    // never re-decide while the user is mid-scroll on a resize-on-scroll mobile
    // browser — hence the width check rather than a raw resize handler.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (Math.abs(window.innerWidth - lastWidth) < 80) return
      lastWidth = window.innerWidth
      setMode(detect())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return mode
}
