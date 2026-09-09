import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { facilities, hospital, photos, stats, departments } from '../data/content.js'
import CountUp from '../ui/CountUp.jsx'

const EASE = [0.22, 1, 0.36, 1]

/**
 * The phone / touch / reduced-motion experience.
 *
 * Same photographs, same words, same order as the 3D version — but the camera
 * path is replaced by layered parallax and focus transitions, and three.js is
 * never downloaded. On mobile data that is the difference between a site that
 * opens and one that people give up on.
 */
export default function LiteExperience() {
  const reduce = useReducedMotion()

  return (
    <main className="relative overflow-x-hidden">
      <AmbientField />
      <Hero reduce={reduce} />
      <section aria-label="Facilities" className="relative z-10">
        {facilities.map((facility, i) => (
          <FacilityCard key={facility.id} facility={facility} index={i} reduce={reduce} />
        ))}
      </section>
      <Trust />
      <Closing />
    </main>
  )
}

/* ── Generated ambient background (no photographs) ─────────────────────── */

function AmbientField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-navy-900">
      <div
        className="absolute left-1/2 top-[-18%] h-[70vh] w-[130vw] -translate-x-1/2 rounded-[50%]
                   opacity-70 blur-[70px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(226,181,105,0.22), rgba(10,39,69,0.35) 55%, transparent 78%)',
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[-20%] h-[70vh] w-[90vw] rounded-[50%] opacity-60 blur-[80px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(22,70,114,0.55), transparent 72%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.16] motion-safe:animate-[drift_28s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage:
            'radial-gradient(1.4px 1.4px at 18% 24%, rgba(240,207,148,0.85), transparent),' +
            'radial-gradient(1.6px 1.6px at 72% 16%, rgba(253,248,238,0.7), transparent),' +
            'radial-gradient(1.2px 1.2px at 42% 62%, rgba(240,207,148,0.6), transparent),' +
            'radial-gradient(1.8px 1.8px at 86% 74%, rgba(207,227,245,0.6), transparent),' +
            'radial-gradient(1.3px 1.3px at 12% 82%, rgba(253,248,238,0.55), transparent),' +
            'radial-gradient(1.5px 1.5px at 58% 38%, rgba(240,207,148,0.5), transparent)',
          backgroundSize: '340px 340px',
        }}
      />
      <style>{`@keyframes drift {
        from { transform: translate3d(0,0,0) }
        to   { transform: translate3d(-40px,-28px,0) }
      }`}</style>
    </div>
  )
}

/* ── 1. Hero ───────────────────────────────────────────────────────────── */

function Hero({ reduce }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-24%'])
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.1])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-46%'])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const hazeY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])

  const photo = photos.exterior

  return (
    <header
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-32 pt-14 text-center"
    >
      {/* A heavily blurred copy of the building as atmosphere. It is meant to
          read as light, not as a picture, so the softening is deliberate. */}
      <motion.div style={{ y: hazeY }} className="absolute inset-0 -z-10">
        <img
          src={photo.src}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-125 object-cover opacity-30 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/55 to-navy-900" />
      </motion.div>

      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="flex w-full flex-col items-center">
        <motion.img
          src="logo.webp"
          alt=""
          aria-hidden="true"
          width="64"
          height="64"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-5 h-14 w-14 rounded-full bg-white/90 p-0.5 ring-1 ring-gold-500/40"
        />
        <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.36em] text-gold-500">
          Pedda Narava · Visakhapatnam
        </p>
        <h1 className="light-sweep font-display text-[clamp(2.1rem,9.5vw,3.2rem)] font-light leading-[1.05]">
          VR Multispeciality
          <br />
          Hospital
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 1, ease: EASE }}
          className="rule-gold my-6 h-px w-40"
        />

        {/* Shown at its own aspect ratio and a little under 1:1 pixel scale, so
            the photograph stays sharp instead of being blown up to fill the
            viewport the way object-cover would. */}
        <motion.figure
          style={{ y: photoY, scale: photoScale }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: EASE }}
          className="glass-card mb-7 w-full max-w-md overflow-hidden rounded-2xl p-1.5"
        >
          <img
            src={photo.src}
            width={photo.w}
            height={photo.h}
            alt={photo.alt}
            fetchPriority="high"
            decoding="async"
            className="w-full rounded-xl"
          />
        </motion.figure>

        <p className="max-w-sm text-balance text-[0.95rem] leading-relaxed text-cream-100/75">
          {hospital.tagline} — with an ICU, an operation theatre, X-ray, a
          pathology lab and a pharmacy in the same building.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={hospital.whatsappText}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900"
          >
            Book on WhatsApp
          </a>
          <a
            href={hospital.phoneHref}
            className="rounded-full border border-cream-100/25 px-6 py-3 text-sm font-medium text-cream-50"
          >
            Call now
          </a>
        </div>
      </motion.div>
    </header>
  )
}

