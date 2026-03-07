import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Build your peptide stack',
    desc: 'Design personalized protocols with precise dosing schedules. BPC-157, TB-500, Semax and more — all tracked in one place.',
    image: '/assets/screen1.png',
  },
  {
    num: '02',
    title: 'Monitor your optimization',
    desc: 'Watch HRV trends, sleep quality, and recovery metrics evolve as your protocol progresses. The data tells the full story.',
    image: '/assets/screen2.png',
  },
  {
    num: '03',
    title: 'AI-powered insights',
    desc: 'Get personalized analysis showing exactly how your stack is performing — backed entirely by your own biometric data.',
    image: '/assets/screen3.png',
  },
];

const textReveal = {
  hidden: { opacity: 0, x: -20, filter: 'blur(6px)' },
  active: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  inactive: { opacity: 0.2, x: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
};

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  // Track overall scroll progress through the features section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress to active step index
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(Math.floor(v * STEPS.length), STEPS.length - 1);
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  // Phone frame parallax — subtle float tied to scroll
  const phoneY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -2]);

  return (
    <section className="features" id="features" ref={containerRef}>
      <div className="features-sticky">
        <motion.div
          className="phone-frame"
          style={{ y: phoneY, rotateZ: phoneRotate }}
        >
          <div className="phone-screen">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={STEPS[activeIndex].image}
                alt="App screenshot"
                className="phone-img"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </AnimatePresence>
            <div className="phone-overlay" />
          </div>
          <div className="dots">
            {STEPS.map((_, i) => (
              <motion.span
                key={i}
                className={i === activeIndex ? 'dot is-active' : 'dot'}
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="story-sections">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            className={i === activeIndex ? 'step is-active' : 'step'}
            variants={textReveal}
            initial="hidden"
            animate={i === activeIndex ? 'active' : 'inactive'}
          >
            <motion.div
              className="step-number"
              animate={{ opacity: i === activeIndex ? 1 : 0, x: i === activeIndex ? 0 : -12 }}
              transition={{ duration: 0.4 }}
            >
              {step.num}
            </motion.div>
            <h2>{step.title}</h2>
            <p>{step.desc}</p>

            {/* Progress bar for active step */}
            {i === activeIndex && (
              <motion.div
                className="step-progress"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
