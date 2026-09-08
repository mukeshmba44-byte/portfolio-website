import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useMotionValue } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './Scene.jsx'
import Overlay from '../ui/Overlay.jsx'
import ProgressRail from '../ui/ProgressRail.jsx'
import { SCROLL_VH, activePanelIndex } from '../lib/timeline.js'
import { facilities, hospital, stats } from '../data/content.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * The desktop experience: a fixed WebGL canvas that the page scroll scrubs.
 *
 * GSAP's `scrub` is doing the important work here. Rather than reading raw
 * scroll position, the camera follows a value that lags and catches up, so
 * flicking the wheel glides the camera down the corridor and settles, instead
 * of snapping frame-to-frame with the scrollbar.
 */
export default function Immersive({ lenis }) {
  const containerRef = useRef(null)
  const progressRef = useRef({ value: 0 })
  const progress = useMotionValue(0)
  const [activePanel, setActivePanel] = useState(-1)
  const [ready, setReady] = useState(false)

  // Lenis drives the scroll, so ScrollTrigger has to be told when it moves.
  useEffect(() => {
    if (!lenis) return undefined
    const update = () => ScrollTrigger.update()
    lenis.on('scroll', update)
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()
    return () => lenis.off('scroll', update)
  }, [lenis])

  useEffect(() => {
    const proxy = { value: 0 }
    let lastPanel = -1

    const tween = gsap.to(proxy, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.85,
        invalidateOnRefresh: true,
      },
    })

    // Publish on every tick rather than from ScrollTrigger's onUpdate: with
    // `scrub`, the proxy keeps easing toward the scroll position for a while
    // after the last scroll event, and onUpdate has stopped firing by then.
    const publish = () => {
      const value = proxy.value
      progressRef.current.value = value
      progress.set(value)

      // The only thing that touches React state, and only when the panel in
      // focus actually changes.
      const next = activePanelIndex(value)
      if (next !== lastPanel) {
        lastPanel = next
        setActivePanel(next)
      }
    }

    gsap.ticker.add(publish)
    window.__vrProgress = progressRef.current

    return () => {
      gsap.ticker.remove(publish)
      delete window.__vrProgress
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [progress])

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 900ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <Canvas
          camera={{ fov: 46, near: 0.1, far: 400, position: [0, 0.25, 7] }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          onCreated={() => setReady(true)}
        >
          <Scene progressRef={progressRef} />
        </Canvas>
      </div>

      <Overlay progress={progress} activePanel={activePanel} />
      <ProgressRail progress={progress} />

      {/* The scroll track. Its height is the entire journey; everything the
          user actually looks at is fixed on top of it. */}
      <div ref={containerRef} style={{ height: `${SCROLL_VH}vh` }} aria-hidden="true" />

      {/* The same content as flat, ordered text for screen readers and search
          engines, which cannot scrub a WebGL camera. */}
      <ScreenReaderContent />
    </>
  )
}

function ScreenReaderContent() {
  return (
    <div className="sr-only">
      <SemanticSummary />
    </div>
  )
}

function SemanticSummary() {
  return (
    <main>
      <h1>{hospital.fullName}</h1>
      <p>{hospital.tagline}</p>
      <h2>Facilities</h2>
      <ul>
        {facilities.map((f) => (
          <li key={f.id}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </li>
        ))}
      </ul>
      <h2>At a glance</h2>
      <ul>
        {stats.map((s) => (
          <li key={s.label}>
            {s.value}
            {s.suffix} — {s.label}
          </li>
        ))}
      </ul>
      <h2>Visit us</h2>
      <address>
        {hospital.address.line1}, {hospital.address.line2}
      </address>
      <p>
        <a href={hospital.phoneHref}>{hospital.phone}</a>
      </p>
      <p>
        <a href={hospital.whatsapp}>Book on WhatsApp</a>
      </p>
    </main>
  )
}
