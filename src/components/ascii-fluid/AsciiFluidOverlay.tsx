'use client'

import { useRef, useEffect } from 'react'
import styles from '@/styles/components/ascii-fluid-overlay.module.css'
import type { AsciiFluidProps, ActiveSplash, RenderConfig, FluidConfig, InteractionConfig } from './types'
import { FLUID_DEFAULTS, INTERACTION_DEFAULTS, RENDER_DEFAULTS } from './types'
import {
  createFluidState,
  stepFluid,
  addDensity,
  addVelocity,
  addRingSplash,
  type FluidState,
} from './fluid-simulation'
import { createSimplexNoise, generateLuminanceField } from './noise-generator'
import {
  createGlyphAtlas,
  computeGrid,
  renderFrame,
  lerpLuminance,
  applySafeAreaMask,
} from './ascii-renderer'
import type { GlyphAtlas, GridDimensions } from './types'

interface MutableState {
  ctx: CanvasRenderingContext2D | null
  dpr: number
  atlas: GlyphAtlas | null
  grid: GridDimensions | null
  fluidState: FluidState | null
  fluidConfig: FluidConfig
  interactionConfig: InteractionConfig
  renderConfig: RenderConfig
  smoothedLuma: Float32Array | null
  time: number
  lastFrameTime: number
  rafId: number
  mouseX: number
  mouseY: number
  prevMouseX: number
  prevMouseY: number
  prevMouseTime: number
  isPointerDown: boolean
  activeSplashes: ActiveSplash[]
  splashSeed: number
  resizeTimer: ReturnType<typeof setTimeout> | null
  enabled: boolean
}

const DEFAULT_FONT = '"SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace'

