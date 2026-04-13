/**
 * 2D Navier-Stokes fluid simulation using Stam's "Stable Fluids" method (1999).
 * All operations work on flat Float32Array grids for performance.
 */

import type { FluidConfig } from './types'

// ---------- Data Structure ----------

export interface FluidState {
  width: number
  height: number
  velX: Float32Array
  velY: Float32Array
  velX0: Float32Array
  velY0: Float32Array
  density: Float32Array
  density0: Float32Array
  pressure: Float32Array
  divergence: Float32Array
}

export function createFluidState(width: number, height: number): FluidState {
  const size = width * height
  return {
    width,
    height,
    velX: new Float32Array(size),
    velY: new Float32Array(size),
    velX0: new Float32Array(size),
    velY0: new Float32Array(size),
    density: new Float32Array(size),
    density0: new Float32Array(size),
    pressure: new Float32Array(size),
    divergence: new Float32Array(size),
  }
}

export function resizeFluidState(newWidth: number, newHeight: number): FluidState {
  return createFluidState(newWidth, newHeight)
}

// ---------- Helpers ----------

function idx(x: number, y: number, w: number): number {
  return y * w + x
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function bilinearSample(
  field: Float32Array,
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  const cx = clamp(x, 0.5, w - 1.5)
  const cy = clamp(y, 0.5, h - 1.5)
  const x0 = Math.floor(cx)
  const y0 = Math.floor(cy)
  const x1 = x0 + 1
  const y1 = y0 + 1
  const sx = cx - x0
  const sy = cy - y0

  return (
    field[idx(x0, y0, w)] * (1 - sx) * (1 - sy) +
    field[idx(x1, y0, w)] * sx * (1 - sy) +
    field[idx(x0, y1, w)] * (1 - sx) * sy +
    field[idx(x1, y1, w)] * sx * sy
  )
}

// ---------- Simulation Steps ----------

/** Gauss-Seidel diffusion solver */
function diffuse(
  dest: Float32Array,
  src: Float32Array,
  w: number,
  h: number,
  diff: number,
  dt: number,
  iterations: number,
): void {
  const a = dt * diff * w * h

  for (let k = 0; k < iterations; k++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = idx(x, y, w)
        dest[i] =
          (src[i] +
            a *
              (dest[idx(x - 1, y, w)] +
                dest[idx(x + 1, y, w)] +
                dest[idx(x, y - 1, w)] +
                dest[idx(x, y + 1, w)])) /
          (1 + 4 * a)
      }
    }
    setBoundary(dest, w, h)
  }
}

/** Enforce incompressibility via pressure projection */
function project(
  velX: Float32Array,
  velY: Float32Array,
  pressure: Float32Array,
  divergence: Float32Array,
  w: number,
  h: number,
  iterations: number,
): void {
  const hx = 1 / w
  const hy = 1 / h

  // Compute divergence
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y, w)
      divergence[i] =
        -0.5 *
        (hx * (velX[idx(x + 1, y, w)] - velX[idx(x - 1, y, w)]) +
          hy * (velY[idx(x, y + 1, w)] - velY[idx(x, y - 1, w)]))
      pressure[i] = 0
    }
  }
  setBoundary(divergence, w, h)
  setBoundary(pressure, w, h)

  // Pressure Poisson solve
  for (let k = 0; k < iterations; k++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = idx(x, y, w)
        pressure[i] =
          (divergence[i] +
            pressure[idx(x - 1, y, w)] +
            pressure[idx(x + 1, y, w)] +
            pressure[idx(x, y - 1, w)] +
            pressure[idx(x, y + 1, w)]) /
          4
      }
    }
    setBoundary(pressure, w, h)
  }

  // Subtract pressure gradient
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y, w)
      velX[i] -= 0.5 * w * (pressure[idx(x + 1, y, w)] - pressure[idx(x - 1, y, w)])
      velY[i] -= 0.5 * h * (pressure[idx(x, y + 1, w)] - pressure[idx(x, y - 1, w)])
    }
  }
  setBoundary(velX, w, h)
  setBoundary(velY, w, h)
}

/** Semi-Lagrangian advection with bilinear interpolation */
function advect(
  dest: Float32Array,
  src: Float32Array,
  velX: Float32Array,
  velY: Float32Array,
  w: number,
  h: number,
  dt: number,
): void {
  const dtx = dt * w
  const dty = dt * h

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = idx(x, y, w)
      // Trace backwards
      const srcX = x - dtx * velX[i]
      const srcY = y - dty * velY[i]
      dest[i] = bilinearSample(src, srcX, srcY, w, h)
    }
  }
  setBoundary(dest, w, h)
}

/** Neumann boundary conditions (zero gradient at edges) */
function setBoundary(field: Float32Array, w: number, h: number): void {
  for (let x = 1; x < w - 1; x++) {
    field[idx(x, 0, w)] = field[idx(x, 1, w)]
    field[idx(x, h - 1, w)] = field[idx(x, h - 2, w)]
  }
  for (let y = 1; y < h - 1; y++) {
    field[idx(0, y, w)] = field[idx(1, y, w)]
    field[idx(w - 1, y, w)] = field[idx(w - 2, y, w)]
  }
  // Corners
  field[idx(0, 0, w)] = 0.5 * (field[idx(1, 0, w)] + field[idx(0, 1, w)])
  field[idx(w - 1, 0, w)] = 0.5 * (field[idx(w - 2, 0, w)] + field[idx(w - 1, 1, w)])
  field[idx(0, h - 1, w)] = 0.5 * (field[idx(1, h - 1, w)] + field[idx(0, h - 2, w)])
  field[idx(w - 1, h - 1, w)] =
    0.5 * (field[idx(w - 2, h - 1, w)] + field[idx(w - 1, h - 2, w)])
}

