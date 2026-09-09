import { useCallback, useEffect, useState } from 'react'
import Intro from './Intro.jsx'
import Immersive from './Immersive.jsx'
import { prefersReducedMotion } from '../lib/useDevice.js'

/**
 * Owns the opening sequence and hands over to the walkthrough.
 *
 * The site is mounted underneath while the droplet is still falling, so the
 * ripple uncovers the real page rather than a loading state, and the scroll
 * stays locked until the intro has finished playing.
 */
export default function Experience({ lenis }) {
  const [reduced] = useState(() => prefersReducedMotion())
  const [revealed, setRevealed] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  const lock = useCallback(() => {
    lenis?.stop()
    document.body.style.overflow = 'hidden'
  }, [lenis])

  const release = useCallback(() => {
    document.body.style.overflow = ''
    window.scrollTo(0, 0)
    lenis?.start()
  }, [lenis])

  // Keep the page locked for as long as the intro is on screen, including
  // across a late Lenis instance arriving.
  useEffect(() => {
    if (introDone) return undefined
    lock()
    return undefined
  }, [introDone, lock, lenis])

  useEffect(() => {
    if (!introDone) return undefined
    release()
    return undefined
  }, [introDone, release])

  useEffect(() => () => {
    document.body.style.overflow = ''
  }, [])

  return (
    <>
      {revealed && <Immersive lenis={lenis} scrollEnabled={introDone} />}
      {!introDone && (
        <Intro
          reducedMotion={reduced}
          onReveal={() => setRevealed(true)}
          onDone={() => setIntroDone(true)}
        />
      )}
    </>
  )
}
