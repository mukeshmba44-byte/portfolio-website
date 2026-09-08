import { useEffect, useRef } from 'react'
import { useMotionValueEvent, useTransform } from 'framer-motion'

/**
 * Counts up as the user scrolls rather than on a timer, so scrubbing backwards
 * counts back down. Writes straight to the DOM node — a React re-render per
 * frame for three numbers would be wasteful.
 */
export default function CountUp({ value, suffix = '', progress, className }) {
  const ref = useRef(null)
  const count = useTransform(progress, [0, 1], [0, value], { clamp: true })

  const write = (n) => {
    if (ref.current) ref.current.firstChild.nodeValue = String(Math.round(n))
  }

  useMotionValueEvent(count, 'change', write)
  useEffect(() => {
    write(count.get())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className={className}>
      <span ref={ref} className="tabular-nums">
        {0}
      </span>
      {suffix ? <span className="text-gold-500">{suffix}</span> : null}
    </span>
  )
}
