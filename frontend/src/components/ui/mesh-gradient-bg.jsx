/**
 * Animated mesh gradient background — pure CSS, zero dependencies.
 * Fixed fullscreen canvas with flowing dark gradients matching Peptide AI palette.
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
        overflow: 'hidden',
        background: '#030504',
      }}
    >
      {/* Animated gradient blobs */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 30%, rgba(10,22,16,0.9) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 75% 60%, rgba(13,31,20,0.8) 0%, transparent 55%),
          radial-gradient(ellipse 90% 70% at 50% 80%, rgba(5,7,6,0.95) 0%, transparent 50%)
        `,
        animation: 'meshDrift 20s ease-in-out infinite alternate',
      }} />

      {/* Subtle green accent pulses */}
      <div style={{
        position: 'absolute',
        top: '10%', left: '25%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(45,216,132,0.035) 0%, transparent 65%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'meshPulse 10s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%', right: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(45,216,132,0.025) 0%, transparent 65%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'meshPulse 7s ease-in-out infinite 3s',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '60%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(45,216,132,0.02) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(70px)',
        animation: 'meshPulse 12s ease-in-out infinite 1.5s',
      }} />

      <style>{`
        @keyframes meshPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes meshDrift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-2%, 1%) scale(1.02); }
          66% { transform: translate(1%, -1%) scale(0.99); }
          100% { transform: translate(-1%, 2%) scale(1.01); }
        }
      `}</style>
    </div>
  );
}
