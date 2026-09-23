const TAU = Math.PI * 2
const DEG = Math.PI / 180

// The canvas reaches under the text column; this strip is masked out in CSS,
// so the scene is centred in the remaining area rather than in the element.
const LEFT_PAD = 220

const NODE_COUNT = 1200
const HUB_COUNT = 240
// Short, dense links read as fabric; long ones resolve into separate triangles
// and the sphere starts looking like a diagram.
const HUB_LINK_ANGLE = 0.33
const HUB_LINK_CHANCE = 0.82
const HUB_MAX_DEGREE = 5

const SPHERE_PERIOD = 105
const AXIS_TILT = 18 * DEG
const NEBULA_PERIOD = 14
const STAR_PERIOD_A = 9
const STAR_PERIOD_B = 13

const LIGHT = { x: -0.5, y: -0.62, z: 0.6 }

const CYAN = [38, 209, 255] as const
const BLUE = [87, 152, 255] as const
const VIOLET = [155, 120, 255] as const
const NODE_COLORS = [CYAN, BLUE, VIOLET] as const

type Rgb = readonly [number, number, number] | readonly number[]

type Orbit = {
  radius: number
  tilt: number
  roll: number
  period: number
  phase: number
  planetScale: number
  from: Rgb
  to: Rgb
  glow: number
}

// Two rings read as one system: mirrored rolls cross near the sphere, the
// steeper ring carries the fast planet along the reference's 45° diagonal.
// The radii and tilts are kept well apart so the rings never look concentric
// and the two moons plainly belong to different paths.
const ORBITS: Orbit[] = [
  {
    radius: 1.48, tilt: 70 * DEG, roll: -43 * DEG,
    period: 25, phase: 0, planetScale: 0.12,
    from: VIOLET, to: CYAN, glow: 1,
  },
  {
    radius: 1.16, tilt: 52 * DEG, roll: 46 * DEG,
    period: 50, phase: 150 * DEG, planetScale: 0.094,
    from: CYAN, to: BLUE, glow: 0.72,
  },
]

const orbitPoint = (orbit: Orbit, t: number): [number, number, number] => {
  const { roll, tilt, radius } = orbit
  const cr = Math.cos(roll), sr = Math.sin(roll)
  const ct = Math.cos(tilt), st = Math.sin(tilt)
  const cos = Math.cos(t), sin = Math.sin(t)
  return [
    radius * (cos * cr + sin * -sr * ct),
    radius * (cos * sr + sin * cr * ct),
    radius * (sin * st),
  ]
}

// The 25s/50s pair is a 2:1 resonance, so the whole encounter pattern repeats
// every 50s instead of drifting through every relative phase. Radii, tilts and
// the start phase were solved against that cycle: closest approach leaves 0.43R
// between centres, roughly one planet diameter of clear space.

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

const mulberry32 = (seed: number) => (): number => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const rgba = (color: Rgb, alpha: number): string =>
  `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`

const mixRgb = (from: Rgb, to: Rgb, t: number): number[] => [
  from[0] + (to[0] - from[0]) * t,
  from[1] + (to[1] - from[1]) * t,
  from[2] + (to[2] - from[2]) * t,
]

type Node = {
  x: number; y: number; z: number
  size: number
  lum: number
  color: number
}

type Metrics = { cssW: number; cssH: number; dpr: number; cx: number; cy: number; r: number }

const randomUnit = (rnd: () => number): [number, number, number] => {
  const z = rnd() * 2 - 1
  const a = rnd() * TAU
  const s = Math.sqrt(Math.max(0, 1 - z * z))
  return [s * Math.cos(a), s * Math.sin(a), z]
}

