import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useCanRender3D } from './lib/useDevice.js'
import { useSmoothScroll } from './lib/useSmoothScroll.js'
import LiteExperience from './lite/LiteExperience.jsx'
import WhatsAppButton from './ui/WhatsAppButton.jsx'
import ErrorBoundary from './ui/ErrorBoundary.jsx'

/**
 * The 3D walkthrough is the site — every visitor gets it. three.js still sits
 * behind a dynamic import so the page can paint the curtain immediately rather
 * than waiting on the bundle.
 *
 * `LiteExperience` is no longer an option anyone is routed to. It remains only
 * as a fallback for a browser without WebGL, which would otherwise see nothing.
 */
const Experience = lazy(() => import('./experience/Experience.jsx'))

export default function App() {
  const canRender3D = useCanRender3D()
  // The intro locks the page; Lenis is released when it finishes.
  const lenis = useSmoothScroll(true, { startStopped: canRender3D })

  if (!canRender3D) {
    return (
      <>
        <LiteExperience />
        <WhatsAppButton />
      </>
    )
  }

  return (
    <>
      <ErrorBoundary fallback={<LiteExperience />}>
        <Suspense fallback={<Curtain />}>
          <Experience lenis={lenis} />
        </Suspense>
      </ErrorBoundary>
      <WhatsAppButton />
    </>
  )
}

/** Shown only while the 3D bundle is in flight. */
function Curtain() {
  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-navy-900">
      <img
        src="logo.webp"
        alt=""
        aria-hidden="true"
        width="56"
        height="56"
        className="h-14 w-14 rounded-full bg-white/90 p-0.5 ring-1 ring-gold-500/40"
      />
      <p className="mt-6 text-[0.62rem] uppercase tracking-[0.4em] text-gold-500">
        VR Multispeciality Hospital
      </p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
        className="mt-5 h-px w-28 origin-left bg-gold-500/60"
      />
    </div>
  )
}
