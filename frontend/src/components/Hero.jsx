import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FloatingBackground from './ui/floating-paths';

const wordStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimatedLine({ children, className = '' }) {
  const words = children.split(' ');
  return (
    <motion.span className={`line ${className}`} variants={wordStagger} style={{ display: 'block' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordReveal}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

export default function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.88]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.3]);

  return (
    <header className="hero" id="top" ref={heroRef}>
      <div className="noise" />
      <motion.div className="hero-glow" style={{ opacity: glowOpacity, scale: glowScale }} />
      <FloatingBackground />

      <motion.div
        className="hero-inner"
        style={{ y: contentY, scale: contentScale, opacity: contentOpacity }}
        variants={wordStagger}
        initial="hidden"
        animate="show"
      >
        <motion.div className="eyebrow" variants={fadeUp(0)}>
          <span className="eyebrow-dot" />
          AI &amp; Machine Learning for Peptide Therapeutics
        </motion.div>
        <h1>
          <AnimatedLine>The Future of</AnimatedLine>
          <AnimatedLine className="accent">Peptide Intelligence.</AnimatedLine>
        </h1>
        <motion.p className="hero-sub" variants={fadeUp(0.55)}>
          We build proprietary AI models that power the next generation of
          peptide therapeutics — research-grade protocol intelligence,
          precision-optimized to your biology.
        </motion.p>
        <motion.div className="cta-row" variants={fadeUp(0.7)}>
          <a className="cta primary" href="#waitlist">
            <span>Join the Waitlist</span>
            <svg className="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a className="cta secondary" href="#features">See the App</a>
        </motion.div>
        <motion.div className="hero-badges" variants={fadeUp(0.85)}>
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </span>
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l12.19-12.2L12.88 8l-9.7 15.76zM20.7 10.06l-3.13-1.8-3.59 3.59 3.59 3.59 3.16-1.82c.9-.52.9-1.56-.03-2.07M3.14.32C2.8.6 2.6 1.04 2.6 1.6v20.84l9.6-9.6L3.14.32zM16.36 3.74L4.17.04c-.35-.1-.69-.06-.97.12l9.64 9.65 3.52-6.07z"/></svg>
            Google Play
          </span>
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Coming Soon
          </span>
        </motion.div>
      </motion.div>

      <motion.a
        className="scroll-cue"
        href="#features"
        style={{ opacity: contentOpacity }}
      >
        <span>See features</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.a>
    </header>
  );
}
