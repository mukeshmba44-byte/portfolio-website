import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { departments } from '../data/content.js'
import { SECTIONS, clamp, lerp, smoothstep, within } from '../lib/timeline.js'
import { createDepartmentTexture } from './departmentTexture.js'

const CENTRE_Z = -116
const SPREAD_Z = 7
const RING_X = 12.6
const RING_Y = 7.4

/**
 * The open area the corridor gives onto. The department markers start
 * scattered and far apart, then draw themselves into an even ring as the user
 * scrolls through — the camera passes through the middle of the ring, so the
 * arrangement happens around the viewer rather than in front of them.
 */
export default function DepartmentRing({ progressRef }) {
  const group = useRef()
  const items = useRef([])

  const marks = useMemo(
    () =>
      departments.map((d, i) => {
        const angle = (i / departments.length) * Math.PI * 2
        return {
          ...d,
          texture: createDepartmentTexture(d),
          angle,
          // Where it drifts in from before the ring forms.
          scatter: new THREE.Vector3(
            Math.cos(angle * 2.3 + 1.1) * 16,
            Math.sin(angle * 1.7) * 11,
            CENTRE_Z - SPREAD_Z * 1.9 + Math.sin(angle * 3.1) * 14
          ),
          // Its place in the finished ring.
          seat: new THREE.Vector3(
            Math.cos(angle) * RING_X,
            Math.sin(angle) * RING_Y,
            CENTRE_Z - SPREAD_Z / 2 + (i / (departments.length - 1)) * SPREAD_Z
          ),
        }
      }),
    []
  )

  useMemo(
    () => () => marks.forEach((m) => m.texture.dispose()),
    [marks]
  )

  useFrame(({ camera, clock }) => {
    const p = progressRef.current.value
    const t = within(p, SECTIONS.trust)

    // Live a little either side of the section so nothing pops in or out.
    const alive =
      smoothstep(SECTIONS.trust[0] - 0.06, SECTIONS.trust[0] + 0.05, p) *
      (1 - smoothstep(SECTIONS.trust[1] - 0.01, SECTIONS.trust[1] + 0.05, p))

    if (group.current) group.current.visible = alive > 0.005
    if (alive <= 0.005) return

    const settle = smoothstep(0, 0.62, t)
    const spin = clock.elapsedTime * 0.06 + t * 1.35

    marks.forEach((m, i) => {
      const mesh = items.current[i]
      if (!mesh) return

      const angle = m.angle + spin
      const seatX = Math.cos(angle) * RING_X
      const seatY = Math.sin(angle) * RING_Y

      mesh.position.set(
        lerp(m.scatter.x, seatX, settle),
        lerp(m.scatter.y, seatY, settle),
        lerp(m.scatter.z, m.seat.z, settle)
      )

      // Marks read best a good way down the corridor. They are faded out well
      // before the camera reaches them, so one never swells up over the lens.
      const ahead = camera.position.z - mesh.position.z
      const near = clamp(1 - Math.abs(ahead - 16) / 19)
      mesh.scale.setScalar(lerp(1.3, 1.95, near) * lerp(0.75, 1, settle))

      mesh.material.opacity =
        alive *
        lerp(0.3, 1.15, near) *
        clamp((ahead - 9) / 8) *
        lerp(0.45, 1, settle)

      mesh.lookAt(camera.position)
    })
  })

  return (
    <group ref={group}>
      {marks.map((m, i) => (
        <mesh
          key={m.id}
          ref={(el) => (items.current[i] = el)}
          position={m.scatter}
          frustumCulled={false}
        >
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial
            map={m.texture}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
