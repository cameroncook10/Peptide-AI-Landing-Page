import { useState, useRef, useCallback } from 'react';
import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'Blog / Website', 'Podcast', 'Other'];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Affiliate() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    platforms: [],
    audienceSize: '',
    contentNiche: '',
    promoPlan: '',
    existingPartnerships: '',
    notes: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(0,229,160,0.04), transparent 60%)`
  );

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function togglePlatform(p) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter(x => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrorMsg('Please enter your full name.');
      setStatus('error');
      return;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    if (form.platforms.length === 0) {
      setErrorMsg('Please select at least one platform.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/affiliate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <div className="affiliate-page">
      {/* ── Nav ── */}
      <nav className="topbar">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <img src="/assets/app-icon.png" alt="Peptide AI" className="brand-icon" />
          <span className="brand-name">Peptide AI</span>
        </Link>
        <div className="topbar-actions">
          <Link className="pill" to="/">Home</Link>
          <Link className="pill primary" to="/affiliates">Affiliates</Link>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div className="aff-hero">
        <div className="aff-hero-glow" />
        <motion.div
          className="aff-hero-inner"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div className="aff-eyebrow" variants={fadeUp}>
            <span className="eyebrow-dot" />
            Affiliate Program
          </motion.div>
          <motion.h1 className="aff-headline" variants={fadeUp}>
            Grow with <span className="accent">Peptide AI.</span>
          </motion.h1>
          <motion.p className="aff-sub" variants={fadeUp}>
            We&apos;re a research-driven startup building proprietary AI for peptide therapeutics.
            Partner with us and earn recurring commission introducing your audience to the future of
            personalized wellness.
          </motion.p>
          <motion.div className="aff-perks-row" variants={fadeUp}>
            {[
              { icon: '💰', label: 'Recurring commissions' },
              { icon: '📊', label: 'Real-time dashboard' },
              { icon: '🎨', label: 'Creative assets provided' },
              { icon: '🤝', label: 'Dedicated partner support' },
            ].map(p => (
              <div className="aff-perk-chip" key={p.label}>
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Form ── */}
      <section className="aff-form-section" ref={sectionRef}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              className="aff-success"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="aff-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>Application received!</h2>
              <p>Thanks for applying to the Peptide AI affiliate program. We review applications within 2–3 business days and will reach out to you at <strong>{form.email}</strong>.</p>
              <Link to="/" className="aff-back-link">← Back to homepage</Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="aff-card"
              ref={cardRef}
              onMouseMove={handleMouseMove}
              style={{ background: spotlightBg }}
              variants={stagger}
              initial="hidden"
              animate={isInView ? 'show' : 'hidden'}
            >
              <motion.div className="aff-card-header" variants={fadeUp}>
                <h2>Affiliate Application</h2>
                <p>Tell us about yourself and how you&apos;d promote Peptide AI.</p>
              </motion.div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Name row */}
                <motion.div className="aff-field-row" variants={fadeUp}>
                  <div className="aff-field">
                    <label htmlFor="firstName">First Name <span className="req">*</span></label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="aff-field">
                    <label htmlFor="lastName">Last Name <span className="req">*</span></label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </motion.div>

                {/* Contact row */}
                <motion.div className="aff-field-row" variants={fadeUp}>
                  <div className="aff-field">
                    <label htmlFor="email">Email <span className="req">*</span></label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="aff-field">
                    <label htmlFor="phone">Phone <span className="optional">(optional)</span></label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                  </div>
                </motion.div>

                {/* Platforms */}
                <motion.div className="aff-field" variants={fadeUp}>
                  <label>Platforms / Channels <span className="req">*</span></label>
                  <div className="aff-platform-grid">
                    {PLATFORMS.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`aff-platform-chip${form.platforms.includes(p) ? ' selected' : ''}`}
                        onClick={() => togglePlatform(p)}
                      >
                        {form.platforms.includes(p) && <CheckIcon />}
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Audience + Niche row */}
                <motion.div className="aff-field-row" variants={fadeUp}>
                  <div className="aff-field">
                    <label htmlFor="audienceSize">Audience / Follower Count</label>
                    <select
                      id="audienceSize"
                      name="audienceSize"
                      value={form.audienceSize}
                      onChange={handleChange}
                    >
                      <option value="">Select a range</option>
                      <option>Under 5,000</option>
                      <option>5,000 – 25,000</option>
                      <option>25,000 – 100,000</option>
                      <option>100,000 – 500,000</option>
                      <option>500,000+</option>
                    </select>
                  </div>
                  <div className="aff-field">
                    <label htmlFor="contentNiche">Content Niche</label>
                    <input
                      id="contentNiche"
                      name="contentNiche"
                      type="text"
                      placeholder="e.g. Biohacking, Fitness, Longevity…"
                      value={form.contentNiche}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>

                {/* Promo plan */}
                <motion.div className="aff-field" variants={fadeUp}>
                  <label htmlFor="promoPlan">How do you plan to promote Peptide AI?</label>
                  <textarea
                    id="promoPlan"
                    name="promoPlan"
                    rows={3}
                    placeholder="Describe your content format, posting cadence, and audience demographics…"
                    value={form.promoPlan}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Existing partnerships */}
                <motion.div className="aff-field" variants={fadeUp}>
                  <label htmlFor="existingPartnerships">Any existing brand partnerships? <span className="optional">(optional)</span></label>
                  <input
                    id="existingPartnerships"
                    name="existingPartnerships"
                    type="text"
                    placeholder="e.g. Whoop, Levels Health, AG1…"
                    value={form.existingPartnerships}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Notes */}
                <motion.div className="aff-field" variants={fadeUp}>
                  <label htmlFor="notes">Anything else you&apos;d like us to know? <span className="optional">(optional)</span></label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Links to profiles, past campaigns, questions for us…"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      className="aff-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  className="aff-submit"
                  type="submit"
                  disabled={status === 'loading'}
                  variants={fadeUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status === 'loading' ? (
                    <span className="aff-spinner" />
                  ) : (
                    <>
                      Submit Application
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Footer ── */}
      <footer className="aff-footer">
        <p>© {new Date().getFullYear()} Peptide AI. All rights reserved.</p>
        <div className="aff-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
