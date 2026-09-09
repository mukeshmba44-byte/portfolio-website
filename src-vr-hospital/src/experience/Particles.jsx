import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { particleVertex, particleFragment } from './shaders.js'

/**
 * The ambient light field the corridor floats in — generated here, never
 * photographic. Motes are scattered in a hollow cylinder around the walkway so
 * the camera flies through them rather than at a flat backdrop.
 */
export default function Particles({ count = 900, progressRef }) {
  const points = useRef()

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const phases = new Float32Array(count)
    const tints = new Float32Array(count * 3)

    const warm = new THREE.Color('#f0cf94')
    const cool = new THREE.Color('#cfe3f5')
    const white = new THREE.Color('#fdf8ee')
    const c = new THREE.Color()

    for (let i = 0; i < count; i++) {
      // Hollow cylinder: nothing directly on the camera's own line, so the
      // lens never fills with a mote sitting on the near plane.
      const angle = Math.random() * Math.PI * 2
      const radius = 2.6 + Math.pow(Math.random(), 0.6) * 15
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.62
      positions[i * 3 + 2] = -Math.random() * 190

      scales[i] = 0.35 + Math.pow(Math.random(), 2) * 1.9
      phases[i] = Math.random() * Math.PI * 2

      const roll = Math.random()
      c.copy(roll < 0.55 ? warm : roll < 0.82 ? white : cool)
      tints[i * 3] = c.r
      tints[i * 3 + 1] = c.g
      tints[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aTint', new THREE.BufferAttribute(tints, 3))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -95), 220)

    return {
      geometry: geo,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 3.1 },
        uCameraZ: { value: 0 },
      },
    }
  }, [count])

  useFrame(({ camera, clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uCameraZ.value = camera.position.z
    if (points.current) points.current.position.z = 0
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
