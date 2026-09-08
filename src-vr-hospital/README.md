# VR Multispeciality Hospital — scroll-driven site

Source for the site published at [`/vr-hospital/`](../vr-hospital/) — a
scroll-scrubbed 3D walkthrough of VR Multispeciality Hospital & Diagnostic
Centre, Pedda Narava, Visakhapatnam.

## Two experiences, one set of content

| | Immersive (desktop / pointer) | Lite (touch, small, reduced-motion, Save-Data) |
|---|---|---|
| Motion | WebGL camera scrubbed along a corridor by scroll | 2D parallax, focus and fade |
| Ships | React + Framer Motion + Lenis **+ three.js + R3F + GSAP** | React + Framer Motion + Lenis only |
| JS over the wire | ~372 kB gzip | **~99 kB gzip** |

`src/lib/useDevice.js` picks between them, and **a toggle in the bottom-left
corner lets the visitor overrule that guess**; the choice is remembered.
`?mode=lite` and `?mode=3d` force a version too.

The guess is deliberately generous toward the 3D version: it steps down to lite
only for a viewport under 900px, a touch screen *with* a phone-sized viewport,
two cores or fewer, Save-Data, a slow connection, reduced-motion, or no WebGL.
A touch screen on its own is not a reason — plenty of capable laptops have one.

three.js sits behind a dynamic `import()`, so anyone on the lite version never
downloads it — that is the point of the fallback, not just the simpler
animation.

## How the 3D section works

Everything is a function of one scrubbed scroll value.

- **Lenis** replaces native scrolling (wheel only — phones keep their own
  momentum, which feels better than intercepting it).
- **GSAP ScrollTrigger** with `scrub` eases that value, so the camera glides
  and settles instead of snapping to the scrollbar. The value is published on
  every `gsap.ticker` tick, not from `onUpdate`, because a scrubbed tween keeps
  easing after the last scroll event.
- **`src/lib/timeline.js`** is the spine: section boundaries, the camera's path
  down the corridor, and where each photo hangs. Panel positions are derived
  *from* the camera path (`cameraZ(focusAt) - FOCUS_DISTANCE`), so a photo's
  sharpest moment and its caption's entrance can never drift apart.
- **`src/experience/shaders.js`** blurs each photo in its own fragment shader by
  an amount taken from its distance to the camera. That is a depth-of-field
  pass without an `EffectComposer`, and it is why photos resolve as you approach
  and soften as you slide past.

## Photographs

Every facility image is a real photograph of the hospital. Backgrounds,
particles, glows and the department icons are generated (shaders and Canvas 2D)
— no invented facility imagery.

**The photos were cropped out of a printed poster**, so they are small
(180–730 px on the long edge; the exterior is 1452 px). They are used at sizes
that suit that resolution. If original camera files exist, drop them into
`public/photos/` under the same names and update the dimensions in
`src/data/content.js` — everything else will pick them up.

## Content and claims

All copy lives in `src/data/content.js`. Figures carry a `source` field:

- `verified` — read off the hospital's own signboard or poster (15 beds; the
  eight departments visible in the photographs).
- `confirm` — **24/7 emergency cover is an inference, not something the
  hospital has stated.** Confirm the staffed hours before this goes live, or
  change the figure.

## Develop

```bash
npm install
npm run dev           # local dev server
npm run build         # writes the built site to ../vr-hospital
npm run build:single  # writes ../vr-hospital-standalone.html
```

`build:single` folds the JavaScript, the stylesheet and every photograph into
one HTML file that runs from any host with nothing beside it. It cannot keep
the code-split — there is nowhere to fetch a second chunk from — so every
visitor downloads three.js whether or not they get the 3D version: roughly
650 kB gzipped against about 160 kB for a phone loading `../vr-hospital`.
Prefer the folder build unless a single file is genuinely easier to deploy.

The built output is committed because this repository is published with GitHub
Pages' "deploy from branch", which does not run a build step. Rebuild and
commit `../vr-hospital` alongside any source change.
