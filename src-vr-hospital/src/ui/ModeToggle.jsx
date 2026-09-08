import { motion } from 'framer-motion'

/**
 * Lets the visitor overrule the device guess.
 *
 * Without this, anyone the heuristic routes to the lite version has no way of
 * knowing the 3D walkthrough exists, let alone reaching it — which is exactly
 * what happens on a touchscreen laptop or in a narrow window.
 */
export default function ModeToggle({ mode, onChange }) {
  const goingTo3D = mode === 'lite'

  return (
    <motion.button
      type="button"
      onClick={() => onChange(goingTo3D ? 'immersive' : 'lite')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      title={
        goingTo3D
          ? 'Switch to the scroll-driven 3D walkthrough'
          : 'Switch to the lighter 2D version'
      }
      className="glass-card fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full
                 py-2.5 pl-3 pr-4 text-[0.78rem] font-medium text-cream-100/85
                 transition-colors hover:text-gold-400 sm:bottom-7 sm:left-7"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <span
        aria-hidden="true"
        className={`block h-1.5 w-1.5 rounded-full ${
          goingTo3D ? 'bg-gold-500' : 'bg-cream-100/40'
        }`}
      />
      {goingTo3D ? 'View in 3D' : 'Lite version'}
    </motion.button>
  )
}
