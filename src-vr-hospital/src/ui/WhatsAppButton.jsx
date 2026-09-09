import { motion } from 'framer-motion'
import { hospital } from '../data/content.js'

/**
 * Pinned bottom-right for the whole page, in both experiences. On a hospital
 * site this is the one control that always has to be one tap away.
 */
export default function WhatsAppButton() {
  return (
    <motion.a
      href={hospital.whatsappText}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book an appointment on WhatsApp"
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full
                 bg-[#128C4A] py-3 pl-3.5 pr-4 text-sm font-semibold text-white
                 shadow-[0_10px_34px_-8px_rgba(0,0,0,0.75)] ring-1 ring-white/25
                 sm:bottom-7 sm:right-7 sm:gap-3 sm:pr-5 sm:text-[0.95rem]"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-[#128C4A] opacity-60
                   motion-safe:animate-ping"
        style={{ animationDuration: '3.6s' }}
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 24 24"
        className="relative h-5 w-5 shrink-0 fill-current"
        aria-hidden="true"
      >
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23z" />
      </svg>
      <span className="relative whitespace-nowrap">Book on WhatsApp</span>
    </motion.a>
  )
}
