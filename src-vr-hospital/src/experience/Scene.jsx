import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import PhotoPanel from './PhotoPanel.jsx'
import Particles from './Particles.jsx'
import DepartmentRing from './DepartmentRing.jsx'
import { backdropVertex, backdropFragment } from './shaders.js'
import { photos } from '../data/content.js'
import {
  PANEL_LAYOUT,
  SECTIONS,
  HERO_PANEL_Z,
  CLOSING_PANEL_Z,
  cameraAt,
  clamp,
  lerp,
  smoothstep,
} from '../lib/timeline.js'

const cameraTarget = { x: 0, y: 0, z: 0 }
const lookAhead = { x: 0, y: 0, z: 0 }
const _look = new THREE.Vector3()

/**
 * Moves the camera along the corridor. The whole scene is a function of one
 * scrubbed scroll value: there are no per-section triggers, so the motion is
 * continuous and reverses exactly when the user scrolls back up.
 */
function CameraRig({ progressRef }) {
  const { camera } = useThree()
  const roll = useRef(0)
  const lastX = useRef(0)

  useFrame((_, delta) => {
    const p = progressRef.current.value
    cameraAt(p, cameraTarget)

    camera.position.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)

    // Look a little further down the corridor than the camera has reached, and
    // lean toward whichever panel is currently in focus.
    cameraAt(Math.min(1, p + 0.035), lookAhead)

    const inCorridor =
      smoothstep(SECTIONS.hero[1] - 0.02, SECTIONS.facilities[0] + 0.06, p) *
      (1 - smoothstep(SECTIONS.trust[1] - 0.04, SECTIONS.closing[0] + 0.04, p))

    let leanX = 0
    for (const panel of PANEL_LAYOUT) {
      const centre = (panel.window[0] + panel.window[1]) / 2
      const half = (panel.window[1] - panel.window[0]) / 2
      const focus = clamp(1 - Math.abs((p - centre) / half))
      leanX += panel.position[0] * focus * focus * 0.34
    }

    _look.set(
      lookAhead.x + leanX * inCorridor,
      lookAhead.y * 0.6,
      lookAhead.z - 12
    )
    camera.lookAt(_look)

    // A little banked roll from lateral movement — the difference between a
    // camera on a rig and one bolted to a rail.
    const vx = (cameraTarget.x - lastX.current) / Math.max(delta, 1 / 120)
    lastX.current = cameraTarget.x
    roll.current = lerp(roll.current, clamp(-vx * 0.011, -0.05, 0.05), 0.06)
    camera.rotation.z += roll.current

    // Tighten the lens for the closing shot so the building fills the frame.
    const closing = smoothstep(SECTIONS.trust[1], 0.99, p)
    const fov = lerp(46, 40, closing)
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

/** The warm pool of light at the far end of everything. */
function Backdrop({ progressRef }) {
  const mesh = useRef()
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uWarm: { value: 1 } }),
    []
  )

  useFrame(({ camera, clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    const p = progressRef.current.value
    // Dim the warm pool for the closing shot so the building photo is the
    // brightest thing on screen.
    uniforms.uWarm.value = lerp(1, 0.25, smoothstep(0.86, 0.97, p))
    if (mesh.current) {
      mesh.current.position.set(camera.position.x, camera.position.y, camera.position.z - 165)
    }
  })

  return (
    <mesh ref={mesh} frustumCulled={false}>
      <planeGeometry args={[420, 260]} />
      <shaderMaterial
        vertexShader={backdropVertex}
        fragmentShader={backdropFragment}
        uniforms={uniforms}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function Scene({ progressRef }) {
  return (
    <>
      <color attach="background" args={['#04101f']} />
      <fogExp2 attach="fog" args={['#061a2e', 0.0125]} />

      <CameraRig progressRef={progressRef} />
      <Backdrop progressRef={progressRef} />
      <Particles progressRef={progressRef} count={850} />

      <Suspense fallback={null}>
        {/* Hero: the real building, square on, dissolving as you walk in. */}
        <PhotoPanel
          photo={photos.exterior}
          position={[0, 2.0, HERO_PANEL_Z]}
          width={11}
          squareOn
          progressRef={progressRef}
          window={[-0.09, SECTIONS.hero[1]]}
          fadeOutAfter={SECTIONS.hero[1] - 0.028}
        />

        {/* The corridor of real facility photographs. */}
        {PANEL_LAYOUT.map((panel) => (
          <PhotoPanel
            key={panel.id}
            photo={photos[panel.photo]}
            position={panel.position}
            side={panel.side}
            width={panel.photo === 'surgery' || panel.photo === 'emergency' ? 5.2 : 6.4}
            progressRef={progressRef}
            window={panel.window}
          />
        ))}

        <DepartmentRing progressRef={progressRef} />

        {/* Closing: back to the building, full frame. */}
        <PhotoPanel
          photo={photos.exterior}
          position={[0, 0.2, CLOSING_PANEL_Z]}
          width={14}
          squareOn
          progressRef={progressRef}
          window={[0.85, 1.06]}
        />
      </Suspense>
    </>
  )
}
