/**
 * Folds the built bundle into one self-contained HTML file.
 *
 * Reads ../.single-build (produced by vite.config.single.js) and writes
 * ../vr-hospital-standalone.html with the JavaScript, the stylesheet and every
 * photograph inlined, so the file can be dropped on any host with nothing
 * beside it.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, dirname, extname, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dist = join(here, '..', '..', '.single-build')
const out = join(here, '..', '..', 'vr-hospital-standalone.html')

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }

async function dataUri(path) {
  const buf = await readFile(path)
  const mime = MIME[extname(path)] ?? 'application/octet-stream'
  return `data:${mime};base64,${buf.toString('base64')}`
}

/**
 * Every static file the build emitted, as a data: URI keyed by the path the
 * bundle refers to it by.
 *
 * This walks the tree rather than naming files: a hardcoded list silently
 * missed logo-mark.webp, which left a relative path in a file that has no
 * directory to resolve it against, and the failed texture load took the whole
 * page down with it.
 */
async function collectAssets() {
  const map = new Map()
  const skip = new Set(['.html', '.js', '.css', '.map'])

  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'assets') continue // JS and CSS are inlined separately
        await walk(full)
        continue
      }
      if (skip.has(extname(entry.name))) continue
      map.set(relative(dist, full).split(sep).join('/'), await dataUri(full))
    }
  }

  await walk(dist)
  return map
}

/** A string that is safe to drop between <script> tags. */
const forScript = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')

const bytes = (n) => `${(n / 1024).toFixed(0)} kB`

const assets = await collectAssets()

const assetNames = [...assets.keys()].sort((a, b) => b.length - a.length)
const swapAssets = (source) => {
  let result = source
  for (const name of assetNames) {
    result = result.split(name).join(assets.get(name))
  }
  return result
}

const files = await readdir(join(dist, 'assets'))
const jsFile = files.find((f) => f.endsWith('.js'))
const cssFile = files.find((f) => f.endsWith('.css'))
if (!jsFile) throw new Error('no JS chunk in .single-build/assets')

const js = swapAssets(await readFile(join(dist, 'assets', jsFile), 'utf8'))
const css = cssFile ? swapAssets(await readFile(join(dist, 'assets', cssFile), 'utf8')) : ''

let html = await readFile(join(dist, 'index.html'), 'utf8')

html = html
  .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/, () => `<script type="module">${forScript(js)}</script>`)
  .replace(/<link rel="stylesheet"[^>]*href="\.\/assets\/[^"]*"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/href="\.\/logo\.webp"/g, `href="${assets.get('logo.webp')}"`)
  .replace(/content="\.\/photos\/exterior\.webp"/g, `content="${assets.get('photos/exterior.webp')}"`)
  // A preload of an inlined image would be a second copy of the same bytes.
  .replace(/<link rel="preload"[^>]*>/g, '')

// Nothing may still point at a file on disk: the single HTML file has no
// directory to resolve a relative path against.
if (html.includes('./assets/')) throw new Error('an external asset reference survived inlining')
const leftovers = [...assets.keys()].filter((name) => html.includes(name))
if (leftovers.length) {
  throw new Error(`asset reference(s) survived inlining: ${leftovers.join(', ')}`)
}

await writeFile(out, html)

console.log(`vr-hospital-standalone.html  ${bytes(Buffer.byteLength(html))}`)
console.log(`  js ${bytes(js.length)}   css ${bytes(css.length)}   images ${assets.size}`)
