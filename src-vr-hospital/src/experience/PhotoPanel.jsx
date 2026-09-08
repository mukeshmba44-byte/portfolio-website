import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { panelVertex, panelFragment } from './shaders.js'
import { clamp, lerp, smoothstep } from '../lib/timeline.js'

const GLASS = new THREE.Color('#0e2a47')
const EDGE = new THREE.Color('#e2b569')

/**
 * One real hospital photograph, mounted as a glass panel in the corridor.
 *
 * Everything about how it reads — scale, tilt, focus, brightness — is a
 * function of where the camera is, not of a scroll-triggered class toggle. The
 * panel is turned toward the path when it is far off and squares up as the
 * camera arrives, which is what makes the run feel like walking past rooms.
 */
export default function PhotoPanel({
  photo,
  position,
  side = 1,
  width = 5.2,
  progressRef,
  window: [winStart, winEnd],
  fadeOutAfter,
  squareOn = false,
  baseTilt = 0.62,
}) {
  const texture = useLoader(THREE.TextureLoader, photo.src)
  const mesh = useRef()

  const { plane, uniforms } = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 8
    texture.needsUpdate = true

    const aspect = photo.w / photo.h
    const photoW = width
    const photoH = width / aspect
    const pad = width * 0.055
    const panelSize = [photoW + pad * 2, photoH + pad * 2]
    // Geometry runs wider than the panel so the glow has somewhere to fall off.
    const planeSize = [panelSize[0] * 1.55, panelSize[1] * 1.65]

    return {
      plane: planeSize,
      uniforms: {
        uMap: { value: texture },
        uPlane: { value: new THREE.Vector2(...planeSize) },
        uPanel: { value: new THREE.Vector2(...panelSize) },
        uPhoto: { value: new THREE.Vector2(photoW, photoH) },
        uBlur: { value: 1 },
        uOpacity: { value: 0 },
        uFocus: { value: 0 },
        uGlass: { value: GLASS },
        uEdge: { value: EDGE },
      },
    }
  }, [texture, photo.w, photo.h, width])

  useFrame(({ camera }) => {
    if (!mesh.current) return
    const p = progressRef.current.value
    const m = mesh.current

    let focus
    let opacity

    if (squareOn) {
      // The hero and closing shots are framed head-on, so they are driven by
      // their slice of scroll rather than by distance. Focus rises once and
      // then holds: walking up to the building should sharpen it and then
      // dissolve it, not smear it across the lens on the way through.
      const span = winEnd - winStart || 1e-6
      const reveal = smoothstep(winStart, winStart + span * 0.12, p)
      focus = reveal
      opacity = reveal * (1 - smoothstep(winEnd - span * 0.05, winEnd, p))
    } else {
      // Corridor panels react to where the camera actually is. Distance drives
      // focus, so a photo sharpens as the camera closes on it and softens again
      // as it slides past the edge of the frame — the same way a lens would.
      const d = camera.position.z - position[2] // > 0 while the panel is ahead
      focus = smoothstep(26, 12, d) * smoothstep(3.0, 7.5, d)
      opacity = smoothstep(34, 24, d) * smoothstep(-1.5, 2.5, d)
    }

    // The hero panel dissolves as the camera reaches the entrance, so the run
    // down the corridor reads as walking in through the front door.
    if (fadeOutAfter != null) {
      opacity *= 1 - clamp((p - fadeOutAfter) / 0.035)
    }

    m.visible = opacity > 0.004
    if (!m.visible) return

    const eased = focus * focus * (3 - 2 * focus)

    m.material.uniforms.uOpacity.value = opacity
    m.material.uniforms.uFocus.value = eased
    m.material.uniforms.uBlur.value = clamp(1 - eased * 1.15)

    m.scale.setScalar(lerp(0.86, 1, eased))

    if (squareOn) {
      m.rotation.set(0, 0, 0)
      return
    }

    // Angled toward the walkway when far away, squaring up as you arrive.
    m.rotation.y = -side * baseTilt * (1 - eased) + side * 0.28 * eased
    m.rotation.x = 0.05 - eased * 0.05
    m.rotation.z = -side * 0.03 * (1 - eased)

    // A touch of parallax: panels ease toward the walkway as they focus, then
    // drift back out as the camera goes past.
    m.position.x = position[0] * lerp(1.12, 0.9, eased)
    m.position.y = position[1] + camera.position.y * 0.12
  })

  return (
    <mesh ref={mesh} position={position} frustumCulled={false}>
      <planeGeometry args={[plane[0], plane[1], 1, 1]} />
      <shaderMaterial
        vertexShader={panelVertex}
        fragmentShader={panelFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}