// Points sit in a handful of drifts of density rather than on an even mesh:
// an even mesh projects as a geodesic grid and reads as a wireframe globe.
const buildNodes = (rnd: () => number): Node[] => {
  const clusters: [number, number, number][] = []
  for (let i = 0; i < 6; i++) clusters.push(randomUnit(rnd))

  const nodes: Node[] = []
  for (let i = 0; i < NODE_COUNT; i++) {
    const isHub = i < HUB_COUNT
    const clustered = rnd() < (isHub ? 0.72 : 0.45)
    let x: number, y: number, z: number

    if (clustered) {
      const c = clusters[(rnd() * clusters.length) | 0]
      let ax = -c[1], ay = c[0], az = 0
      let len = Math.hypot(ax, ay, az)
      if (len < 1e-4) { ax = 1; ay = 0; az = 0; len = 1 }
      ax /= len; ay /= len; az /= len
      const bx = c[1] * az - c[2] * ay
      const by = c[2] * ax - c[0] * az
      const bz = c[0] * ay - c[1] * ax
      const spread = (rnd() + rnd() + rnd()) / 3
      const a = spread * spread * 0.95
      const azimuth = rnd() * TAU
      const sa = Math.sin(a), ca = Math.cos(a)
      const cb = Math.cos(azimuth), sb = Math.sin(azimuth)
      x = c[0] * ca + (ax * cb + bx * sb) * sa
      y = c[1] * ca + (ay * cb + by * sb) * sa
      z = c[2] * ca + (az * cb + bz * sb) * sa
    } else {
      ;[x, y, z] = randomUnit(rnd)
    }

    const pick = rnd()
    nodes.push({
      x, y, z,
      size: isHub ? 1.15 + rnd() * 1.55 : 0.5 + rnd() * 0.72,
      lum: isHub ? 0.78 + rnd() * 0.22 : 0.34 + rnd() * 0.44,
      color: pick < 0.45 ? 0 : pick < 0.83 ? 1 : 2,
    })
  }
  return nodes
}

const buildEdges = (nodes: Node[], rnd: () => number): Uint16Array => {
  const pairs: number[] = []
  const degree = new Uint8Array(HUB_COUNT)
  const threshold = Math.cos(HUB_LINK_ANGLE)

  for (let i = 0; i < HUB_COUNT; i++) {
    if (degree[i] >= HUB_MAX_DEGREE) continue
    const a = nodes[i]
    for (let j = i + 1; j < HUB_COUNT; j++) {
      if (degree[i] >= HUB_MAX_DEGREE) break
      if (degree[j] >= HUB_MAX_DEGREE) continue
      const b = nodes[j]
      if (a.x * b.x + a.y * b.y + a.z * b.z < threshold) continue
      if (rnd() > HUB_LINK_CHANCE) continue
      pairs.push(i, j)
      degree[i]++
      degree[j]++
    }
  }
  return Uint16Array.from(pairs)
}

const makeCanvas = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  return [canvas, canvas.getContext('2d') as CanvasRenderingContext2D]
}

const buildGlowSprite = (radius: number, color: Rgb, core: number): HTMLCanvasElement => {
  const size = Math.ceil(radius * 2)
  const [canvas, ctx] = makeCanvas(size, size)
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius)
  gradient.addColorStop(0, rgba(color, core))
  gradient.addColorStop(0.25, rgba(color, core * 0.42))
  gradient.addColorStop(0.55, rgba(color, core * 0.12))
  gradient.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}

// Planet light is baked as overlapping offset veils rather than one perfect
// radial disc. The live renderer still draws a single bitmap per planet.
const buildPlanetGlowSprite = (radius: number, seed: number, color: Rgb, core: number): HTMLCanvasElement => {
  const size = Math.ceil(radius * 2)
  const [canvas, ctx] = makeCanvas(size, size)
  const c = size / 2
  const rnd = mulberry32(seed)

  const base = ctx.createRadialGradient(c - radius * 0.1, c - radius * 0.14, 0, c, c, radius)
  base.addColorStop(0, rgba(color, core * 0.72))
  base.addColorStop(0.2, rgba(color, core * 0.32))
  base.addColorStop(0.55, rgba(color, core * 0.09))
  base.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 7; i++) {
    const angle = rnd() * TAU
    const distance = radius * (0.08 + rnd() * 0.28)
    const x = c + Math.cos(angle) * distance
    const y = c + Math.sin(angle) * distance
    const r = radius * (0.24 + rnd() * 0.3)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + rnd() * 0.8)
    ctx.scale(1, 0.5 + rnd() * 0.38)
    const veil = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    const alpha = core * (0.06 + rnd() * 0.09)
    veil.addColorStop(0, rgba(mixRgb(color, VIOLET, rnd() * 0.34), alpha))
    veil.addColorStop(0.48, rgba(color, alpha * 0.32))
    veil.addColorStop(1, rgba(color, 0))
    ctx.fillStyle = veil
    ctx.fillRect(-r, -r, r * 2, r * 2)
    ctx.restore()
  }
  return canvas
}