export function AsciiFluidOverlay(props: AsciiFluidProps) {
  const {
    charColor,
    backgroundColor,
    className,
    safeAreaSelector,
    safeAreaFadeWidth = 20,
    noiseScale = 0.02,
    noiseSpeed = 0.3,
    enabled = true,
    dprCap = 2,
    respectReducedMotion = true,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<MutableState | null>(null)

  useEffect(() => {
    // Reduced motion check
    if (respectReducedMotion) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mq.matches) return
    }

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) return

    // Merge configs with defaults
    const fluidConfig: FluidConfig = { ...FLUID_DEFAULTS, ...props.fluid }
    const interactionConfig: InteractionConfig = { ...INTERACTION_DEFAULTS, ...props.interaction }
    const renderConfig: RenderConfig = {
      ...RENDER_DEFAULTS,
      ...props.render,
      ...(props.charset != null && { charset: props.charset }),
      ...(props.fontSize != null && { fontSize: props.fontSize }),
      ...(props.cellPadding != null && { cellPadding: props.cellPadding }),
    }

    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)

    // Read font from CSS variable or fallback
    const computedStyle = getComputedStyle(document.documentElement)
    const font = computedStyle.getPropertyValue('--font-mono').trim() || DEFAULT_FONT
    const color = charColor || computedStyle.getPropertyValue('--terminal-text-primary').trim() || '#d4d4d4'

    // Create noise source
    const noise = createSimplexNoise(42)

    // Build glyph atlas
    let atlas = createGlyphAtlas(renderConfig.charset, renderConfig.fontSize, font, color, dpr)

    // Initialize canvas size and grid
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    let grid = computeGrid(canvas.width, canvas.height, atlas.cellWidth, atlas.cellHeight)

    // Create fluid state
    const fluidW = Math.max(3, Math.floor(grid.cols * fluidConfig.resolutionScale))
    const fluidH = Math.max(3, Math.floor(grid.rows * fluidConfig.resolutionScale))
    let fluidState = createFluidState(fluidW, fluidH)

    // Luminance buffers
    let smoothedLuma = new Float32Array(grid.cols * grid.rows)

    // Initialize mutable state
    const state: MutableState = {
      ctx,
      dpr,
      atlas,
      grid,
      fluidState,
      fluidConfig,
      interactionConfig,
      renderConfig,
      smoothedLuma,
      time: 0,
      lastFrameTime: 0,
      rafId: 0,
      mouseX: -1000,
      mouseY: -1000,
      prevMouseX: -1000,
      prevMouseY: -1000,
      prevMouseTime: 0,
      isPointerDown: false,
      activeSplashes: [],
      splashSeed: 0,
      resizeTimer: null,
      enabled,
    }
    stateRef.current = state

    // ---------- Resize ----------
    const handleResize = () => {
      if (state.resizeTimer) clearTimeout(state.resizeTimer)
      state.resizeTimer = setTimeout(() => {
        const r = container.getBoundingClientRect()
        canvas.width = r.width * state.dpr
        canvas.height = r.height * state.dpr

        state.grid = computeGrid(canvas.width, canvas.height, atlas.cellWidth, atlas.cellHeight)

        const fw = Math.max(3, Math.floor(state.grid.cols * fluidConfig.resolutionScale))
        const fh = Math.max(3, Math.floor(state.grid.rows * fluidConfig.resolutionScale))
        state.fluidState = createFluidState(fw, fh)
        state.smoothedLuma = new Float32Array(state.grid.cols * state.grid.rows)
      }, 100)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // ---------- Pointer Events ----------
    const canvasToFluid = (clientX: number, clientY: number): [number, number] => {
      const r = canvas.getBoundingClientRect()
      const cx = ((clientX - r.left) / r.width) * (state.grid?.cols ?? 0)
      const cy = ((clientY - r.top) / r.height) * (state.grid?.rows ?? 0)
      const fs = fluidConfig.resolutionScale
      return [cx * fs, cy * fs]
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!state.fluidState || !state.grid) return

      const [fx, fy] = canvasToFluid(e.clientX, e.clientY)
      const now = performance.now()

      state.mouseX = fx
      state.mouseY = fy

      // Compute mouse velocity in fluid space
      const dtMouse = Math.max(1, now - state.prevMouseTime) / 1000
      const dvx = (fx - state.prevMouseX) / dtMouse
      const dvy = (fy - state.prevMouseY) / dtMouse

      state.prevMouseX = fx
      state.prevMouseY = fy
      state.prevMouseTime = now

      const ic = state.interactionConfig
      const hoverR = (ic.hoverRadiusPx / (state.grid.cellWidth / state.dpr)) * fluidConfig.resolutionScale

      // Inject velocity from mouse movement
      const speed = Math.sqrt(dvx * dvx + dvy * dvy)
      const cappedSpeed = Math.min(speed, 500)
      const velScale = ic.hoverStrength * (cappedSpeed / 500)
      addVelocity(state.fluidState, fx, fy, hoverR, dvx * velScale * 0.1, dvy * velScale * 0.1)

      // Inject density
      let densityAmount = ic.hoverStrength * 2

      // Drag boost
      if (state.isPointerDown) {
        const boost = Math.min(ic.dragMaxPx, cappedSpeed * ic.dragScale)
        densityAmount += boost
      }

      addDensity(state.fluidState, fx, fy, hoverR, densityAmount)
    }

    const handlePointerDown = (e: PointerEvent) => {
      state.isPointerDown = true
      const [fx, fy] = canvasToFluid(e.clientX, e.clientY)
      state.prevMouseX = fx
      state.prevMouseY = fy
      state.prevMouseTime = performance.now()
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!state.isPointerDown) return
      state.isPointerDown = false

      if (!state.fluidState || !state.grid) return

      // Create splash
      const [fx, fy] = canvasToFluid(e.clientX, e.clientY)
      const ic = state.interactionConfig
      const cellSize = state.grid.cellWidth / state.dpr
      const maxR = (ic.splashRangePx / cellSize) * fluidConfig.resolutionScale
      const thick = (ic.splashThicknessPx / cellSize) * fluidConfig.resolutionScale

      state.activeSplashes.push({
        cx: fx,
        cy: fy,
        currentRadius: 1,
        maxRadius: maxR,
        thickness: thick,
        strength: ic.hoverStrength * 8,
        expandSpeed: (ic.splashRangePx / cellSize) * fluidConfig.resolutionScale * 2,
        randomness: ic.splashRandomness,
        decay: ic.splashDecay,
      })
    }

    // Listen on window to bypass z-index stacking issues
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)

    // ---------- Theme Observer ----------
    const themeObserver = new MutationObserver(() => {
      const cs = getComputedStyle(document.documentElement)
      const newColor = charColor || cs.getPropertyValue('--terminal-text-primary').trim() || '#d4d4d4'
      atlas = createGlyphAtlas(renderConfig.charset, renderConfig.fontSize, font, newColor, state.dpr)
      state.atlas = atlas
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // ---------- Animation Loop ----------
    const frameDuration = 1000 / renderConfig.fps

    function tick(timestamp: number) {
      state.rafId = requestAnimationFrame(tick)

      if (!state.enabled) return

      const elapsed = timestamp - state.lastFrameTime
      if (elapsed < frameDuration) return
      state.lastFrameTime = timestamp - (elapsed % frameDuration)

      const dt = frameDuration / 1000
      const { fluidState: fs, grid: g, ctx: c, atlas: a, smoothedLuma: sl } = state
      if (!fs || !g || !c || !a || !sl) return

      // 1. Update splashes
      for (let i = state.activeSplashes.length - 1; i >= 0; i--) {
        const splash = state.activeSplashes[i]
        splash.currentRadius += splash.expandSpeed * dt

        // Ease-out: decelerate as radius grows
        const progress = splash.currentRadius / splash.maxRadius
        splash.expandSpeed *= 1 - progress * 0.3

        splash.strength *= splash.decay
        state.splashSeed += 1

        if (splash.currentRadius < splash.maxRadius && splash.strength > 0.01) {
          addRingSplash(
            fs,
            splash.cx,
            splash.cy,
            splash.currentRadius,
            splash.thickness,
            splash.strength,
            splash.randomness,
            state.splashSeed,
          )
        } else {
          state.activeSplashes.splice(i, 1)
        }
      }

      // 2. Step fluid
      stepFluid(fs, state.fluidConfig, dt)

      // 3. Generate luminance from noise
      state.time += dt
      const targetLuma = generateLuminanceField(
        noise,
        g.cols,
        g.rows,
        state.time,
        noiseScale,
        noiseSpeed,
      )

      // 4. Smooth luminance
      lerpLuminance(sl, targetLuma, dt, renderConfig.lumaSmoothingMs)

      // 5. Render
      renderFrame(
        c,
        a,
        g,
        targetLuma,
        sl,
        fs.density,
        state.renderConfig,
        fs.width,
        fs.height,
        canvas!.width,
        canvas!.height,
      )

      // 6. Apply safe area mask
      if (safeAreaSelector) {
        const safeElements = Array.from(document.querySelectorAll(safeAreaSelector))
        if (safeElements.length > 0) {
          const containerRect = container!.getBoundingClientRect()
          applySafeAreaMask(c, containerRect, safeElements, safeAreaFadeWidth, state.dpr)
        }
      }
    }

    state.rafId = requestAnimationFrame(tick)

    // ---------- Cleanup ----------
    return () => {
      cancelAnimationFrame(state.rafId)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      if (state.resizeTimer) clearTimeout(state.resizeTimer)
      stateRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update enabled state without re-mounting
  useEffect(() => {
    if (stateRef.current) {
      stateRef.current.enabled = enabled
    }
  }, [enabled])

  return (
    <div
      ref={containerRef}
      className={`${styles.overlay}${className ? ` ${className}` : ''}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
