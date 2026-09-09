import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A clinical syringe built from primitives, modelled with the needle tip at the
 * group's origin and growing upward. That lets the scene place it by its tip —
 * the one point that matters, because it is where the droplet is born.
 *
 * `plungerRef.current.value` runs 0 → 1 as it is pressed: the seal travels down
 * the barrel and the liquid column shortens behind it.
 */

export const SYRINGE_HEIGHT = 4.4 // tip to the top of the cue ring, plunger up

const NEEDLE_TOP = 0.95
const HUB_TOP = 1.24
const BARREL_BOTTOM = 1.3
const BARREL_TOP = 2.85
const BARREL_R = 0.27
const SEAL_R = BARREL_R - 0.028
const SEAL_UP = BARREL_TOP - 0.24
const SEAL_DOWN = BARREL_BOTTOM + 0.13

const STEEL = '#c9d6e0'
const PLUNGER = '#2d6f9c'

/** Volume graduations, drawn to a texture rather than modelled. */
function useMarkings() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const c = canvas.getContext('2d')
    c.clearRect(0, 0, 1024, 512)
    c.strokeStyle = 'rgba(226,240,252,0.95)'
    c.fillStyle = 'rgba(226,240,252,0.9)'
    c.font = '600 30px system-ui, sans-serif'
    c.textBaseline = 'middle'
    c.textAlign = 'left'

    // Ticks live on one face of the barrel; the cylinder wraps the rest.
    for (let i = 0; i <= 20; i++) {
      const y = 40 + (i / 20) * 430
      const major = i % 4 === 0
      c.lineWidth = major ? 4 : 2.5
      c.beginPath()
      c.moveTo(300, y)
      c.lineTo(major ? 380 : 352, y)
      c.stroke()
      if (major) c.fillText(String(5 - i / 4), 394, y)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])
}

export default function Syringe({ plungerRef, showCue = true }) {
  const seal = useRef()
  const liquid = useRef()
  const plungerGroup = useRef()
  const cue = useRef()
  const markings = useMarkings()

  useFrame(({ clock }) => {
    const p = plungerRef.current.value
    const sealY = SEAL_UP + (SEAL_DOWN - SEAL_UP) * p

    if (seal.current) seal.current.position.y = sealY
    if (plungerGroup.current) plungerGroup.current.position.y = sealY

    if (liquid.current) {
      const bottom = BARREL_BOTTOM + 0.02
      const height = Math.max(0.015, sealY - 0.09 - bottom)
      liquid.current.scale.y = height
      liquid.current.position.y = bottom + height / 2
    }

    // A ring breathing around the thumb rest — the "press here" cue, kept in 3D
    // so it tracks the plunger however the scene is scaled.
    if (cue.current) {
      const t = clock.elapsedTime
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.6)
      cue.current.visible = showCue && p < 0.02
      cue.current.scale.setScalar(1 + pulse * 0.55)
      cue.current.material.opacity = (1 - pulse) * 0.75 + 0.18
      cue.current.position.y = sealY + 1.06
    }
  })

  return (
    <group>
      {/* ── Plunger: seal, cross-shaped rod, thumb rest ── */}
      <mesh ref={seal} position={[0, SEAL_UP, 0]}>
        <cylinderGeometry args={[SEAL_R, SEAL_R, 0.18, 40]} />
        <meshStandardMaterial color={PLUNGER} roughness={0.5} />
      </mesh>

      <group ref={plungerGroup} position={[0, SEAL_UP, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.15, 1.0, 0.032]} />
          <meshStandardMaterial color={PLUNGER} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.032, 1.0, 0.15]} />
          <meshStandardMaterial color={PLUNGER} roughness={0.42} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.30, 0.30, 0.065, 40]} />
          <meshStandardMaterial color={PLUNGER} roughness={0.38} />
        </mesh>
      </group>

      <mesh ref={cue} position={[0, SEAL_UP + 1.06, 0]}>
        <torusGeometry args={[0.46, 0.018, 14, 72]} />
        <meshBasicMaterial color="#e2b569" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* ── Liquid column ── */}
      <mesh ref={liquid} position={[0, BARREL_BOTTOM + 0.6, 0]}>
        <cylinderGeometry args={[SEAL_R - 0.008, SEAL_R - 0.008, 1, 40]} />
        <meshPhysicalMaterial
          color="#7cc7ea"
          transparent
          opacity={0.72}
          roughness={0.12}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* ── Glass barrel ── */}
      <mesh position={[0, (BARREL_BOTTOM + BARREL_TOP) / 2, 0]}>
        <cylinderGeometry args={[BARREL_R, BARREL_R, BARREL_TOP - BARREL_BOTTOM, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#dceefc"
          transparent
          opacity={0.26}
          roughness={0.03}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={3.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Graduations, floated just outside the glass */}
      <mesh position={[0, (BARREL_BOTTOM + BARREL_TOP) / 2, 0]}>
        <cylinderGeometry
          args={[BARREL_R + 0.005, BARREL_R + 0.005, BARREL_TOP - BARREL_BOTTOM, 64, 1, true]}
        />
        <meshBasicMaterial
          map={markings}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Finger flange */}
      <mesh position={[0, BARREL_TOP + 0.015, 0]}>
        <cylinderGeometry args={[0.52, 0.46, 0.06, 44]} />
        <meshPhysicalMaterial
          color="#dceefc"
          transparent
          opacity={0.42}
          roughness={0.06}
          metalness={0.1}
          clearcoat={1}
          envMapIntensity={2.6}
        />
      </mesh>

      {/* ── Luer hub: wide at the barrel, tapering down to the needle ── */}
      <mesh position={[0, (BARREL_BOTTOM + HUB_TOP) / 2 - 0.14, 0]}>
        <cylinderGeometry args={[0.19, 0.085, 0.3, 44]} />
        <meshStandardMaterial color="#dae8f4" roughness={0.28} metalness={0.12} />
      </mesh>
      <mesh position={[0, NEEDLE_TOP + 0.03, 0]}>
        <cylinderGeometry args={[0.062, 0.048, 0.09, 32]} />
        <meshStandardMaterial color="#9db4c6" roughness={0.25} metalness={0.55} />
      </mesh>

      {/* ── Needle ── */}
      <mesh position={[0, NEEDLE_TOP / 2 + 0.04, 0]}>
        <cylinderGeometry args={[0.017, 0.017, NEEDLE_TOP - 0.08, 20]} />
        <meshStandardMaterial color={STEEL} roughness={0.14} metalness={1} envMapIntensity={2.4} />
      </mesh>
      {/* Bevelled tip, pointing down */}
      <mesh position={[0, 0.045, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.017, 0.09, 20]} />
        <meshStandardMaterial color="#eef4f9" roughness={0.1} metalness={1} envMapIntensity={2.6} />
      </mesh>
    </group>
  )
}
