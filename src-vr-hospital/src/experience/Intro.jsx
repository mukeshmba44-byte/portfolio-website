import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import gsap from 'gsap'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import Syringe, { SYRINGE_HEIGHT } from './Syringe.jsx'
import Droplet from './Droplet.jsx'

const DROP_RADIUS = 0.2
const DROP_END_Z = 2.35

/** A studio environment so the glass has something to reflect. */
function Environment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = env.texture
    return () => {
      env.dispose()
      pmrem.dispose()
      scene.environment = null
    }
  }, [gl, scene])
  return null
}

/**
 * Sizes and places the syringe against the frame, and reports back where its
 * needle tip and the bottom of the screen are.
 *
 * Laying it out from the viewport rather than in fixed world units is what
 * guarantees the drop always has most of the screen to fall down, on a wide
 * monitor and a tall phone alike.
 */
function useLayout(onMeasure) {
  const { viewport, camera } = useThree()
  const layout = useMemo(() => {
    const h = viewport.height
    // The frame narrows as the drop nears the lens, so its landing point is
    // measured against the frame at the depth it will actually be at.
    const shrink = (camera.position.z - DROP_END_Z) / camera.position.z
    return {
      scale: (h * 0.52) / SYRINGE_HEIGHT,
      tipY: -h * 0.02,
      floorY: -(h / 2) * shrink + DROP_RADIUS * 0.85,
    }
  }, [viewport.height, camera.position.z])

  useEffect(() => {
    onMeasure(layout)
  }, [layout, onMeasure])

  return layout
}

function Scene({ plungerRef, dropRef, onMeasure, showCue }) {
  const layout = useLayout(onMeasure)

  return (
    <>
      <Environment />

      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} color="#fff6e6" />
      <directionalLight position={[-4, 1.5, 2]} intensity={1.1} color="#8fc4ee" />
      {/* Rim light picks out the barrel and needle against the dark ground. */}
      <pointLight position={[0, -1.5, 2.5]} intensity={14} distance={9} color="#e2b569" />

      <group position={[0, layout.tipY, 0]} scale={layout.scale}>
        <Syringe plungerRef={plungerRef} showCue={showCue} />
      </group>
      <Suspense fallback={null}>
        <Droplet stateRef={dropRef} radius={DROP_RADIUS} />
      </Suspense>
    </>
  )
}

/**
 * The opening. A syringe, a press, a drop that carries the hospital's mark down
 * the screen, and a ripple that washes the site in.
 *
 * The whole sequence is one GSAP timeline writing into plain refs that the R3F
 * frame loop reads — the same pattern the main scene uses for scroll, so there
 * is only ever one way animation reaches the 3D layer.
 */