// Baked once per resize: a coloured core, broken smoke corona and faint halo.
// The live renderer still uses the same two cached bitmaps per satellite.
const buildPlanetSprite = (radius: number, seed: number, tint: Rgb, accent: Rgb): HTMLCanvasElement => {
  const pad = Math.max(2, radius * 0.18)
  const size = Math.ceil(radius * 2 + pad * 2)
  const [canvas, ctx] = makeCanvas(size, size)
  const c = size / 2
  const rnd = mulberry32(seed)

  const blue = mixRgb(tint, BLUE, 0.65)
  const cyan = mixRgb(blue, CYAN, 0.68)
  const violet = mixRgb(blue, VIOLET, 0.72)

  ctx.save()

  const base = ctx.createRadialGradient(
    c - radius * 0.18, c - radius * 0.12, radius * 0.04,
    c + radius * 0.04, c + radius * 0.08, radius * 0.9,
  )
  base.addColorStop(0, rgba(cyan, 0.17))
  base.addColorStop(0.3, rgba(blue, 0.11))
  base.addColorStop(0.65, rgba(violet, 0.035))
  base.addColorStop(1, rgba(blue, 0))
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Three soft internal folds lead into an off-centre coloured condensation.
  // They are baked into the sprite, never stroked or blurred in the frame loop.
  const coreX = c + radius * (seed % 2 ? -0.16 : 0.13)
  const coreY = c - radius * 0.1
  const coreColor = mixRgb(BLUE, accent, 0.9)
  const coronaWeight = accent === VIOLET ? 1.12 : 1
  const folds = [
    [-0.2, 0.16, 0.42, -0.65],
    [0.22, 0.12, 0.36, 0.55],
    [0.06, -0.22, 0.32, -0.3],
  ]
  for (const [dx, dy, length, angle] of folds) {
    ctx.save()
    ctx.translate(coreX + dx * radius, coreY + dy * radius)
    ctx.rotate(angle)
    ctx.scale(1, 0.28)
    const reach = length * radius
    const fold = ctx.createRadialGradient(0, 0, 0, 0, 0, reach)
    fold.addColorStop(0, rgba(coreColor, 0.34))
    fold.addColorStop(0.4, rgba(coreColor, 0.19))
    fold.addColorStop(1, rgba(coreColor, 0))
    ctx.fillStyle = fold
    ctx.fillRect(-reach, -reach, reach * 2, reach * 2)
    ctx.restore()
  }

  // Keep the smoke behind the corona thin, so it does not become a cotton shell.
  for (let i = 0; i < 11; i++) {
    if (i === 3 || i === 8) continue
    const angle = (i / 11) * TAU + (rnd() - 0.5) * 0.62
    const distance = radius * (0.48 + rnd() * 0.13)
    const x = coreX + Math.cos(angle) * distance
    const y = coreY + Math.sin(angle) * distance
    const reach = radius * (0.17 + rnd() * 0.08)
    const color = mixRgb(coreColor, i % 3 === 0 ? cyan : violet, 0.15 + rnd() * 0.25)
    const sectorWeight = i < 3 ? 1.2 : i < 7 ? 0.58 : 0.92
    const alpha = (0.12 + rnd() * 0.13) * sectorWeight * coronaWeight
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI * 0.5)
    ctx.scale(1, 0.24 + rnd() * 0.12)
    const smoke = ctx.createRadialGradient(0, 0, 0, 0, 0, reach)
    smoke.addColorStop(0, rgba(color, alpha))
    smoke.addColorStop(0.52, rgba(color, alpha * 0.42))
    smoke.addColorStop(1, rgba(color, 0))
    ctx.fillStyle = smoke
    ctx.fillRect(-reach, -reach, reach * 2, reach * 2)
    ctx.restore()
  }

  // Broken, softly glowing contour: each short curve has its own radius,
  // weight and gap, so the corona never resolves into a perfect ring.
  for (let i = 0; i < 10; i++) {
    if (i === 3 || i === 5 || i === 8) continue
    const start = (i / 10) * TAU + rnd() * 0.12
    const span = 0.25 + rnd() * 0.25
    const contourRadius = radius * (0.53 + rnd() * 0.14)
    const mid = start + span * 0.5
    const end = start + span
    const color = mixRgb(coreColor, i % 3 === 0 ? cyan : violet, 0.12 + rnd() * 0.2)
    const weight = (i % 3 === 1 ? 0.3 : i === 2 ? 0.65 : 1) * coronaWeight
    const strength = Math.min(0.92, (0.7 + rnd() * 0.22) * weight)
    ctx.beginPath()
    ctx.moveTo(
      coreX + Math.cos(start) * contourRadius,
      coreY + Math.sin(start) * contourRadius,
    )
    ctx.quadraticCurveTo(
      coreX + Math.cos(mid) * contourRadius * (0.97 + rnd() * 0.14),
      coreY + Math.sin(mid) * contourRadius * (0.97 + rnd() * 0.14),
      coreX + Math.cos(end) * contourRadius * (0.92 + rnd() * 0.13),
      coreY + Math.sin(end) * contourRadius * (0.92 + rnd() * 0.13),
    )
    ctx.lineCap = 'round'
    ctx.lineWidth = radius * (0.08 + rnd() * 0.03)
    ctx.strokeStyle = rgba(color, strength * 0.24)
    ctx.stroke()
    ctx.lineWidth = radius * (0.028 + rnd() * 0.024)
    ctx.strokeStyle = rgba(color, strength)
    ctx.stroke()
  }

  // Ease back only the smoke crossing the centre; the outer corona stays intact.
  ctx.globalCompositeOperation = 'destination-out'
  const clearCentre = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, radius * 0.43)
  clearCentre.addColorStop(0, 'rgba(0, 0, 0, 0.24)')
  clearCentre.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = clearCentre
  ctx.fillRect(coreX - radius * 0.43, coreY - radius * 0.43, radius * 0.86, radius * 0.86)
  ctx.globalCompositeOperation = 'source-over'

  // Offset layers keep the compact core from reading as a uniform round disc.
  const coreRadius = radius * 0.32
  const hotspotColor: Rgb = accent === VIOLET ? [202, 187, 255] : [174, 244, 255]
  const sourceX = coreX - radius * 0.035
  const sourceY = coreY - radius * 0.045
  const innerGlow = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, radius * 0.44)
  innerGlow.addColorStop(0, rgba(coreColor, 0.55))
  innerGlow.addColorStop(0.48, rgba(coreColor, 0.27))
  innerGlow.addColorStop(1, rgba(coreColor, 0))
  ctx.fillStyle = innerGlow
  ctx.fillRect(sourceX - radius * 0.44, sourceY - radius * 0.44, radius * 0.88, radius * 0.88)

  const mainX = coreX - radius * 0.025
  const mainY = coreY + radius * 0.02
  const edgeColor = mixRgb(coreColor, accent === VIOLET ? VIOLET : BLUE, 0.38)
  const condensation = ctx.createRadialGradient(mainX, mainY, 0, mainX, mainY, coreRadius)
  condensation.addColorStop(0, rgba(mixRgb(coreColor, hotspotColor, 0.18), 0.98))
  condensation.addColorStop(0.38, rgba(coreColor, 0.98))
  condensation.addColorStop(0.7, rgba(coreColor, 0.86))
  condensation.addColorStop(0.87, rgba(edgeColor, 0.42))
  condensation.addColorStop(1, rgba(coreColor, 0))
  ctx.fillStyle = condensation
  ctx.fillRect(mainX - coreRadius, mainY - coreRadius, coreRadius * 2, coreRadius * 2)

  const lobeX = coreX + radius * 0.075
  const lobeY = coreY - radius * 0.035
  const lobeRadius = radius * 0.24
  const lobe = ctx.createRadialGradient(lobeX, lobeY, 0, lobeX, lobeY, lobeRadius)
  lobe.addColorStop(0, rgba(coreColor, 0.68))
  lobe.addColorStop(0.55, rgba(coreColor, 0.4))
  lobe.addColorStop(1, rgba(coreColor, 0))
  ctx.fillStyle = lobe
  ctx.fillRect(lobeX - lobeRadius, lobeY - lobeRadius, lobeRadius * 2, lobeRadius * 2)

  // The single coloured source is small and slightly off-centre, never white.
  const hotspotRadius = radius * 0.1
  const hotspot = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, hotspotRadius)
  hotspot.addColorStop(0, rgba(hotspotColor, 1))
  hotspot.addColorStop(0.42, rgba(hotspotColor, 0.92))
  hotspot.addColorStop(0.76, rgba(hotspotColor, 0.38))
  hotspot.addColorStop(1, rgba(hotspotColor, 0))
  ctx.fillStyle = hotspot
  ctx.fillRect(sourceX - hotspotRadius, sourceY - hotspotRadius, hotspotRadius * 2, hotspotRadius * 2)

  // The faint residual light vanishes before the bitmap boundary.
  ctx.globalCompositeOperation = 'destination-in'
  const edgeMask = ctx.createRadialGradient(c, c, radius * 0.3, c, c, radius * 0.96)
  edgeMask.addColorStop(0, 'rgba(255, 255, 255, 1)')
  edgeMask.addColorStop(0.55, 'rgba(255, 255, 255, 0.86)')
  edgeMask.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)')
  edgeMask.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = edgeMask
  ctx.fillRect(0, 0, size, size)
  ctx.restore()

  return canvas
}

