import { useState } from 'react'

/**
 * The 3D walkthrough is the site. This only answers one question: can this
 * browser draw it at all?
 *
 * There is no lite/immersive choice any more — everyone gets the 3D version.
 * The 2D build survives solely as a safety net for a browser with no WebGL,
 * which would otherwise be shown a blank page.
 */

let webglCache
export function hasWebGL() {
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

export function useCanRender3D() {
  const [ok] = useState(() => (typeof window === 'undefined' ? true : hasWebGL()))
  return ok
}

/** Respected for the intro animation, never for which experience is shown. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
