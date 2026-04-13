/**
 * Self-contained 2D Simplex noise implementation.
 * Based on Stefan Gustavson's reference implementation.
 * Used as a luminance source to replace the Codex video feed.
 */

const GRAD2: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
]

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6

export interface SimplexNoise {
  noise2D(x: number, y: number): number
}

export function createSimplexNoise(seed = 0): SimplexNoise {
  const perm = new Uint8Array(512)
  const p = new Uint8Array(256)

  // Seed-based permutation table
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647
    const j = seed % (i + 1)
    const tmp = p[i]
    p[i] = p[j]
    p[j] = tmp
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  function noise2D(x: number, y: number): number {
    const s = (x + y) * F2
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)
    const t = (i + j) * G2

    const x0 = x - (i - t)
    const y0 = y - (j - t)

    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2

    const ii = i & 255
    const jj = j & 255

    let n0 = 0, n1 = 0, n2 = 0

    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 > 0) {
      t0 *= t0
      const g = GRAD2[perm[ii + perm[jj]] % 8]
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0)
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 > 0) {
      t1 *= t1
      const g = GRAD2[perm[ii + i1 + perm[jj + j1]] % 8]
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1)
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 > 0) {
      t2 *= t2
      const g = GRAD2[perm[ii + 1 + perm[jj + 1]] % 8]
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2)
    }

    // Returns value in range [-1, 1]
    return 70 * (n0 + n1 + n2)
  }

  return { noise2D }
}

/**
 * Generate a luminance field using 2-octave fractal Brownian motion.
 * Output is a Float32Array of size cols*rows with values in [0, 1].
 */
export function generateLuminanceField(
  noise: SimplexNoise,
  cols: number,
  rows: number,
  time: number,
  scale: number,
  speed: number,
): Float32Array {
  const field = new Float32Array(cols * rows)
  const tx = time * speed
  const ty = time * speed * 0.7

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * scale + tx
      const y = row * scale + ty

      // 2-octave fBm
      const v = noise.noise2D(x, y) + 0.5 * noise.noise2D(x * 2, y * 2)

      // Normalize from [-1.5, 1.5] to [0, 1]
      field[row * cols + col] = Math.min(1, Math.max(0, (v + 1.5) / 3))
    }
  }

  return field
}
