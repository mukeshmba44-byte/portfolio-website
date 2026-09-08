import { Suspense, lazy } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExperienceMode } from './lib/useDevice.js'
import { useSmoothScroll } from './lib/useSmoothScroll.js'
import LiteExperience from './lite/LiteExperience.jsx'
import WhatsAppButton from './ui/WhatsAppButton.jsx'

/**
 * three.js, R3F and GSAP live behind this dynamic import. A phone that gets the
 * lite experience never downloads them at all — the code-split is the point of
 * the mobile fallback, not just the simpler animation.
 */
const Immersive = lazy(() => import('./experience/Immersive.jsx'))

export default function App() {
  const mode = useExperienceMode()
  const lenis = useSmoothScroll(true)

  return (
    <>
      {mode === 'immersive' ? (
        <Suspense fallback={<Curtain />}>
          <Immersive lenis={lenis} />
        </Suspense>
      ) : (
        <LiteExperience />
      )}
      <WhatsAppButton />
    </>
  )
}

/** Shown only while the 3D chunk is in flight. */
function Curtain() {
  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-navy-900"
      >
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
      </motion.div>
    </AnimatePresence>
  )
}
