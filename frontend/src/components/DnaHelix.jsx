import { useMemo } from 'react';
import { motion } from 'framer-motion';

const W = 160;
const CX = 80;
const AMP = 55;
const PERIOD = 100;
const VISIBLE_H = 500;   // 5 × PERIOD → seamless loop
const FULL_H = VISIBLE_H * 2;

function buildStrand(phase) {
  const steps = 300;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * FULL_H;
    const x = (CX + AMP * Math.sin((y / PERIOD) * Math.PI * 2 + phase)).toFixed(2);
    d += i === 0 ? `M${x} ${y.toFixed(2)}` : ` L${x} ${y.toFixed(2)}`;
  }
  return d;
}

function buildRungs() {
  const count = (FULL_H / PERIOD) * 2;
  const rungs = [];
  for (let i = 0; i <= count; i++) {
    const y = (i / count) * FULL_H;
    const angle = (y / PERIOD) * Math.PI * 2;
    const x1 = CX + AMP * Math.sin(angle);
    const x2 = CX + AMP * Math.sin(angle + Math.PI);
    rungs.push({ y, x1, x2, front: Math.cos(angle) > 0 });
  }
  return rungs;
}

export default function DnaHelix() {
  const strand1 = useMemo(() => buildStrand(0), []);
  const strand2 = useMemo(() => buildStrand(Math.PI), []);
  const rungs   = useMemo(() => buildRungs(), []);

  return (
    <div style={{ width: W, height: VISIBLE_H, overflow: 'hidden', position: 'relative' }}>
      <motion.svg
        width={W} height={FULL_H}
        viewBox={`0 0 ${W} ${FULL_H}`}
        animate={{ y: [0, -VISIBLE_H] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="dna-glow" x="-60%" y="-5%" width="220%" height="110%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="fade-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#060810" />
            <stop offset="15%"  stopColor="transparent" />
            <stop offset="85%"  stopColor="transparent" />
            <stop offset="100%" stopColor="#060810" />
          </linearGradient>
        </defs>

        {/* Back rungs */}
        {rungs.filter(r => !r.front).map((r, i) => (
          <line key={`br${i}`} x1={r.x1} y1={r.y} x2={r.x2} y2={r.y}
            stroke="#00E5A0" strokeWidth="1.5" strokeOpacity="0.15" strokeLinecap="round" />
        ))}

        {/* Strand 2 – back */}
        <path d={strand2} stroke="#00B37A" strokeWidth="2.5" fill="none"
          strokeOpacity="0.4" strokeLinecap="round" filter="url(#dna-glow)" />

        {/* Front rungs */}
        {rungs.filter(r => r.front).map((r, i) => (
          <line key={`fr${i}`} x1={r.x1} y1={r.y} x2={r.x2} y2={r.y}
            stroke="#00E5A0" strokeWidth="2" strokeOpacity="0.55" strokeLinecap="round" />
        ))}

        {/* Dots at front rung endpoints */}
        {rungs.filter(r => r.front).map((r, i) => (
          <g key={`d${i}`}>
            <circle cx={r.x1} cy={r.y} r="3.5" fill="#00E5A0" opacity="0.9" filter="url(#dna-glow)" />
            <circle cx={r.x2} cy={r.y} r="3.5" fill="#00E5A0" opacity="0.9" filter="url(#dna-glow)" />
          </g>
        ))}

        {/* Strand 1 – front */}
        <path d={strand1} stroke="#00E5A0" strokeWidth="3" fill="none"
          strokeLinecap="round" filter="url(#dna-glow)" />

        {/* Fade mask top/bottom */}
        <rect x="0" y="0" width={W} height={FULL_H} fill="url(#fade-top)" style={{ pointerEvents: 'none' }} />
      </motion.svg>
    </div>
  );
}
