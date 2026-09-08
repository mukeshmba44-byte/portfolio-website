/**
 * The spine of the whole site: one 0→1 scroll value, carved into sections.
 *
 * Both the 3D camera and the HTML overlay read these numbers, so the copy can
 * never fall out of sync with where the camera actually is in the scene.
 */

import { facilities } from '../data/content.js'

export const SECTIONS = {
  hero: [0.0, 0.13],
  facilities: [0.13, 0.68],
  trust: [0.68, 0.88],
  closing: [0.88, 1.0],
}

/** Total scroll distance, in viewport heights. */
export const SCROLL_VH = 800

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t

/** 0 below `a`, 1 above `b`, smooth in between. */
export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a || 1e-6))
  return t * t * (3 - 2 * t)
}

/** Normalised position (0→1) within a section. */
export function within(progress, [start, end]) {
  return clamp((progress - start) / (end - start))
}

/* ── Corridor layout ────────────────────────────────────────────────────── */

export const HERO_PANEL_Z = -6
export const CLOSING_PANEL_Z = -146

/**
 * How far ahead of the camera a panel sits when it is at its sharpest. Panels
 * are placed *from* the camera path rather than on a fixed grid, so the moment
 * a photo comes into focus always lines up with the moment its caption appears,
 * whatever easing the path uses.
 */
const FOCUS_DISTANCE = 9.5

/** How far off the walkway the panels hang. Wide enough that the camera passes
 *  beside them rather than through them. */
const PANEL_OFFSET = 5.5

const Z_KEYS = [
  [0.0, 8],
  // Stops 7.5 units short of the building rather than reaching its plane: the
  // hero photo pushes in to fill the frame and dissolves there.
  [SECTIONS.hero[1], HERO_PANEL_Z + 7.5],
  [SECTIONS.facilities[1], -104],
  [SECTIONS.trust[1], -128],
  [1.0, CLOSING_PANEL_Z + 9],
]

function piecewise(keys, p) {
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, v0] = keys[i]
    const [p1, v1] = keys[i + 1]
    if (p <= p1 || i === keys.length - 2) {
      const t = clamp((p - p0) / (p1 - p0 || 1e-6))
      // Ease each leg slightly so the camera settles rather than snapping
      // between sections.
      return lerp(v0, v1, t * t * (3 - 2 * t) * 0.35 + t * 0.65)
    }
  }
  return keys[keys.length - 1][1]
}

/** How far down the corridor the camera has travelled at a given progress. */
export function cameraZ(progress) {
  return piecewise(Z_KEYS, progress)
}

/**
 * Where each facility photo hangs, and the slice of scroll during which it is
 * the panel in focus.
 */
export const PANEL_LAYOUT = facilities.map((facility, i) => {
  const [fStart, fEnd] = SECTIONS.facilities
  const span = (fEnd - fStart) / facilities.length
  const side = i % 2 === 0 ? -1 : 1
  const focusAt = fStart + (i + 0.5) * span
  return {
    ...facility,
    index: i,
    side,
    focusAt,
    position: [
      side * (PANEL_OFFSET + 0.35 * Math.sin(i * 1.3)),
      0.1 + 0.42 * Math.sin(i * 1.9),
      cameraZ(focusAt) - FOCUS_DISTANCE,
    ],
    window: [fStart + i * span, fStart + (i + 1) * span],
  }
})

/**
 * Camera position for a given scroll progress. The lateral drift is damped to
 * zero at both ends so the hero and the closing shot are square-on to the
 * building photo, and only meanders through the corridor in between.
 */
export function cameraAt(progress, out = { x: 0, y: 0, z: 0 }) {
  const drift =
    smoothstep(SECTIONS.hero[1] - 0.04, SECTIONS.facilities[0] + 0.08, progress) *
    (1 - smoothstep(SECTIONS.trust[1] - 0.06, SECTIONS.closing[0] + 0.05, progress))

  out.x = Math.sin(progress * 9.4) * 0.85 * drift
  out.y = 0.25 + Math.sin(progress * 6.1 + 0.8) * 0.36 * drift
  out.z = cameraZ(progress)
  return out
}

/** Which facility panel is currently closest to focus, or -1 outside the run. */
export function activePanelIndex(progress) {
  const [start, end] = SECTIONS.facilities
  // Held strictly inside the run so a caption never sits over the hero shot or
  // over the stats that follow it.
  if (progress < start || progress >= end - 0.005) return -1
  const span = (end - start) / PANEL_LAYOUT.length
  return clamp(Math.floor((progress - start) / span), 0, PANEL_LAYOUT.length - 1)
}