/* ── 2. Facilities ─────────────────────────────────────────────────────── */

function FacilityCard({ facility, index, reduce }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // The photo drifts against the card and sharpens as it reaches the middle of
  // the viewport — the 2D stand-in for the camera coming into focus on it.
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-11%', '11%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.14, 1, 1.14])
  const blur = useTransform(scrollYProgress, [0.1, 0.45, 0.6, 0.95], [7, 0, 0, 7])
  const filter = useTransform(blur, (v) => `blur(${v.toFixed(2)}px)`)
  const dim = useTransform(scrollYProgress, [0.1, 0.45, 0.62, 0.95], [0.72, 0.14, 0.16, 0.74])
  const overlay = useTransform(dim, (v) => `rgba(4,16,31,${v})`)

  const photo = photos[facility.photo]
  const flip = index % 2 === 1

  return (
    <article
      ref={ref}
      className="relative mx-auto flex min-h-[68svh] max-w-xl flex-col justify-center px-5 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="glass-card relative overflow-hidden rounded-3xl"
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
        >
          <motion.img
            src={photo.src}
            width={photo.w}
            height={photo.h}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            style={{ y, scale, filter }}
            className={`absolute inset-0 h-full w-full object-cover ${
              flip ? 'origin-right' : 'origin-left'
            }`}
          />
          <motion.div style={{ backgroundColor: overlay }} className="absolute inset-0" />
          <div className="absolute inset-0 ring-1 ring-inset ring-gold-500/25" />
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center gap-3 text-gold-500">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.3em]">
              {facility.eyebrow}
            </span>
            <span className="h-px flex-1 bg-gold-500/30" />
            <span className="font-display text-xs text-cream-100/40">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <h2 className="font-display text-[1.6rem] font-light leading-tight text-cream-50">
            {facility.title}
          </h2>
          <p className="mt-2.5 text-[0.92rem] leading-relaxed text-cream-100/70">
            {facility.body}
          </p>
        </div>
      </motion.div>
    </article>
  )
}

/* ── 3. Trust ──────────────────────────────────────────────────────────── */

function Trust() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'center 45%'],
  })

  return (
    <section ref={ref} className="relative px-5 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.36em] text-gold-500">
          Why people come here
        </p>
        <h2 className="mb-10 text-balance font-display text-[clamp(1.6rem,7vw,2.4rem)] font-light leading-tight">
          Emergency care, diagnostics and surgery
          <span className="text-gold-500"> under one roof</span>
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl px-5 py-6">
              <CountUp
                value={stat.value}
                suffix={stat.suffix}
                progress={scrollYProgress}
                className="block font-display text-[2.6rem] font-light leading-none text-cream-50"
              />
              <span className="mt-2.5 block text-[0.8rem] font-medium leading-snug text-cream-100/80">
                {stat.label}
              </span>
              <span className="mt-1.5 block text-[0.64rem] leading-snug text-cream-100/40">
                {stat.note}
              </span>
            </div>
          ))}
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-2">
          {departments.map((d, i) => (
            <motion.li
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
              className="rounded-full border border-gold-500/25 bg-navy-800/60 px-4 py-2
                         text-[0.74rem] font-medium text-cream-100/80"
            >
              {d.label}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── 4. Closing ────────────────────────────────────────────────────────── */

function Closing() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['9%', '0%'])
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])

  const photo = photos.exterior

  return (
    <footer ref={ref} className="relative overflow-hidden px-5 pb-36 pt-20">
      <div className="absolute inset-0 -z-10">
        <img
          src={photo.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-full w-full scale-125 object-cover opacity-25 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/85 to-navy-900/60" />
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.36em] text-gold-500">
          Come and see us
        </p>
        <h2 className="mb-8 font-display text-[clamp(1.5rem,6.5vw,2.2rem)] font-light leading-tight">
          {hospital.fullName}
        </h2>

        <motion.figure
          style={{ y, scale }}
          className="glass-card mb-8 w-full overflow-hidden rounded-2xl p-1.5"
        >
          <img
            src={photo.src}
            width={photo.w}
            height={photo.h}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl"
          />
        </motion.figure>

        <address className="not-italic text-[0.95rem] leading-relaxed text-cream-100/70">
          {hospital.address.line1}
          <br />
          {hospital.address.line2}
        </address>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={hospital.whatsappText}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900"
          >
            Book on WhatsApp
          </a>
          <a
            href={hospital.phoneHref}
            className="rounded-full border border-cream-100/25 px-6 py-3 text-sm font-medium text-cream-50"
          >
            {hospital.phone}
          </a>
          <a
            href={hospital.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cream-100/25 px-6 py-3 text-sm font-medium text-cream-50"
          >
            Directions
          </a>
        </div>
      </div>
    </footer>
  )
}
