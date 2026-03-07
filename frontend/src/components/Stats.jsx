import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';

const STATS = [
  {
    end: 10, suffix: 'k+', label: 'Users on waitlist',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    end: 50, suffix: '+', label: 'Peptides tracked',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
  },
  {
    end: 4.9, suffix: '', label: 'App Store rating', decimal: true, star: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

function AnimatedNumber({ end, suffix, decimal, star, trigger }) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!trigger || hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1800;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [trigger, end]);

  const display = decimal ? value.toFixed(1) : Math.round(value);
  return (
    <span className="stat-num">
      {display}{suffix}{star ? <span className="stat-star">★</span> : null}
    </span>
  );
}

function SpotlightCard({ children, index, isInView }) {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(350px circle at ${x}px ${y}px, rgba(0,229,160,0.07), transparent 60%)`
  );

  const borderGradient = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(300px circle at ${x}px ${y}px, rgba(0,229,160,0.25), transparent 60%)`
  );

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="stat-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 36, scale: 0.94, filter: 'blur(10px)' },
        show: (i) => ({
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
          transition: { duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
        }),
      }}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      {/* Mouse-following border glow */}
      <motion.div className="stat-card-border" style={{ background: borderGradient }} />
      {/* Mouse-following spotlight */}
      <motion.div className="stat-card-spotlight" style={{ background: spotlightBg }} />
      <div className="stat-card-inner">
        {children}
      </div>
    </motion.div>
  );
}

const headerVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Stats() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section className="stats" ref={sectionRef}>
      {/* Lamp glow effect */}
      <div className="stats-lamp">
        <motion.div
          className="stats-lamp-beam"
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="stats-container">
        <motion.div
          className="stats-header"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          <div className="eyebrow">By The Numbers</div>
          <h2 className="stats-title">
            Trusted by the <span className="accent">community.</span>
          </h2>
        </motion.div>

        <div className="stats-grid">
          {STATS.map((s, i) => (
            <SpotlightCard key={i} index={i} isInView={isInView}>
              <div className="stat-icon">{s.icon}</div>
              <AnimatedNumber
                end={s.end}
                suffix={s.suffix}
                decimal={s.decimal}
                star={s.star}
                trigger={isInView}
              />
              <div className="stat-label">{s.label}</div>
              <div className="stat-accent-line" />
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
