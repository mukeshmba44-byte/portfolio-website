/**
 * Shaders for the photo panels and the ambient particle field.
 *
 * The panel shader does the work that would otherwise need a post-processing
 * depth-of-field pass: it blurs its own texture by an amount the scene feeds in
 * from the camera's distance, so a photo genuinely resolves into focus as you
 * approach it and softens again as you pass. Doing it per-panel keeps the whole
 * effect to one extra dependency-free shader instead of an EffectComposer.
 */

export const panelVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const panelFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2  uPlane;      // geometry size in world units (w, h)
  uniform vec2  uPanel;      // panel size in world units (w, h)
  uniform vec2  uPhoto;      // photo size in world units (w, h)
  uniform float uBlur;       // 0 = sharp, 1 = fully soft
  uniform float uOpacity;
  uniform float uFocus;      // 0 = passing by, 1 = the panel being read
  uniform vec3  uGlass;
  uniform vec3  uEdge;

  varying vec2 vUv;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // 12-tap Poisson disk — enough taps to read as a lens defocus without the
  // cost of a separable two-pass blur on every panel.
  const vec2 TAPS[12] = vec2[12](
    vec2( 0.000,  0.000), vec2( 0.527,  0.085), vec2(-0.041,  0.457),
    vec2(-0.545, -0.021), vec2( 0.017, -0.529), vec2( 0.379,  0.402),
    vec2(-0.401,  0.371), vec2(-0.362, -0.393), vec2( 0.410, -0.358),
    vec2( 0.869,  0.318), vec2(-0.318,  0.869), vec2(-0.869, -0.318)
  );

  vec4 blurredPhoto(vec2 uv, float radius) {
    if (radius < 0.0015) return texture2D(uMap, uv);
    vec4 sum = vec4(0.0);
    float total = 0.0;
    for (int i = 0; i < 12; i++) {
      float w = 1.0 - length(TAPS[i]) * 0.45;
      sum += texture2D(uMap, uv + TAPS[i] * radius) * w;
      total += w;
    }
    return sum / total;
  }

  void main() {
    // Work in world units so corner radii and borders stay physically even on
    // panels of different aspect ratios. The geometry is larger than the panel
    // itself; the margin carries the panel's glow.
    vec2 p = (vUv - 0.5) * uPlane;

    float outer = roundedBox(p, uPanel * 0.5, 0.16);

    if (outer > 0.0) {
      // Warm spill around a lit panel — what makes the corridor feel lit from
      // the pictures rather than uniformly flooded.
      float halo = exp(-outer * 2.9) * (0.10 + 0.62 * uFocus);
      gl_FragColor = vec4(uEdge * 0.85, halo * uOpacity);
      return;
    }

    float inner = roundedBox(p, uPhoto * 0.5, 0.10);

    // Frosted glass surround. The band hugs the outer edge only: the SDF is 0
    // at the border and increasingly negative toward the middle of the panel.
    float glassEdge = smoothstep(-0.075, -0.004, outer);
    vec3 color = uGlass;
    float alpha = 0.30 + 0.22 * uFocus;

    if (inner < 0.0) {
      vec2 photoUv = (p / uPhoto) + 0.5;
      float radius = uBlur * 0.055;
      vec4 tex = blurredPhoto(photoUv, radius);

      // Out of focus reads as slightly cooler and dimmer, so the panel in
      // focus is unambiguously the one being talked about.
      float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      vec3 faded = mix(vec3(lum) * vec3(0.72, 0.80, 0.95), tex.rgb, 0.45);
      color = mix(faded * 0.55, tex.rgb, uFocus);
      color *= mix(0.62, 1.06, uFocus);
      alpha = 1.0;

      // Warm inner vignette keeps the low-light photos from going muddy at
      // the corners against the dark scene.
      float v = 1.0 - smoothstep(0.55, 1.25, length((photoUv - 0.5) * 2.0));
      color *= mix(0.80, 1.05, v);

      // Gold hairline where the photo meets the glass.
      float lip = 1.0 - smoothstep(0.0, 0.035, abs(inner));
      color = mix(color, uEdge, lip * (0.30 + 0.45 * uFocus));
    }

    // Gold rim around the whole panel, brighter when the panel is in focus.
    color = mix(color, uEdge, glassEdge * (0.35 + 0.4 * uFocus));
    alpha = max(alpha, glassEdge * (0.5 + 0.5 * uFocus));

    gl_FragColor = vec4(color, alpha * uOpacity);

    #include <colorspace_fragment>
  }
`

/* ── Ambient particle field (generated, not photographic) ───────────────── */

export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uCameraZ;

  attribute float aScale;
  attribute float aPhase;
  attribute vec3  aTint;

  varying float vAlpha;
  varying vec3  vTint;

  void main() {
    vec3 pos = position;

    // Slow, uneven drift — dust caught in the light rather than a starfield.
    pos.x += sin(uTime * 0.16 + aPhase) * 0.55;
    pos.y += cos(uTime * 0.13 + aPhase * 1.7) * 0.42;

    // Recycle motes behind the camera to the far end of the corridor so the
    // field is endless without needing more geometry.
    float span = 190.0;
    pos.z = uCameraZ - 8.0 - mod(uCameraZ - 8.0 - pos.z, span);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mv.z;

    // Fade in from the far plane and out as they pass the lens.
    vAlpha = smoothstep(150.0, 55.0, dist) * smoothstep(1.5, 9.0, dist);
    vAlpha *= 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.7 + aPhase * 3.1));
    vTint = aTint;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (34.0 / max(dist, 1.0));
  }
`

export const particleFragment = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  varying vec3  vTint;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = pow(1.0 - d * 2.0, 2.2);
    gl_FragColor = vec4(vTint, soft * vAlpha);
  }
`

/* ── Backdrop: a warm gradient the corridor sits inside ─────────────────── */

export const backdropVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const backdropFragment = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uWarm;
  varying vec2 vUv;

  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c * vec2(1.35, 1.0));

    vec3 deep = vec3(0.012, 0.043, 0.086);
    vec3 mid  = vec3(0.035, 0.114, 0.196);
    vec3 warm = vec3(0.40, 0.30, 0.17);

    // A soft breathing pool of warm light dead ahead — the far end of the
    // corridor, so there is always somewhere for the eye to travel toward.
    float glow = smoothstep(0.62, 0.0, r);
    float pulse = 0.86 + 0.14 * sin(uTime * 0.35);

    vec3 color = mix(deep, mid, smoothstep(0.85, 0.05, r));
    color = mix(color, warm, glow * glow * 0.30 * pulse * uWarm);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
  }
`