const buildNebula = (w: number, h: number): HTMLCanvasElement => {
  const [canvas, ctx] = makeCanvas(w * 0.5, h * 0.5)
  const cw = canvas.width
  const ch = canvas.height
  const rnd = mulberry32(9731)
  ctx.globalCompositeOperation = 'lighter'

  ctx.save()
  ctx.translate(cw * 0.6, ch * 0.52)
  ctx.rotate(-0.6)
  ctx.scale(1, 0.32)
  const band = ctx.createRadialGradient(0, 0, 0, 0, 0, cw * 0.82)
  band.addColorStop(0, 'rgba(104, 84, 186, 0.42)')
  band.addColorStop(0.4, 'rgba(58, 72, 164, 0.24)')
  band.addColorStop(0.74, 'rgba(32, 44, 112, 0.1)')
  band.addColorStop(1, 'rgba(14, 20, 62, 0)')
  ctx.fillStyle = band
  ctx.fillRect(-cw * 1.5, -ch * 2, cw * 3, ch * 4)
  ctx.restore()

  const puffs: [number, number, number, Rgb, number][] = [
    [0.74, 0.76, 0.46, VIOLET, 0.17],
    [0.42, 0.28, 0.34, BLUE, 0.12],
    [0.86, 0.34, 0.3, BLUE, 0.13],
    [0.58, 0.86, 0.34, VIOLET, 0.12],
    [0.3, 0.66, 0.3, BLUE, 0.09],
    [0.92, 0.6, 0.26, CYAN, 0.08],
    [0.66, 0.14, 0.26, VIOLET, 0.09],
  ]
  for (const [fx, fy, fr, color, alpha] of puffs) {
    const x = cw * fx
    const y = ch * fy
    const r = Math.max(cw, ch) * fr
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rnd() * TAU)
    ctx.scale(1, 0.58 + rnd() * 0.3)
    const puff = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    puff.addColorStop(0, rgba(color, alpha))
    puff.addColorStop(0.45, rgba(color, alpha * 0.4))
    puff.addColorStop(1, rgba(color, 0))
    ctx.fillStyle = puff
    ctx.fillRect(-r, -r, r * 2, r * 2)
    ctx.restore()
  }
  return canvas
}

