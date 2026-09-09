import * as THREE from 'three'

/**
 * Department markers are drawn here with Canvas 2D rather than loaded as image
 * files: line-art icons and short labels stay crisp at any distance, weigh
 * nothing to download, and the label text can be edited in content.js without
 * anyone having to re-export artwork.
 */

const SIZE = 512
const GOLD = '#e2b569'
const CREAM = '#f4ede1'

const ICONS = {
  cross: (c) => {
    const a = 26
    c.beginPath()
    c.moveTo(-a, -a * 0.4)
    c.lineTo(-a * 0.4, -a * 0.4)
    c.lineTo(-a * 0.4, -a)
    c.lineTo(a * 0.4, -a)
    c.lineTo(a * 0.4, -a * 0.4)
    c.lineTo(a, -a * 0.4)
    c.lineTo(a, a * 0.4)
    c.lineTo(a * 0.4, a * 0.4)
    c.lineTo(a * 0.4, a)
    c.lineTo(-a * 0.4, a)
    c.lineTo(-a * 0.4, a * 0.4)
    c.lineTo(-a, a * 0.4)
    c.closePath()
    c.stroke()
  },
  pulse: (c) => {
    c.beginPath()
    c.moveTo(-34, 0)
    c.lineTo(-14, 0)
    c.lineTo(-6, -24)
    c.lineTo(4, 22)
    c.lineTo(12, 0)
    c.lineTo(34, 0)
    c.stroke()
  },
  scalpel: (c) => {
    c.beginPath()
    c.moveTo(-28, 26)
    c.lineTo(2, -4)
    c.lineTo(26, -26)
    c.lineTo(18, 6)
    c.lineTo(-8, 26)
    c.closePath()
    c.stroke()
    c.beginPath()
    c.moveTo(2, -4)
    c.lineTo(18, 6)
    c.stroke()
  },
  scan: (c) => {
    const r = 28
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      c.beginPath()
      c.moveTo(sx * r, sy * r * 0.45)
      c.lineTo(sx * r, sy * r)
      c.lineTo(sx * r * 0.45, sy * r)
      c.stroke()
    }
    c.beginPath()
    c.moveTo(-r, 0)
    c.lineTo(r, 0)
    c.stroke()
  },
  flask: (c) => {
    c.beginPath()
    c.moveTo(-10, -28)
    c.lineTo(-10, -6)
    c.lineTo(-26, 22)
    c.quadraticCurveTo(-30, 30, -20, 30)
    c.lineTo(20, 30)
    c.quadraticCurveTo(30, 30, 26, 22)
    c.lineTo(10, -6)
    c.lineTo(10, -28)
    c.stroke()
    c.beginPath()
    c.moveTo(-16, -28)
    c.lineTo(16, -28)
    c.stroke()
  },
  pill: (c) => {
    c.save()
    c.rotate(-Math.PI / 4)
    c.beginPath()
    c.roundRect(-32, -16, 64, 32, 16)
    c.stroke()
    c.beginPath()
    c.moveTo(0, -16)
    c.lineTo(0, 16)
    c.stroke()
    c.restore()
  },
  bed: (c) => {
    c.beginPath()
    c.moveTo(-32, 24)
    c.lineTo(-32, -8)
    c.stroke()
    c.beginPath()
    c.moveTo(-32, 8)
    c.lineTo(32, 8)
    c.lineTo(32, 24)
    c.stroke()
    c.beginPath()
    c.moveTo(-32, 8)
    c.lineTo(-32, 24)
    c.stroke()
    c.beginPath()
    c.arc(-16, -2, 9, 0, Math.PI * 2)
    c.stroke()
    c.beginPath()
    c.moveTo(-2, 8)
    c.lineTo(-2, -2)
    c.lineTo(24, -2)
    c.lineTo(24, 8)
    c.stroke()
  },
  stethoscope: (c) => {
    c.beginPath()
    c.moveTo(-26, -28)
    c.lineTo(-26, -4)
    c.arc(-12, -4, 14, Math.PI, 0, true)
    c.lineTo(2, -28)
    c.stroke()
    c.beginPath()
    c.moveTo(-12, 10)
    c.lineTo(-12, 18)
    c.quadraticCurveTo(-12, 28, 2, 28)
    c.quadraticCurveTo(18, 28, 18, 16)
    c.stroke()
    c.beginPath()
    c.arc(18, 6, 10, 0, Math.PI * 2)
    c.stroke()
  },
}

export function createDepartmentTexture({ label, icon }) {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const c = canvas.getContext('2d')

  c.clearRect(0, 0, SIZE, SIZE)
  c.translate(SIZE / 2, SIZE / 2)

  // Soft warm disc behind the mark so it reads against the dark scene.
  const glow = c.createRadialGradient(0, -40, 10, 0, -40, 180)
  glow.addColorStop(0, 'rgba(226,181,105,0.30)')
  glow.addColorStop(0.55, 'rgba(226,181,105,0.08)')
  glow.addColorStop(1, 'rgba(226,181,105,0)')
  c.fillStyle = glow
  c.beginPath()
  c.arc(0, -40, 180, 0, Math.PI * 2)
  c.fill()

  // Ring.
  c.strokeStyle = 'rgba(226,181,105,0.55)'
  c.lineWidth = 3
  c.beginPath()
  c.arc(0, -40, 104, 0, Math.PI * 2)
  c.stroke()

  c.strokeStyle = 'rgba(244,237,225,0.16)'
  c.lineWidth = 1.5
  c.beginPath()
  c.arc(0, -40, 118, 0, Math.PI * 2)
  c.stroke()

  // Icon.
  c.save()
  c.translate(0, -40)
  c.scale(1.35, 1.35)
  c.strokeStyle = CREAM
  c.lineWidth = 4.5
  c.lineJoin = 'round'
  c.lineCap = 'round'
  ;(ICONS[icon] || ICONS.cross)(c)
  c.restore()

  // Label.
  c.fillStyle = GOLD
  c.font = '600 40px "Plus Jakarta Sans", system-ui, sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(label.toUpperCase(), 0, 132)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}
