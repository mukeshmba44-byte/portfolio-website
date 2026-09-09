import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * The droplet that falls from the needle.
 *
 * The logo is sampled in the sphere's own object space rather than from its UV
 * sphere mapping, so it reads as a flat mark suspended *inside* the liquid and
 * is clipped to the droplet's silhouette for free — there is nowhere else for
 * it to draw. A fresnel rim and a travelling glint do the rest of the work of
 * making it look wet.
 */

const vertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  void main() {
    vLocal = position;
    vNormalW = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uLogo;
  uniform float uLogoOpacity;
  uniform float uGlint;      // 0 → 1 sweeps the highlight across the droplet
  uniform float uOpacity;
  uniform float uRadius;
  uniform vec3  uTint;
  uniform vec3  uEdge;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  void main() {
    float fres = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0), 2.4);

    vec3 color = uTint;
    // Liquid body: darker in the middle, bright at the rim.
    color = mix(color * 0.95, uEdge, fres * 0.8);

    // Specular pin-light, as on the shoulder of a real drop.
    float spec = pow(max(dot(normalize(vNormalW), normalize(vec3(-0.4, 0.75, 0.8))), 0.0), 24.0);
    color += vec3(1.0) * spec * 0.65;

    // The mark, sampled flat across the droplet's face.
    vec2 uv = vLocal.xy / (uRadius * 1.55) + 0.5;
    if (uLogoOpacity > 0.001 && uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
      vec4 logo = texture2D(uLogo, vec2(uv.x, 1.0 - uv.y));
      // Only on the face turned toward the viewer, so it does not ghost
      // through from the back of the sphere.
      float facing = smoothstep(0.02, 0.42, normalize(vLocal).z);
      float ink = logo.a * uLogoOpacity * facing;
      color = mix(color, logo.rgb * 1.5, ink);
      // The mark is suspended in the liquid, so it also brightens the drop.
      color += logo.rgb * ink * 0.28;
    }

    // Glint: a soft diagonal band travelling across the drop.
    float band = 1.0 - smoothstep(0.0, 0.42, abs((vLocal.x + vLocal.y) / uRadius - (uGlint * 4.4 - 2.2)));
    color += vec3(1.0, 0.96, 0.86) * band * uGlint * (1.0 - uGlint) * 2.6;

    float alpha = clamp(0.62 + fres * 0.7, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(color, alpha);

    #include <colorspace_fragment>
  }
`

export default function Droplet({ stateRef, radius = 0.13 }) {
  const mesh = useRef()
  // Loaded by hand rather than through useLoader: a suspending loader that
  // throws on a missing file takes the whole intro down with it, and a droplet
  // without its mark is far better than a blank page.
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load(
      'logo-mark.webp',
      (tex) => {
        if (!alive) return setTimeout(() => tex.dispose(), 0)
        tex.colorSpace = THREE.SRGBColorSpace
        setLogo(tex)
      },
      undefined,
      () => {
        // Nothing to do: the droplet simply falls without the mark.
      }
    )
    return () => {
      alive = false
    }
  }, [])

  const uniforms = useMemo(() => {
    return {
      uLogo: { value: null },
      uLogoOpacity: { value: 0 },
      uGlint: { value: 0 },
      uOpacity: { value: 0 },
      uRadius: { value: radius },
      uTint: { value: new THREE.Color('#9fd4ee') },
      uEdge: { value: new THREE.Color('#f2fbff') },
    }
  }, [radius])

  useEffect(() => {
    uniforms.uLogo.value = logo
  }, [logo, uniforms])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const s = stateRef.current

    m.visible = s.opacity > 0.002
    if (!m.visible) return

    m.position.set(s.x, s.y, s.z || 0)
    uniforms.uOpacity.value = s.opacity
    uniforms.uLogoOpacity.value = logo ? s.logo : 0
    uniforms.uGlint.value = s.glint

    // Squash and stretch: the drop draws out as it accelerates, and the
    // horizontal axes shrink to keep its volume looking constant.
    const stretch = 1 + Math.min(s.speed * 0.30, 0.85)
    const squash = 1 / Math.sqrt(stretch)
    // A slow wobble so it reads as liquid rather than a bead.
    const wobble = Math.sin(clock.elapsedTime * 9.5) * 0.05 * Math.min(s.speed, 1)

    m.scale.set(
      s.scale * squash * (1 + wobble),
      s.scale * stretch,
      s.scale * squash * (1 - wobble)
    )
  })

  return (
    <mesh ref={mesh} renderOrder={5}>
      <sphereGeometry args={[radius, 48, 40]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
