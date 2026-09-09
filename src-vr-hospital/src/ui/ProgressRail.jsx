import { motion, useTransform } from 'framer-motion'
import { SECTIONS } from '../lib/timeline.js'

const MARKS = [
  { id: 'hero', label: 'Hospital', at: SECTIONS.hero },
  { id: 'facilities', label: 'Facilities', at: SECTIONS.facilities },
  { id: 'trust', label: 'At a glance', at: SECTIONS.trust },
  { id: 'closing', label: 'Visit', at: SECTIONS.closing },
]

function Mark({ mark, progress }) {
  const active = useTransform(progress, (p) =>
    p >= mark.at[0] - 0.005 && p < mark.at[1] ? 1 : 0.28
  )
  const scale = useTransform(progress, (p) =>
    p >= mark.at[0] - 0.005 && p < mark.at[1] ? 1 : 0.55
  )

  return (
    <li className="flex items-center gap-3">
      <motion.span
        style={{ opacity: active }}
        className="w-20 text-right text-[0.6rem] uppercase tracking-[0.2em] text-cream-100"
      >
        {mark.label}
      </motion.span>
      <motion.span
        style={{ opacity: active, scale }}
        className="block h-1.5 w-1.5 rounded-full bg-gold-500"
      />
    </li>
  )
}

/** A quiet index down the left edge, so the journey has a sense of length. */
export default function ProgressRail({ progress }) {
  const fill = useTransform(progress, [0, 1], ['0%', '100%'])

  return (
    <div className="pointer-events-none fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-end gap-5">
        {MARKS.map((mark) => (
          <Mark key={mark.id} mark={mark} progress={progress} />
        ))}
      </ul>
      <div className="mt-6 ml-auto h-24 w-px bg-cream-100/12">
        <motion.div style={{ height: fill }} className="w-px bg-gold-500/70" />
      </div>
    </div>
  )
}
