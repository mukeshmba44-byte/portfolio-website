import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { hospital, stats } from '../data/content.js'
import { PANEL_LAYOUT, SECTIONS } from '../lib/timeline.js'
import StatCard from './StatCard.jsx'

const EASE = [0.22, 1, 0.36, 1]

/** Fades a block in and out across a window of scroll progress. */
function useWindowOpacity(progress, [inA, inB, outA, outB]) {
  return useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0], {
    clamp: true,
  })
}

/**
 * The HTML that rides on top of the 3D scene. It is driven by the same scrubbed
 * progress value as the camera, through motion values rather than React state,
 * so the copy tracks the camera frame-for-frame without re-rendering.
 */
export default function Overlay({ progress, activePanel }) {
  const heroOpacity = useWindowOpacity(progress, [-0.05, -0.001, 0.072, 0.115])
  const heroLift = useTransform(progress, [0, 0.13], [0, -70], { clamp: true })

  const trustOpacity = useWindowOpacity(progress, [0.688, 0.742, 0.826, 0.858])
  const trustProgress = useTransform(
    progress,
    [SECTIONS.trust[0] + 0.008, SECTIONS.trust[1] - 0.09],
    [0, 1],
    { clamp: true }
  )
  const trustDepth = useTransform(progress, [0.68, 0.88], [180, -140], { clamp: true })

  const closingOpacity = useWindowOpacity(progress, [0.893, 0.948, 1.2, 1.3])
  const closingLift = useTransform(progress, [0.893, 1], [40, 0], { clamp: true })

  const panel = activePanel >= 0 ? PANEL_LAYOUT[activePanel] : null

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroLift }}
        className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-end
                   px-6 pb-[7vh] text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(to top, rgba(4,16,31,0.95) 4%, rgba(4,16,31,0.78) 30%, rgba(4,16,31,0.42) 58%, rgba(4,16,31,0.12) 82%, rgba(4,16,31,0) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
        <motion.img
          src="logo.webp"
          alt=""
          aria-hidden="true"
          width="72"
          height="72"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 h-14 w-14 rounded-full bg-white/90 p-0.5 shadow-lg ring-1 ring-gold-500/40"
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="mb-4 text-[0.68rem] font-medium uppercase tracking-[0.42em] text-gold-500"
        >
          Pedda Narava · Visakhapatnam
        </motion.p>

        <h1 className="light-sweep max-w-4xl font-display text-[clamp(2.4rem,6.4vw,5.4rem)] font-light leading-[1.02] tracking-tight">
          VR Multispeciality
          <br />
          Hospital
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 1.1, ease: EASE }}
          className="rule-gold my-7 h-px w-52"
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8, ease: EASE }}
          className="max-w-md text-balance text-[0.98rem] leading-relaxed text-cream-100/75"
        >
          {hospital.tagline} — with an ICU, an operation theatre, X-ray, a
          pathology lab and a pharmacy in the same building.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.9 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.34em] text-cream-100/45">
            Scroll to walk through
          </span>
          <motion.span
            animate={{ y: [0, 9, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="block h-9 w-px bg-gradient-to-b from-gold-500 to-transparent"
          />
        </motion.div>
        </div>
      </motion.div>

      {/* ── 2. FACILITY CAPTIONS ────────────────────────────────────── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {panel && (
            <motion.figure
              key={panel.id}
              initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: EASE }}
              className={`absolute bottom-[13vh] w-[min(23rem,78vw)] ${
                panel.side < 0
                  ? 'right-[6vw] text-right'
                  : 'left-[6vw] text-left'
              }`}
            >
              <div className="mb-3 flex items-center gap-3 text-gold-500"
                   style={{ flexDirection: panel.side < 0 ? 'row-reverse' : 'row' }}>
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.34em]">
                  {panel.eyebrow}
                </span>
                <span className="h-px flex-1 bg-gold-500/35" />
                <span className="font-display text-xs text-cream-100/40">
                  {String(panel.index + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="font-display text-[clamp(1.55rem,3vw,2.3rem)] font-light leading-tight text-cream-50">
                {panel.title}
              </h2>
              <figcaption className="mt-3 text-[0.92rem] leading-relaxed text-cream-100/65">
                {panel.body}
              </figcaption>
            </motion.figure>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. TRUST / STATS ────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: trustOpacity, perspective: 1200 }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
      >
        <motion.p className="mb-3 text-[0.62rem] font-medium uppercase tracking-[0.42em] text-gold-500">
          Why people come here
        </motion.p>
        <h2 className="mb-12 max-w-2xl text-balance text-center font-display text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight">
          Emergency care, diagnostics and surgery
          <span className="text-gold-500"> under one roof</span>
        </h2>

        <motion.div
          style={{ transformStyle: 'preserve-3d' }}
          className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={i}
              depth={trustDepth}
              progress={trustProgress}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* ── 4. CLOSING ──────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: closingOpacity, y: closingLift }}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center
                   bg-gradient-to-t from-navy-900 via-navy-900/85 to-transparent px-6
                   pb-[max(8vh,5rem)] pt-24 text-center"
      >
        <p className="mb-3 text-[0.62rem] font-medium uppercase tracking-[0.42em] text-gold-500">
          Come and see us
        </p>
        <h2 className="font-display text-[clamp(1.7rem,4vw,2.8rem)] font-light leading-tight">
          {hospital.fullName}
        </h2>
        <address className="mt-4 not-italic text-[0.95rem] leading-relaxed text-cream-100/70">
          {hospital.address.line1}
          <br />
          {hospital.address.line2}
        </address>

        <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={hospital.whatsappText}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-900
                       transition hover:bg-gold-400"
          >
            Book on WhatsApp
          </a>
          <a
            href={hospital.phoneHref}
            className="rounded-full border border-cream-100/25 px-7 py-3 text-sm font-medium
                       text-cream-50 transition hover:border-gold-500/60 hover:text-gold-400"
          >
            Call {hospital.phone}
          </a>
          <a
            href={hospital.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cream-100/25 px-7 py-3 text-sm font-medium
                       text-cream-50 transition hover:border-gold-500/60 hover:text-gold-400"
          >
            Directions
          </a>
        </div>
      </motion.div>
    </div>
  )
}
