import { useMemo } from 'react';
import { motion } from 'framer-motion';

const W = 160, CX = 80, AMP = 55, PERIOD = 100;
const VISIBLE_H = 500, FULL_H = 1000;

function buildStrand(phase) {
  const steps = 300; let d = '';
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * FULL_H;
    const x = (CX + AMP * Math.sin((y / PERIOD) * Math.PI * 2 + phase)).toFixed(2);
    d += i === 0 ? `M${x} ${y.toFixed(2)}` : ` L${x} ${y.toFixed(2)}`;
  }
  return d;
}

function buildRungs() {
  const count = (FULL_H / PERIOD) * 2;
  return Array.from({ length: count + 1 }, (_, i) => {
    const y = (i / count) * FULL_H;
    const angle = (y / PERIOD) * Math.PI * 2;
    return { y, x1: CX + AMP * Math.sin(angle), x2: CX + AMP * Math.sin(angle + Math.PI), front: Math.cos(angle) > 0 };
  });
}

export default function DnaHelix({ size = 1 }) {
  const rW = Math.round(W * size);
  const rH = Math.round(VISIBLE_H * size);
  const rF = Math.round(FULL_H * size);

  const strand1 = useMemo(() => buildStrand(0), []);
  const strand2 = useMemo(() => buildStrand(Math.PI), []);
  const rungs   = useMemo(() => buildRungs(), []);

  return (
    <div style={{ width: rW, height: rH, overflow: 'hidden', position: 'relative' }}>
      <motion.svg
        width={rW} height={rF}
        viewBox={`0 0 ${W} ${FULL_H}`}
        animate={{ y: [0, -rH] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="dna-glow" x="-60%" y="-5%" width="220%" height="110%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="fade-ends" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#060810"/>
            <stop offset="12%"  stopColor="transparent"/>
            <stop offset="88%"  stopColor="transparent"/>
            <stop offset="100%" stopColor="#060810"/>
          </linearGradient>
        </defs>

        {rungs.filter(r => !r.front).map((r, i) => (
          <line key={`br${i}`} x1={r.x1} y1={r.y} x2={r.x2} y2={r.y}
            stroke="#00E5A0" strokeWidth="1.5" strokeOpacity="0.12" strokeLinecap="round"/>
        ))}
        <path d={strand2} stroke="#00B37A" strokeWidth="2.5" fill="none"
          strokeOpacity="0.4" strokeLinecap="round" filter="url(#dna-glow)"/>
        {rungs.filter(r => r.front).map((r, i) => (
          <line key={`fr${i}`} x1={r.x1} y1={r.y} x2={r.x2} y2={r.y}
            stroke="#00E5A0" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round"/>
        ))}
        {rungs.filter(r => r.front).map((r, i) => (
          <g key={`d${i}`}>
            <circle cx={r.x1} cy={r.y} r="3.5" fill="#00E5A0" opacity="0.85" filter="url(#dna-glow)"/>
            <circle cx={r.x2} cy={r.y} r="3.5" fill="#00E5A0" opacity="0.85" filter="url(#dna-glow)"/>
          </g>
        ))}
        <path d={strand1} stroke="#00E5A0" strokeWidth="3" fill="none"
          strokeLinecap="round" filter="url(#dna-glow)"/>
        <rect x="0" y="0" width={W} height={FULL_H} fill="url(#fade-ends)" style={{ pointerEvents: 'none' }}/>
      </motion.svg>
    </div>
  );
}
