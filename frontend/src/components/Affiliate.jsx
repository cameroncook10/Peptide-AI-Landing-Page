import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import './Partners.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter / X', 'Blog / Website', 'Podcast', 'Other'];

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
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
    <div className="lp-root partners-page">
      {/* NAV — identical to landing page */}
      <nav className="lp-nav" id="nav">
        <div className="nav-inner">
          <Link to="/" className="lp-logo">
            <img src="/assets/app-icon.png" alt="Peptide AI" />
          </Link>
          <div className="nav-links">
            <Link to="/#how">How it works</Link>
            <Link to="/#features">Features</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/affiliates" className="active">Affiliates</Link>
          </div>
          <div className="nav-cta">
            <Link to="/#cta" className="btn btn-mint">Get the app</Link>
          </div>
        </div>
      </nav>

      {/* HERO — same styling as Partners hero */}
      <section className="p-hero">
        <div className="p-hero-eyebrow">
          <span className="dot" />
          Affiliate Program
        </div>
        <h1>Grow with <em>Peptide AI</em></h1>
        <p>
          We&apos;re a research-driven startup building proprietary AI for peptide therapeutics. 
          Partner with us and earn recurring commission introducing your audience to the future of 
          personalized wellness.
        </p>
      </section>

      {/* PERKS */}
      <section className="p-partners-section">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '60px' }}>
          {[
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: 'Recurring commissions' },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>, label: 'Real-time dashboard' },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, label: 'Creative assets provided' },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Dedicated partner support' },
          ].map(p => (
            <span key={p.label} className="pf-cat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--mint)', display: 'flex', alignItems: 'center' }}>{p.icon}</span>
              {p.label}
            </span>
          ))}
        </div>
      </section>

      {/* APPLICATION FORM — same grid layout as Partners */}
      <section className="p-form-section" id="affiliate-apply">
        {/* LEFT: Pitch */}
        <div className="pf-pitch">
          <h2>Join the <em>Affiliate Program</em></h2>
          <p>Earn recurring commission for every subscriber you refer. We provide creative assets, tracking dashboards, and dedicated support to help you succeed.</p>
          <p>Whether you&apos;re a fitness influencer, biohacking creator, or wellness content producer — if your audience cares about optimization, we want to work with you.</p>
          <div className="pf-category-grid">
            {['Fitness', 'Biohacking', 'Longevity', 'Nutrition', 'Wellness', 'Health Tech'].map(c => (
              <span key={c} className="pf-cat-chip">{c}</span>
            ))}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div>
          {status === 'success' ? (
            <div className="pf-success">
              <div className="pf-success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>Application received!</h2>
              <p>Thanks for applying to the Peptide AI affiliate program. We review applications within 2–3 business days and will reach out to you at <strong>{form.email}</strong>.</p>
              <Link to="/" style={{ color: 'var(--mint)', fontSize: '14px', marginTop: '20px', display: 'inline-block' }}>← Back to homepage</Link>
            </div>
          ) : (
            <div className="pf-form-card">
              <h3>Affiliate Application</h3>
              <p>Tell us about yourself and how you&apos;d promote Peptide AI.</p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Name row */}
                <div className="pf-field-row">
                  <div className="pf-field">
                    <label htmlFor="firstName">First Name <span className="req">*</span></label>
                    <input id="firstName" name="firstName" type="text" placeholder="Jane" value={form.firstName} onChange={handleChange} required autoComplete="given-name" />
                  </div>
                  <div className="pf-field">
                    <label htmlFor="lastName">Last Name <span className="req">*</span></label>
                    <input id="lastName" name="lastName" type="text" placeholder="Smith" value={form.lastName} onChange={handleChange} required autoComplete="family-name" />
                  </div>
                </div>

                {/* Contact row */}
                <div className="pf-field-row">
                  <div className="pf-field">
                    <label htmlFor="email">Email <span className="req">*</span></label>
                    <input id="email" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
                  </div>
                  <div className="pf-field">
                    <label htmlFor="phone">Phone <span className="opt">(optional)</span></label>
                    <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} autoComplete="tel" />
                  </div>
                </div>

                {/* Platforms */}
                <div className="pf-field">
                  <label>Platforms / Channels <span className="req">*</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {PLATFORMS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        style={{
                          background: form.platforms.includes(p) ? 'rgba(45,216,132,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${form.platforms.includes(p) ? 'var(--mint)' : 'var(--line)'}`,
                          borderRadius: '999px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          color: form.platforms.includes(p) ? 'var(--mint)' : 'var(--ink-soft)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                      >
                        {form.platforms.includes(p) && <CheckIcon />}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audience + Niche row */}
                <div className="pf-field-row">
                  <div className="pf-field">
                    <label htmlFor="audienceSize">Audience / Follower Count</label>
                    <select id="audienceSize" name="audienceSize" value={form.audienceSize} onChange={handleChange}>
                      <option value="">Select a range</option>
                      <option>Under 5,000</option>
                      <option>5,000 – 25,000</option>
                      <option>25,000 – 100,000</option>
                      <option>100,000 – 500,000</option>
                      <option>500,000+</option>
                    </select>
                  </div>
                  <div className="pf-field">
                    <label htmlFor="contentNiche">Content Niche</label>
                    <input id="contentNiche" name="contentNiche" type="text" placeholder="e.g. Biohacking, Fitness, Longevity…" value={form.contentNiche} onChange={handleChange} />
                  </div>
                </div>

                {/* Promo plan */}
                <div className="pf-field">
                  <label htmlFor="promoPlan">How do you plan to promote Peptide AI?</label>
                  <textarea id="promoPlan" name="promoPlan" rows={3} placeholder="Describe your content format, posting cadence, and audience demographics…" value={form.promoPlan} onChange={handleChange} />
                </div>

                {/* Existing partnerships */}
                <div className="pf-field">
                  <label htmlFor="existingPartnerships">Any existing brand partnerships? <span className="opt">(optional)</span></label>
                  <input id="existingPartnerships" name="existingPartnerships" type="text" placeholder="e.g. Whoop, Levels Health, AG1…" value={form.existingPartnerships} onChange={handleChange} />
                </div>

                {/* Notes */}
                <div className="pf-field">
                  <label htmlFor="notes">Anything else you&apos;d like us to know? <span className="opt">(optional)</span></label>
                  <textarea id="notes" name="notes" rows={3} placeholder="Links to profiles, past campaigns, questions for us…" value={form.notes} onChange={handleChange} />
                </div>

                {/* Error */}
                {status === 'error' && (
                  <div className="pf-error">{errorMsg}</div>
                )}

                <button type="submit" className="pf-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Submitting…' : 'Submit Affiliate Application →'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER — same as Partners */}
      <footer className="p-footer">
        <p>© {new Date().getFullYear()} Peptide AI. All rights reserved.</p>
        <div className="p-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span style={{ color: 'var(--ink-mute)', margin: '0 4px' }}>·</span>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
