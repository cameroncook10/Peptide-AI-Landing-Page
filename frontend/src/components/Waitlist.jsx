import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || '';

const ORBS = [
  { size: 320, x: '12%', y: '18%', color: 'rgba(0,229,160,0.08)', dur: 18, delay: 0 },
  { size: 260, x: '78%', y: '65%', color: 'rgba(0,180,220,0.06)', dur: 22, delay: 2 },
  { size: 200, x: '55%', y: '10%', color: 'rgba(0,229,160,0.05)', dur: 16, delay: 4 },
  { size: 180, x: '25%', y: '75%', color: 'rgba(0,200,180,0.05)', dur: 20, delay: 1 },
];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  dur: 8 + Math.random() * 12,
  delay: Math.random() * 8,
}));

const TRUST = [
  { icon: 'shield', text: 'No spam, ever' },
  { icon: 'lock', text: 'Data encrypted' },
  { icon: 'zap', text: 'Instant alerts' },
];

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

const trustIcons = { shield: ShieldIcon, lock: LockIcon, zap: ZapIcon };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [waitlistCount, setWaitlistCount] = useState(null);
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Mouse spotlight effect on card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(500px circle at ${x}px ${y}px, rgba(0,229,160,0.04), transparent 60%)`
  );

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  // Fetch waitlist count for social proof
  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist/count`)
      .then(r => r.json())
      .then(d => { if (d.count != null) setWaitlistCount(d.count); })
      .catch(() => {});
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the waitlist!");
        setEmail('');
        setPhone('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again later.');
    }
  }

  return (
    <section className="waitlist" id="waitlist" ref={sectionRef}>
      {/* Aurora mesh gradient background */}
      <div className="waitlist-aurora">
        {ORBS.map((orb, i) => (
          <div
            key={i}
            className="waitlist-orb"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              animationDuration: `${orb.dur}s`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="waitlist-particles">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="waitlist-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="waitlist-grid" />

      <motion.div
        className="waitlist-card"
        variants={stagger}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        ref={cardRef}
        onMouseMove={handleMouseMove}
      >
        {/* Animated gradient border */}
        <div className="waitlist-card-border" />
        {/* Mouse spotlight overlay */}
        <motion.div className="waitlist-spotlight" style={{ background: spotlightBg }} />
        <div className="waitlist-card-inner">
          <motion.div className="waitlist-eyebrow" variants={fadeUp}>
            <span className="waitlist-eyebrow-dot" />
            Early Access
          </motion.div>

          <motion.h2 className="waitlist-headline" variants={fadeUp}>
            Be first in line<br />
            <span className="waitlist-headline-accent">when we launch.</span>
          </motion.h2>

          <motion.p className="waitlist-desc" variants={fadeUp}>
            Get notified the moment Peptide AI drops on the App Store and Google Play.
            Enter your email and phone for SMS alerts.
          </motion.p>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                className="waitlist-success"
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="waitlist-success-ring">
                  <motion.svg
                    width="40" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  >
                    <motion.path
                      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    <motion.polyline
                      points="22 4 12 14.01 9 11.01"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </div>
                <p className="waitlist-success-msg">{message}</p>
                <div className="waitlist-success-confetti">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className="confetti-piece" style={{
                      '--angle': `${(i * 30)}deg`,
                      '--distance': `${60 + Math.random() * 40}px`,
                      '--color': i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? '#00B4D8' : '#48BB78',
                    }} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="waitlist-form"
                onSubmit={handleSubmit}
                variants={stagger}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
              >
                <motion.div className="waitlist-field-group" variants={scaleIn}>
                  <div className={`waitlist-field ${focusedField === 'email' ? 'is-focused' : ''} ${email ? 'has-value' : ''}`}>
                    <svg className="waitlist-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="3"/>
                      <polyline points="22,7 12,13 2,7"/>
                    </svg>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={status === 'loading'}
                    />
                    <div className="waitlist-field-glow" />
                  </div>

                  <div className={`waitlist-field ${focusedField === 'phone' ? 'is-focused' : ''} ${phone ? 'has-value' : ''}`}>
                    <svg className="waitlist-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="3"/>
                      <line x1="12" y1="18" x2="12" y2="18"/>
                    </svg>
                    <input
                      type="tel"
                      placeholder="Phone number (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      disabled={status === 'loading'}
                    />
                    <div className="waitlist-field-glow" />
                  </div>
                </motion.div>

                <motion.button
                  className="waitlist-submit"
                  type="submit"
                  disabled={status === 'loading'}
                  variants={scaleIn}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="waitlist-submit-bg" />
                  <span className="waitlist-submit-text">
                    {status === 'loading' ? (
                      <>
                        <span className="waitlist-spinner" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Notify Me
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === 'error' && (
            <motion.p
              className="waitlist-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.p>
          )}

          {/* Social proof counter */}
          {waitlistCount > 0 && (
            <motion.div className="waitlist-counter" variants={fadeUp}>
              <div className="waitlist-counter-avatars">
                {[0,1,2,3].map(i => (
                  <div key={i} className="waitlist-counter-avatar" style={{ '--i': i }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
                    </svg>
                  </div>
                ))}
              </div>
              <span className="waitlist-counter-text">
                Join <strong>{waitlistCount.toLocaleString()}+</strong> on the waitlist
              </span>
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div className="waitlist-trust" variants={fadeUp}>
            {TRUST.map((t, i) => {
              const Icon = trustIcons[t.icon];
              return (
                <div key={i} className="waitlist-trust-item">
                  <Icon />
                  <span>{t.text}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
