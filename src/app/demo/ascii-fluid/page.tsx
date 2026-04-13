'use client'

import { AsciiFluidOverlay } from '@/components/ascii-fluid'

export default function AsciiFluidDemoPage() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--terminal-bg-deepest, #1e1e1e)',
          zIndex: 0,
        }}
      />

      {/* ASCII Fluid Overlay */}
      <AsciiFluidOverlay
        safeAreaSelector=".ascii-safe"
        noiseScale={0.025}
        noiseSpeed={0.2}
      />

      {/* Content with safe areas */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <h1
          className="ascii-safe"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '3rem',
            fontWeight: 700,
            color: 'var(--terminal-text-primary, #d4d4d4)',
            textAlign: 'center',
            pointerEvents: 'auto',
            padding: '1rem 2rem',
          }}
        >
          ASCII Fluid Demo
        </h1>
        <p
          className="ascii-safe"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '1rem',
            color: 'var(--terminal-text-secondary, #808080)',
            textAlign: 'center',
            pointerEvents: 'auto',
            padding: '0.5rem 2rem',
            maxWidth: '600px',
          }}
        >
          Move your mouse to reveal ASCII characters. Click to create a splash effect.
          Drag to enhance the fluid flow.
        </p>
      </div>
    </div>
  )
}