// ---------- Main Step ----------

export function stepFluid(state: FluidState, config: FluidConfig, dt: number): void {
  const { width: w, height: h } = state
  const { diffusion, iterations, projectIterations, velocityDissipation, densityDissipation } =
    config

  // Swap velocity buffers
  const tmpX = state.velX0
  state.velX0 = state.velX
  state.velX = tmpX
  const tmpY = state.velY0
  state.velY0 = state.velY
  state.velY = tmpY

  // 1. Diffuse velocity
  diffuse(state.velX, state.velX0, w, h, diffusion, dt, iterations)
  diffuse(state.velY, state.velY0, w, h, diffusion, dt, iterations)

  // 2. Project velocity (enforce incompressibility)
  project(state.velX, state.velY, state.pressure, state.divergence, w, h, projectIterations)

  // 3. Advect velocity
  const advSrcX = state.velX0
  const advSrcY = state.velY0
  advSrcX.set(state.velX)
  advSrcY.set(state.velY)
  advect(state.velX, advSrcX, advSrcX, advSrcY, w, h, dt)
  advect(state.velY, advSrcY, advSrcX, advSrcY, w, h, dt)

  // 4. Project again for stability
  project(state.velX, state.velY, state.pressure, state.divergence, w, h, projectIterations)

  // 5. Swap density buffers
  const tmpD = state.density0
  state.density0 = state.density
  state.density = tmpD

  // 6. Diffuse density
  diffuse(state.density, state.density0, w, h, diffusion, dt, iterations)

  // 7. Advect density
  const advSrcD = state.density0
  advSrcD.set(state.density)
  advect(state.density, advSrcD, state.velX, state.velY, w, h, dt)

  // 8. Dissipate
  const velDecay = Math.max(0, 1 - velocityDissipation * dt)
  const denDecay = Math.max(0, 1 - densityDissipation * dt)
  for (let i = 0; i < w * h; i++) {
    state.velX[i] *= velDecay
    state.velY[i] *= velDecay
    state.density[i] *= denDecay
  }
}

// ---------- Injection Functions ----------

export function addDensity(
  state: FluidState,
  cx: number,
  cy: number,
  radius: number,
  amount: number,
): void {
  const { width: w, height: h, density } = state
  const r = Math.ceil(radius)
  const x0 = Math.max(1, Math.floor(cx - r))
  const x1 = Math.min(w - 2, Math.ceil(cx + r))
  const y0 = Math.max(1, Math.floor(cy - r))
  const y1 = Math.min(h - 2, Math.ceil(cy + r))

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      if (dist < radius) {
        const weight = smoothstep(1, 0, dist / radius)
        density[idx(x, y, w)] += amount * weight
      }
    }
  }
}

export function addVelocity(
  state: FluidState,
  cx: number,
  cy: number,
  radius: number,
  vx: number,
  vy: number,
): void {
  const { width: w, height: h, velX, velY } = state
  const r = Math.ceil(radius)
  const x0 = Math.max(1, Math.floor(cx - r))
  const x1 = Math.min(w - 2, Math.ceil(cx + r))
  const y0 = Math.max(1, Math.floor(cy - r))
  const y1 = Math.min(h - 2, Math.ceil(cy + r))

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      if (dist < radius) {
        const weight = smoothstep(1, 0, dist / radius)
        const i = idx(x, y, w)
        velX[i] += vx * weight
        velY[i] += vy * weight
      }
    }
  }
}

/**
 * Inject an expanding ring splash into the fluid.
 * Forces point outward from the center along the ring.
 */
export function addRingSplash(
  state: FluidState,
  cx: number,
  cy: number,
  currentRadius: number,
  thickness: number,
  strength: number,
  randomness: number,
  seed: number,
): void {
  const { width: w, height: h, velX, velY, density } = state
  const halfThick = thickness / 2
  const inner = Math.max(0, currentRadius - halfThick)
  const outer = currentRadius + halfThick

  const x0 = Math.max(1, Math.floor(cx - outer))
  const x1 = Math.min(w - 2, Math.ceil(cx + outer))
  const y0 = Math.max(1, Math.floor(cy - outer))
  const y1 = Math.min(h - 2, Math.ceil(cy + outer))

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist >= inner && dist <= outer && dist > 0.001) {
        // Distance from ring center
        const ringDist = Math.abs(dist - currentRadius)
        const ringWeight = 1 - ringDist / halfThick

        if (ringWeight > 0) {
          // Pseudorandom jitter
          const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
          const jitter = 1 + randomness * (hash - Math.floor(hash) - 0.5) * 2

          const force = strength * ringWeight * jitter
          const nx = dx / dist
          const ny = dy / dist
          const i = idx(x, y, w)

          velX[i] += nx * force
          velY[i] += ny * force
          density[i] += force * 0.5
        }
      }
    }
  }
}
