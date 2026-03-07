import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { end: 10, suffix: 'k+', label: 'Users on waitlist' },
  { end: 50, suffix: '+', label: 'Peptides tracked' },
  { end: 4.9, suffix: '', label: 'App Store rating', decimal: true, star: true },
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
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [trigger, end]);

  const display = decimal
    ? value.toFixed(1)
    : Math.round(value);

  return (
    <span className="stat-num">
      {display}{suffix}{star ? <span className="stat-star">★</span> : null}
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95, filter: 'blur(8px)' },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Stats() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="stats" ref={sectionRef}>
      <div className="stats-inner">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            className="stat"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
          >
            <AnimatedNumber
              end={s.end}
              suffix={s.suffix}
              decimal={s.decimal}
              star={s.star}
              trigger={isInView}
            />
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
