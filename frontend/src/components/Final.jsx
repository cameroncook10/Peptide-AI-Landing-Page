import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Final() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Parallax glow
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);

  return (
    <section className="final" ref={sectionRef}>
      <motion.div
        className="final-glow"
        style={{ y: glowY, scale: glowScale }}
      />
      <motion.div
        className="final-inner"
        variants={stagger}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
      >
        <motion.div className="eyebrow" variants={fadeUp}>Launching Soon</motion.div>
        <motion.h2 variants={fadeUp}>
          The smarter way<br />
          to run your <span className="accent">protocol.</span>
        </motion.h2>
        <motion.p variants={fadeUp}>
          Peptide AI combines protocol management, biometric tracking, and AI insights
          in one clean app. Join the waitlist to be first in.
        </motion.p>
        <motion.div className="cta-row" variants={fadeUp}>
          <a className="cta primary" href="#waitlist">Join the Waitlist</a>
          {/* removed external learn-more link to keep focus on waitlist */}
        </motion.div>
        <motion.div className="social-links" variants={fadeUp}>
          <a href="https://www.tiktok.com/@peptideai.co" target="_blank" rel="noopener" aria-label="TikTok">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V6.93a4.85 4.85 0 0 1-1.01-.24z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/peptideai.co" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="https://twitter.com/PeptideAI" target="_blank" rel="noopener" aria-label="Twitter / X">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.734-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
          </a>
        </motion.div>
        <motion.a className="backtop" href="#top" variants={fadeUp}>↑ Back to top</motion.a>
      </motion.div>
    </section>
  );
}
