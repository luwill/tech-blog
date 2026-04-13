/**
 * Glyph atlas creation and per-frame ASCII character rendering.
 * Handles luminance-to-character mapping and fluid density modulation.
 */

import type { GlyphAtlas, GridDimensions, RenderConfig } from './types'
import { bilinearSample } from './fluid-simulation'

// ---------- Glyph Atlas ----------

export function createGlyphAtlas(
  charset: string,
  fontSize: number,
  font: string,
  color: string,
  dpr: number,
): GlyphAtlas {
  // Measure character dimensions
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!
  measureCtx.font = `${fontSize * dpr}px ${font}`
  const metrics = measureCtx.measureText('M')
  const charWidth = Math.ceil(metrics.width)
  const charHeight = Math.ceil(fontSize * dpr * 1.2)

  const cellWidth = charWidth + 2 * dpr  // cellPadding baked in
  const cellHeight = charHeight + 4 * dpr

  // Create atlas strip
  const atlasCanvas = document.createElement('canvas')
  atlasCanvas.width = charset.length * cellWidth
  atlasCanvas.height = cellHeight

  const ctx = atlasCanvas.getContext('2d')!
  ctx.font = `${fontSize * dpr}px ${font}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = color

  for (let i = 0; i < charset.length; i++) {
    ctx.fillText(charset[i], i * cellWidth + cellWidth / 2, cellHeight / 2)
  }

  return {
    canvas: atlasCanvas,
    cellWidth,
    cellHeight,
    charCount: charset.length,
  }
}

// ---------- Grid ----------

export function computeGrid(
  canvasWidth: number,
  canvasHeight: number,
  cellWidth: number,
  cellHeight: number,
): GridDimensions {
  return {
    cols: Math.max(1, Math.floor(canvasWidth / cellWidth)),
    rows: Math.max(1, Math.floor(canvasHeight / cellHeight)),
    cellWidth,
    cellHeight,
  }
}

// ---------- Frame Rendering ----------

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  atlas: GlyphAtlas,
  grid: GridDimensions,
  luminance: Float32Array,
  smoothedLuma: Float32Array,
  fluidDensity: Float32Array,
  config: RenderConfig,
  fluidWidth: number,
  fluidHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const { cols, rows, cellWidth, cellHeight } = grid
  const { contrast, gamma, invertLuma, charset } = config
  const charCount = charset.length

  // Scale factors from cell grid to fluid grid
  const fxScale = fluidWidth / cols
  const fyScale = fluidHeight / rows

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lumaIdx = row * cols + col
      let luma = smoothedLuma[lumaIdx]

      // Contrast + gamma
      luma = Math.min(1, Math.max(0, (luma - 0.5) * contrast + 0.5))
      luma = Math.pow(luma, gamma)

      if (invertLuma) luma = 1 - luma

      // Map to character index
      const charIdx = Math.min(charCount - 1, Math.floor(luma * charCount))

      // Sample fluid density (bilinear from potentially different-resolution grid)
      const fx = (col + 0.5) * fxScale
      const fy = (row + 0.5) * fyScale
      const fluidDensityVal = bilinearSample(fluidDensity, fx, fy, fluidWidth, fluidHeight)

      // Density modulates visibility:
      // High density (mouse interaction) → visible characters
      // Low density (no interaction) → transparent
      const alpha = Math.min(1, Math.max(0, fluidDensityVal))

      if (alpha < 0.01) continue // Skip invisible cells

      ctx.globalAlpha = alpha

      // Blit character from atlas
      ctx.drawImage(
        atlas.canvas,
        charIdx * atlas.cellWidth,
        0,
        atlas.cellWidth,
        atlas.cellHeight,
        col * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight,
      )
    }
  }

  ctx.globalAlpha = 1
}

// ---------- Luminance Smoothing ----------

export function lerpLuminance(
  smoothed: Float32Array,
  target: Float32Array,
  dt: number,
  smoothingMs: number,
): void {
  const factor = 1 - Math.exp((-dt * 1000) / smoothingMs)

  for (let i = 0; i < smoothed.length; i++) {
    smoothed[i] += (target[i] - smoothed[i]) * factor
  }
}

// ---------- Safe Area Masking ----------

export function applySafeAreaMask(
  ctx: CanvasRenderingContext2D,
  containerRect: DOMRect,
  safeElements: Element[],
  fadeWidth: number,
  dpr: number,
): void {
  if (safeElements.length === 0) return

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'

  for (const el of safeElements) {
    const rect = el.getBoundingClientRect()
    const x = (rect.left - containerRect.left) * dpr
    const y = (rect.top - containerRect.top) * dpr
    const w = rect.width * dpr
    const h = rect.height * dpr
    const fade = fadeWidth * dpr

    // Create gradient mask for soft edge
    const gradient = ctx.createLinearGradient(x - fade, y, x, y)
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,1)')

    // Clear the safe area with fade
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fillRect(x, y, w, h)

    // Fade edges
    if (fade > 0) {
      const edgeGradientL = ctx.createLinearGradient(x - fade, 0, x, 0)
      edgeGradientL.addColorStop(0, 'rgba(0,0,0,0)')
      edgeGradientL.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = edgeGradientL
      ctx.fillRect(x - fade, y, fade, h)

      const edgeGradientR = ctx.createLinearGradient(x + w, 0, x + w + fade, 0)
      edgeGradientR.addColorStop(0, 'rgba(0,0,0,1)')
      edgeGradientR.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = edgeGradientR
      ctx.fillRect(x + w, y, fade, h)

      const edgeGradientT = ctx.createLinearGradient(0, y - fade, 0, y)
      edgeGradientT.addColorStop(0, 'rgba(0,0,0,0)')
      edgeGradientT.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = edgeGradientT
      ctx.fillRect(x, y - fade, w, fade)

      const edgeGradientB = ctx.createLinearGradient(0, y + h, 0, y + h + fade)
      edgeGradientB.addColorStop(0, 'rgba(0,0,0,1)')
      edgeGradientB.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = edgeGradientB
      ctx.fillRect(x, y + h, w, fade)
    }
  }

  ctx.restore()
}
