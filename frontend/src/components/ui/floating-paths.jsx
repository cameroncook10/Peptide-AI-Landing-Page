import { useMemo } from 'react';
import { motion } from 'framer-motion';

function FloatingPaths({ position }) {
  const paths = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      width: 0.4 + i * 0.025,
      opacity: Math.min(0.09 + i * 0.014, 0.42),
      duration: 14 + (i * 3.7) % 12,
      delay:    (i * 1.3) % 7,
    })),
  [position]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        {paths.map(p => (
          <motion.path
            key={p.id}
            d={p.d}
            stroke="#00E5A0"
            strokeWidth={p.width}
            strokeOpacity={p.opacity}
            initial={{ pathLength: 0.2, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.55, p.opacity, p.opacity * 0.3],
              pathOffset: [0, 1],
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function FloatingBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
}

export function BackgroundPaths({ title = 'Peptide AI', onCTA, ctaText = 'Get Early Access' }) {
  const words = title.split(' ');
  return (
    <div style={{
      position: 'relative', minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: 'var(--layer-0, #060810)',
    }}>
      <FloatingBackground />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '2rem', lineHeight: 1 }}>
            {words.map((word, wi) => (
              <span key={wi} style={{ display: 'inline-block', marginRight: '0.25em' }}>
                {word.split('').map((letter, li) => (
                  <motion.span
                    key={`${wi}-${li}`}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: wi * 0.1 + li * 0.03, type: 'spring', stiffness: 150, damping: 25 }}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #00E5A0, #00B3FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >{letter}</motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <button
              onClick={onCTA}
              style={{
                padding: '0.875rem 2.5rem',
                background: 'linear-gradient(135deg, rgba(0,229,160,0.12), rgba(0,179,255,0.12))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,229,160,0.3)',
                borderRadius: '9999px',
                color: '#EEF2FF',
                fontSize: '1.125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,229,160,0.2), rgba(0,179,255,0.2))'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,229,160,0.12), rgba(0,179,255,0.12))'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {ctaText} →
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
