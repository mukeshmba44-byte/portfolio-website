# VR Multispeciality Hospital — scroll-driven site

Source for the site published at [`/vr-hospital/`](../vr-hospital/) — a
scroll-scrubbed 3D walkthrough of VR Multispeciality Hospital & Diagnostic
Centre, Pedda Narava, Visakhapatnam.

## The opening

On load, a syringe stands in a dark, softly lit room. Pressing the plunger
sends a droplet down the screen carrying the hospital's mark inside it, and its
impact ripples out to wash in the site.

`src/experience/Intro.jsx` runs the whole thing as one GSAP timeline writing
into plain refs that the R3F frame loop reads — the same pattern the main scene
uses for scroll, so animation only ever reaches the 3D layer one way. The page
is scroll-locked (Lenis stopped) until it finishes, and the site is mounted
underneath while the droplet is still falling, so the ripple uncovers the real
page rather than a loading state. `prefers-reduced-motion` skips straight to
the site.

The syringe (`Syringe.jsx`) is modelled from primitives with its needle tip at
the group origin, so the scene can place and scale it by the one point that
matters — where the droplet is born. Nothing uses `transmission`: it makes
three render the scene again into a separate buffer every frame, which is far
too expensive on modest hardware for the small gain over a reflective
transparent material.

The droplet (`Droplet.jsx`) samples the logo in its own object space rather
than from a UV sphere map, so the mark reads as flat and suspended *inside* the
liquid, and is clipped to the droplet's silhouette for free.

## One experience

Every visitor gets the 3D walkthrough. three.js still sits behind a dynamic
import so the page can paint immediately rather than waiting on the bundle.

`lite/LiteExperience.jsx` is no longer something anyone is routed to — it
survives only as a fallback for a browser without WebGL, which would otherwise
be shown a blank page.

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
