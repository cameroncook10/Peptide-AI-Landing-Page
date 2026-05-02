import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Full-screen animated mesh gradient background.
 * Renders a fixed WebGL canvas behind all page content.
 * Colors tuned to Peptide AI's dark palette with subtle mint accents.
 */
export default function MeshGradientBg() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <MeshGradient
        style={{ width: '100%', height: '100%' }}
        colors={["#030504", "#0a1610", "#050706", "#0d1f14"]}
        speed={0.3}
        backgroundColor="#030504"
      />
      {/* Subtle green accent pulse overlays */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '30%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(45,216,132,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'meshPulse 8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(45,216,132,0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'meshPulse 6s ease-in-out infinite 2s',
        }}
      />
      <style>{`
        @keyframes meshPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
