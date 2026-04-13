// ---------- Fluid Simulation ----------

export interface FluidConfig {
  resolutionScale: number
  diffusion: number
  iterations: number
  projectIterations: number
  velocityDissipation: number
  densityDissipation: number
}

export const FLUID_DEFAULTS: FluidConfig = {
  resolutionScale: 0.8,
  diffusion: 1.5,
  iterations: 5,
  projectIterations: 10,
  velocityDissipation: 0.1,
  densityDissipation: 0.1,
}

// ---------- Interaction ----------

export interface InteractionConfig {
  hoverRadiusPx: number
  hoverStrength: number
  dragScale: number
  dragMaxPx: number
  splashRangePx: number
  splashThicknessPx: number
  splashRandomness: number
  splashDecay: number
  splashExpandSpeed: number
}

export const INTERACTION_DEFAULTS: InteractionConfig = {
  hoverRadiusPx: 28,
  hoverStrength: 0.9,
  dragScale: 0.03,
  dragMaxPx: 60,
  splashRangePx: 184,
  splashThicknessPx: 100,
  splashRandomness: 0.14,
  splashDecay: 0.92,
  splashExpandSpeed: 300,
}

// ---------- Rendering ----------

export interface RenderConfig {
  charset: string
  fontSize: number
  cellPadding: { x: number; y: number }
  contrast: number
  gamma: number
  invertLuma: boolean
  fps: number
  lumaSmoothingMs: number
}

export const RENDER_DEFAULTS: RenderConfig = {
  charset: '\u25CB>_ ',
  fontSize: 9,
  cellPadding: { x: 1, y: 2 },
  contrast: 2,
  gamma: 0.5,
  invertLuma: true,
  fps: 30,
  lumaSmoothingMs: 1000,
}

// ---------- Active Splash ----------

export interface ActiveSplash {
  cx: number
  cy: number
  currentRadius: number
  maxRadius: number
  thickness: number
  strength: number
  expandSpeed: number
  randomness: number
  decay: number
}

// ---------- Glyph Atlas ----------

export interface GlyphAtlas {
  canvas: HTMLCanvasElement | OffscreenCanvas
  cellWidth: number
  cellHeight: number
  charCount: number
}

// ---------- Grid ----------

export interface GridDimensions {
  cols: number
  rows: number
  cellWidth: number
  cellHeight: number
}

// ---------- Component Props ----------

export interface AsciiFluidProps {
  charset?: string
  fontSize?: number
  cellPadding?: { x: number; y: number }
  charColor?: string
  backgroundColor?: string
  className?: string
  fluid?: Partial<FluidConfig>
  interaction?: Partial<InteractionConfig>
  render?: Partial<RenderConfig>
  safeAreaSelector?: string
  safeAreaFadeWidth?: number
  noiseScale?: number
  noiseSpeed?: number
  enabled?: boolean
  dprCap?: number
  respectReducedMotion?: boolean
}