const buildStars = (w: number, h: number, count: number, seed: number): HTMLCanvasElement => {
  const [canvas, ctx] = makeCanvas(w, h)
  const rnd = mulberry32(seed)
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < count; i++) {
    const x = rnd() * canvas.width
    const y = rnd() * canvas.height
    const size = rnd() < 0.86 ? 0.55 + rnd() * 0.55 : 0.95 + rnd() * 0.85
    const alpha = 0.2 + rnd() * 0.6
    const tint = rnd()
    const color = tint < 0.6 ? [212, 228, 255] : tint < 0.86 ? CYAN : VIOLET
    ctx.fillStyle = rgba(color, alpha)
    ctx.beginPath()
    ctx.arc(x, y, size, 0, TAU)
    ctx.fill()
  }
  return canvas
}

export const initHeroScene = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rnd = mulberry32(20260921)
  const nodes = buildNodes(rnd)
  const edges = buildEdges(nodes, rnd)

  const rx = new Float32Array(NODE_COUNT)
  const ry = new Float32Array(NODE_COUNT)
  const rz = new Float32Array(NODE_COUNT)
  const px = new Float32Array(NODE_COUNT)
  const py = new Float32Array(NODE_COUNT)
  const pr = new Float32Array(NODE_COUNT)
  const bucket = new Uint8Array(NODE_COUNT)

  const ALPHA_STEPS = 8
  const EDGE_STEPS = 5

  let metrics: Metrics = { cssW: 0, cssH: 0, dpr: 1, cx: 0, cy: 0, r: 1 }
  let nebula: HTMLCanvasElement | null = null
  let starsA: HTMLCanvasElement | null = null
  let starsB: HTMLCanvasElement | null = null
  let halo: HTMLCanvasElement | null = null
  let core: HTMLCanvasElement | null = null
  let planetGlows: HTMLCanvasElement[] = []
  let hubGlow: HTMLCanvasElement | null = null
  let planetSprites: HTMLCanvasElement[] = []
  let nodeLimit = NODE_COUNT
  let frameBudget = 1000 / 30
  // Phones get one ring, one moon and a still frame: the scene is an accent
  // there, not the subject.
  let compact = false

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let running = false
  let visible = true
  let inView = true
  let rafId = 0
  let lastDraw = 0
  let elapsed = 0

  const measure = (): boolean => {
    const rect = canvas.getBoundingClientRect()
    const cssW = Math.max(1, Math.round(rect.width))
    const cssH = Math.max(1, Math.round(rect.height))
    if (cssW === metrics.cssW && cssH === metrics.cssH) return false

    compact = window.innerWidth <= 860
    const dpr = clamp(window.devicePixelRatio || 1, 1, compact ? 1.25 : 1.75)
    const pad = compact ? 0 : LEFT_PAD
    const usable = Math.max(120, cssW - pad)
    const r = compact
      ? Math.min(cssW, cssH) * 0.3
      : clamp(usable / 3.05, 140, 305)

    metrics = {
      cssW, cssH, dpr,
      cx: pad + usable * 0.5,
      cy: cssH * (compact ? 0.5 : 0.48),
      r,
    }

    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)

    nodeLimit = compact ? 260 : window.innerWidth < 1080 ? 600 : NODE_COUNT
    frameBudget = 1000 / 30

    nebula = buildNebula(cssW, cssH)
    starsA = buildStars(cssW, cssH, compact ? 120 : 420, 4177)
    starsB = buildStars(cssW, cssH, compact ? 60 : 240, 8291)
    halo = buildGlowSprite(r * 1.55, BLUE, 0.24)
    core = buildGlowSprite(r * 0.72, CYAN, 0.2)
    planetGlows = ORBITS.map((orbit, index) =>
      buildPlanetGlowSprite(
        Math.max(18, r * 0.42),
        6121 + index * 947,
        mixRgb(orbit.from, orbit.to, 0.42),
        0.24,
      ),
    )
    hubGlow = buildGlowSprite(Math.max(8, r * 0.055), CYAN, 0.5)
    // Built at device resolution: a sprite baked in CSS pixels gets upscaled by
    // the DPR transform and the surface detail smears back into a smooth ball.
    planetSprites = ORBITS.map((orbit, index) =>
      buildPlanetSprite(
        Math.max(6, r * orbit.planetScale) * dpr,
        1471 + index * 733,
        index === 0 ? [101, 145, 214] : [92, 129, 205],
        index === 0 ? CYAN : VIOLET,
      ),
    )
    return true
  }

  const project = (): void => {
    const { cx, cy, r } = metrics
    for (let i = 0; i < nodeLimit; i++) {
      px[i] = cx + rx[i] * r
      py[i] = cy + ry[i] * r
      const depth = (rz[i] + 1) * 0.5
      const shade = 0.45 + 0.55 * Math.max(0, rx[i] * LIGHT.x + ry[i] * LIGHT.y + rz[i] * LIGHT.z)
      // Points near the silhouette stay bright: the lit limb is what makes a
      // point cloud read as a solid body rather than a haze.
      const limb = 1 + 0.42 * (1 - Math.abs(rz[i]))
      const alpha = clamp(1.3 * nodes[i].lum * shade * limb * (0.14 + 0.86 * Math.pow(depth, 1.15)), 0, 1)
      pr[i] = nodes[i].size * (0.62 + 0.55 * depth)
      bucket[i] = Math.min(ALPHA_STEPS - 1, (alpha * ALPHA_STEPS) | 0)
    }
  }

  const rotate = (angle: number): void => {
    const ax = Math.sin(AXIS_TILT)
    const ay = Math.cos(AXIS_TILT)
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const t = 1 - c
    const m0 = t * ax * ax + c
    const m1 = t * ax * ay
    const m2 = s * ay
    const m3 = t * ax * ay
    const m4 = t * ay * ay + c
    const m5 = -s * ax
    const m6 = -s * ay
    const m7 = s * ax
    const m8 = c

    for (let i = 0; i < nodeLimit; i++) {
      const { x, y, z } = nodes[i]
      rx[i] = m0 * x + m1 * y + m2 * z
      ry[i] = m3 * x + m4 * y + m5 * z
      rz[i] = m6 * x + m7 * y + m8 * z
    }
  }

  const drawNodes = (front: boolean): void => {
    for (let color = 0; color < NODE_COLORS.length; color++) {
      for (let step = 1; step < ALPHA_STEPS; step++) {
        ctx.beginPath()
        let used = false
        for (let i = 0; i < nodeLimit; i++) {
          if (bucket[i] !== step || nodes[i].color !== color) continue
          if ((rz[i] >= 0) !== front) continue
          const radius = pr[i]
          ctx.moveTo(px[i] + radius, py[i])
          ctx.arc(px[i], py[i], radius, 0, TAU)
          used = true
        }
        if (!used) continue
        ctx.fillStyle = rgba(NODE_COLORS[color], (step + 0.5) / ALPHA_STEPS)
        ctx.fill()
      }
    }

    if (!hubGlow) return
    const size = hubGlow.width
    for (let i = 0; i < Math.min(HUB_COUNT, nodeLimit); i++) {
      if ((rz[i] >= 0) !== front) continue
      if (nodes[i].lum < 0.9) continue
      const depth = (rz[i] + 1) * 0.5
      ctx.globalAlpha = 0.1 + 0.34 * depth
      ctx.drawImage(hubGlow, px[i] - size * 0.5, py[i] - size * 0.5)
    }
    ctx.globalAlpha = 1
  }

  const drawEdges = (front: boolean): void => {
    const { cx, cy, r } = metrics
    for (let step = 1; step < EDGE_STEPS; step++) {
      ctx.beginPath()
      let used = false
      for (let e = 0; e < edges.length; e += 2) {
        const i = edges[e]
        const j = edges[e + 1]
        const mz = (rz[i] + rz[j]) * 0.5
        if ((mz >= 0) !== front) continue

        const depth = (mz + 1) * 0.5
        const alpha = 0.05 + 0.36 * Math.pow(depth, 1.6)
        if (Math.min(EDGE_STEPS - 1, (alpha / 0.41 * EDGE_STEPS) | 0) !== step) continue

        let mx = rx[i] + rx[j]
        let my = ry[i] + ry[j]
        let mzz = rz[i] + rz[j]
        const len = Math.hypot(mx, my, mzz)
        if (len < 1e-4) continue
        mx /= len; my /= len; mzz /= len
        // Bulge the control point out to the surface so the link follows the
        // sphere instead of cutting through it as a flat chord.
        const cosHalf = Math.max(0.2, rx[i] * mx + ry[i] * my + rz[i] * mzz)
        const k = r / cosHalf

        ctx.moveTo(cx + rx[i] * r, cy + ry[i] * r)
        ctx.quadraticCurveTo(cx + mx * k, cy + my * k, cx + rx[j] * r, cy + ry[j] * r)
        used = true
      }
      if (!used) continue
      const tone = mixRgb(BLUE, CYAN, step / (EDGE_STEPS - 1))
      ctx.strokeStyle = rgba(tone, (step / EDGE_STEPS) * 0.42)
      ctx.lineWidth = front ? 0.7 : 0.5
      ctx.stroke()
    }
  }

  // Segments rather than one stroked ellipse: per-segment alpha turns the ring
  // into a light trail and lets it fade where it passes behind the sphere.
  const drawOrbit = (orbit: Orbit, front: boolean, planetT: number): void => {
    const { cx, cy, r } = metrics
    const steps = 96
    let prev = orbitPoint(orbit, 0)

    for (let s = 1; s <= steps; s++) {
      const t = (s / steps) * TAU
      const next = orbitPoint(orbit, t)
      const mz = (prev[2] + next[2]) * 0.5
      if ((mz >= 0) !== front) { prev = next; continue }

      const mx = cx + (prev[0] + next[0]) * 0.5 * r
      const my = cy + (prev[1] + next[1]) * 0.5 * r
      const depth = (mz / orbit.radius + 1) * 0.5

      let alpha = (0.08 + 0.34 * depth) * orbit.glow
      if (!front) {
        const dist = Math.hypot(mx - cx, my - cy)
        alpha *= 0.18 + 0.82 * smoothstep(r * 0.78, r * 1.08, dist)
      }

      let delta = Math.abs(t - planetT) % TAU
      if (delta > Math.PI) delta = TAU - delta
      alpha *= 1 + 1.5 * Math.pow(Math.max(0, 1 - delta / 0.9), 2)

      ctx.strokeStyle = rgba(mixRgb(orbit.from, orbit.to, s / steps), clamp(alpha, 0, 0.85))
      ctx.lineWidth = (front ? 1.15 : 0.8) * (0.7 + 0.5 * depth)
      ctx.beginPath()
      ctx.moveTo(cx + prev[0] * r, cy + prev[1] * r)
      ctx.lineTo(cx + next[0] * r, cy + next[1] * r)
      ctx.stroke()
      prev = next
    }
  }

  const drawPlanet = (orbit: Orbit, index: number, t: number): void => {
    const { cx, cy, r } = metrics
    const [ox, oy, oz] = orbitPoint(orbit, t)
    const x = cx + ox * r
    const y = cy + oy * r
    const depth = (oz / orbit.radius + 1) * 0.5

    let dim = 1
    if (oz < 0) {
      const dist = Math.hypot(x - cx, y - cy)
      dim = 0.32 + 0.68 * smoothstep(r * 0.82, r * 1.12, dist)
    }

    const planetGlow = planetGlows[index]
    if (planetGlow) {
      const g = planetGlow.width
      const scale = r * orbit.planetScale * 3.5 / g
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = (0.22 + 0.18 * depth) * dim * orbit.glow
      ctx.drawImage(planetGlow, x - g * scale * 0.5, y - g * scale * 0.5, g * scale, g * scale)
      ctx.globalAlpha = 1
    }

    const sprite = planetSprites[index]
    if (sprite) {
      const w = sprite.width / metrics.dpr
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = dim
      ctx.drawImage(sprite, x - w * 0.5, y - w * 0.5, w, w)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'lighter'
    }
  }

  const drawRim = (): void => {
    const { cx, cy, r } = metrics
    const gradient = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.4, cy + r * 0.3)
    gradient.addColorStop(0, rgba(CYAN, 0.5))
    gradient.addColorStop(0.45, rgba(BLUE, 0.26))
    gradient.addColorStop(1, rgba(VIOLET, 0))
    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.995, 182 * DEG, 310 * DEG)
    ctx.stroke()

    ctx.strokeStyle = gradient
    ctx.lineWidth = 7
    ctx.globalAlpha = 0.24
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.985, 186 * DEG, 300 * DEG)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const render = (elapsed: number): void => {
    const { cssW, cssH, dpr, cx, cy } = metrics
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    ctx.globalCompositeOperation = 'source-over'
    if (nebula) {
      ctx.globalAlpha = 0.92 + 0.08 * Math.sin((elapsed / NEBULA_PERIOD) * TAU)
      ctx.drawImage(nebula, 0, 0, cssW, cssH)
    }

    ctx.globalCompositeOperation = 'lighter'
    if (starsA) {
      ctx.globalAlpha = 0.72 + 0.28 * Math.sin((elapsed / STAR_PERIOD_A) * TAU)
      ctx.drawImage(starsA, 0, 0, cssW, cssH)
    }
    if (starsB) {
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin((elapsed / STAR_PERIOD_B) * TAU + Math.PI)
      ctx.drawImage(starsB, 0, 0, cssW, cssH)
    }
    ctx.globalAlpha = 1

    rotate((elapsed / SPHERE_PERIOD) * TAU)
    project()

    if (halo) {
      const size = halo.width
      ctx.globalAlpha = 0.7
      ctx.drawImage(halo, cx - size * 0.5, cy - size * 0.5)
      ctx.globalAlpha = 1
    }

    const rings = compact ? ORBITS.slice(0, 1) : ORBITS
    const phases = rings.map((orbit) => orbit.phase + (elapsed / orbit.period) * TAU)

    rings.forEach((orbit, index) => drawOrbit(orbit, false, phases[index]))
    rings.forEach((orbit, index) => {
      if (orbitPoint(orbit, phases[index])[2] < 0) drawPlanet(orbit, index, phases[index])
    })

    ctx.globalCompositeOperation = 'lighter'
    drawEdges(false)
    drawNodes(false)

    if (core) {
      // Offset toward the light so the sphere reads as lit from the upper left
      // rather than uniformly self-luminous.
      const size = core.width
      const r = metrics.r
      ctx.globalAlpha = 0.85
      ctx.drawImage(core, cx - size * 0.5 + LIGHT.x * r * 0.16, cy - size * 0.5 + LIGHT.y * r * 0.16)
      ctx.globalAlpha = 1
    }

    drawEdges(true)
    drawNodes(true)
    drawRim()

    rings.forEach((orbit, index) => drawOrbit(orbit, true, phases[index]))
    rings.forEach((orbit, index) => {
      if (orbitPoint(orbit, phases[index])[2] >= 0) drawPlanet(orbit, index, phases[index])
    })

    ctx.globalCompositeOperation = 'source-over'
  }

  const frame = (now: number): void => {
    rafId = requestAnimationFrame(frame)
    if (now - lastDraw < frameBudget) return
    elapsed += Math.min(0.25, (now - lastDraw) / 1000)
    lastDraw = now
    render(elapsed)
  }

  const stop = (): void => {
    if (!running) return
    running = false
    cancelAnimationFrame(rafId)
  }

  const start = (): void => {
    if (running || reduced.matches || compact || !visible || !inView) return
    running = true
    lastDraw = performance.now()
    rafId = requestAnimationFrame(frame)
  }

  const sync = (): void => {
    if (reduced.matches || compact) {
      stop()
      elapsed = 0
      measure()
      render(0)
      return
    }
    if (visible && inView) start()
    else stop()
  }

  measure()
  render(0)
  canvas.classList.add('is-ready')

  const resizeObserver = new ResizeObserver(() => {
    if (!measure()) return
    if (compact || reduced.matches) {
      stop()
      render(0)
      return
    }
    if (running) return
    render(elapsed)
    start()
  })
  resizeObserver.observe(canvas)

  const viewObserver = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting)
    sync()
  }, { threshold: 0 })
  viewObserver.observe(canvas)

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden
    sync()
  })
  reduced.addEventListener('change', sync)
  sync()
}