export default function Intro({ onArm, onReveal, onDone, reducedMotion }) {
  const plungerRef = useRef({ value: 0 })
  const dropRef = useRef({ x: 0, y: 0, z: 0, opacity: 0, scale: 0, logo: 0, glint: 0, speed: 0 })
  const layoutRef = useRef({ scale: 0.6, tipY: 0.3, floorY: -2.3 })
  const timeline = useRef(null)

  const [pressed, setPressed] = useState(false)
  const pressedRef = useRef(false)
  const [ripple, setRipple] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const onMeasure = useCallback((layout) => {
    layoutRef.current = layout
    // Park the drop at the tip until it is released.
    if (!pressedRef.current) dropRef.current.y = layout.tipY
  }, [])

  const start = useCallback(() => {
    if (pressed) return
    setPressed(true)

    pressedRef.current = true
    const drop = dropRef.current
    const { tipY, floorY } = layoutRef.current
    const fallFrom = tipY - DROP_RADIUS * 0.5
    const fallTo = floorY

    const tl = gsap.timeline({
      onComplete: () => {
        onDone?.()
      },
    })

    // 1. The plunger goes down, with the overshoot of a real spring.
    tl.to(plungerRef.current, {
      value: 1,
      duration: 0.85,
      ease: 'back.inOut(1.4)',
    })

    // 2. A bead gathers at the tip, swells, and lets go.
    tl.fromTo(
      drop,
      { opacity: 0, scale: 0.3, y: tipY + 0.02, z: 0, speed: 0 },
      { opacity: 1, scale: 1, duration: 0.42, ease: 'power2.out' },
      0.4
    )
    tl.to(drop, { y: fallFrom, duration: 0.2, ease: 'power1.in' }, 0.72)

    // 3. The fall — accelerating under gravity, not eased into a stop.
    tl.to(
      drop,
      {
        y: fallTo,
        duration: 1.15,
        ease: 'power2.in',
        onUpdate() {
          // Speed drives the squash-and-stretch in the droplet shader.
          drop.speed = this.progress() * 1.9
        },
      },
      0.92
    )
    // It drifts toward the lens as it falls, so the mark inside it grows
    // legible by the time it lands.
    tl.to(drop, { z: DROP_END_Z, scale: 1.65, duration: 1.15, ease: 'power2.in' }, 0.92)
    // A little lateral drift, so it does not fall on rails.
    tl.to(drop, { x: 0.05, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.92)

    // The mark rises inside the liquid on the way down, then catches the light.
    tl.to(drop, { logo: 1, duration: 0.55, ease: 'power2.out' }, 1.12)
    tl.to(drop, { glint: 1, duration: 0.7, ease: 'sine.inOut' }, 1.45)

    // 4. Impact. The site is mounted underneath just before the ripple opens,
    //    so what the ripple uncovers is the real page.
    tl.call(() => {
      onReveal?.()
      setRipple(true)
      drop.opacity = 0
    }, null, 2.07)

    tl.call(() => setLeaving(true), null, 2.42)
    tl.to({}, { duration: 0.95 }) // let the ripple and fade play out

    timeline.current = tl
    // Lets the animation be stepped frame by frame when checking it.
    window.__introTimeline = tl
    window.__introDrop = drop
  }, [pressed, onDone, onReveal])

  // Someone who has asked for less motion gets the site, not a performance.
  useEffect(() => {
    if (!reducedMotion) return undefined
    onReveal?.()
    const id = setTimeout(() => onDone?.(), 60)
    return () => clearTimeout(id)
  }, [reducedMotion, onReveal, onDone])

  useEffect(() => {
    onArm?.()
    return () => timeline.current?.kill()
  }, [onArm])

  // Keyboard: the press must not be mouse-only.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [start])

  if (reducedMotion) return null

  return (
    <motion.div
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[70] bg-navy-900"
      style={{ pointerEvents: leaving ? 'none' : 'auto' }}
    >
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0, 6.2] }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#04101f']} />
        <fog attach="fog" args={['#04101f', 7, 14]} />
        <Scene
          plungerRef={plungerRef}
          dropRef={dropRef}
          onMeasure={onMeasure}
          showCue={!pressed}
        />
      </Canvas>

      {/* Soft pool of light behind the syringe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 46% at 50% 42%, rgba(46,96,140,0.30), rgba(4,16,31,0) 70%)',
        }}
      />

      {/* The press target: the whole screen, so a tap can never miss. */}
      <button
        type="button"
        onClick={start}
        disabled={pressed}
        aria-label="Press the plunger to enter the site"
        className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
      />

      <AnimatePresence>
        {!pressed && (
          <motion.div
            key="cue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.3 } }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 bottom-[13vh] flex flex-col items-center gap-4"
          >
            <span className="text-[0.95rem] font-medium uppercase tracking-[0.46em] text-gold-400">
              Press to enter
            </span>
            <span className="text-[0.8rem] tracking-wide text-cream-100/60">
              VR Multispeciality Hospital
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Impact ripple, opening from where the drop lands. */}
      <AnimatePresence>
        {ripple && (
          <>
            <motion.span
              key="ring"
              aria-hidden="true"
              initial={{ scale: 0, opacity: 0.85 }}
              animate={{ scale: 34, opacity: 0 }}
              transition={{ duration: 1.05, ease: [0.16, 0.8, 0.3, 1] }}
              className="pointer-events-none absolute bottom-0 left-1/2 block h-24 w-24
                         -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-gold-400/70"
            />
            <motion.span
              key="ring2"
              aria-hidden="true"
              initial={{ scale: 0, opacity: 0.55 }}
              animate={{ scale: 30, opacity: 0 }}
              transition={{ duration: 1.15, delay: 0.14, ease: [0.16, 0.8, 0.3, 1] }}
              className="pointer-events-none absolute bottom-0 left-1/2 block h-24 w-24
                         -translate-x-1/2 translate-y-1/2 rounded-full border border-cream-100/50"
            />
            <motion.span
              key="wash"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(80% 60% at 50% 100%, rgba(226,181,105,0.55), rgba(4,16,31,0) 70%)',
              }}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
