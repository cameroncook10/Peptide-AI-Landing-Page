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
