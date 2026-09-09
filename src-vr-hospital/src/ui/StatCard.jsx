import { motion, useTransform } from 'framer-motion'
import CountUp from './CountUp.jsx'

/**
 * A single count-up figure. Kept as its own component so the depth and rotation
 * motion values are created at the top level of a component rather than inside
 * a loop.
 */
export default function StatCard({ stat, index, depth, progress }) {
  const z = useTransform(depth, (v) => v * (0.5 + index * 0.32))
  const rotateY = useTransform(progress, [0, 1], [(index - 1) * 24, 0])

  return (
    <motion.div
      style={{ z, rotateY }}
      className="glass-card rounded-2xl px-6 py-7 text-center"
    >
      <CountUp
        value={stat.value}
        suffix={stat.suffix}
        progress={progress}
        className="block font-display text-[clamp(2.6rem,5vw,3.6rem)] font-light leading-none text-cream-50"
      />
      <span className="mt-3 block text-[0.82rem] font-medium leading-snug text-cream-100/80">
        {stat.label}
      </span>
      <span className="mt-2 block text-[0.66rem] leading-snug text-cream-100/40">
        {stat.note}
      </span>
    </motion.div>
  )
}
