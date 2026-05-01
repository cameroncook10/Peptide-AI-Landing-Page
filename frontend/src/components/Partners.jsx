import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Partners.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const BRAND_CATEGORIES = [
  'Supplements',
  'Protein & Nutrition',
  'Clothing & Apparel',
  'Fitness Equipment',
  'Performance Tech / Wearables',
  'Recovery Products',
  'Other Consumer Brand',
];

export default function Partners() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    brandCategory: '',
    website: '',
    partnershipIdea: '',
    notes: '',
  });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    if (!form.companyName.trim()) { setErrorMsg('Please enter your company name.'); setStatus('error'); return; }
    if (!form.contactName.trim()) { setErrorMsg('Please enter your name.'); setStatus('error'); return; }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErrorMsg('Please enter a valid business email.'); setStatus('error'); return; }
    if (!form.brandCategory) { setErrorMsg('Please select a brand category.'); setStatus('error'); return; }

    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/partner`, {
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
    <div className="partners-page">
      {/* NAV */}
      <nav className="lp-nav" id="nav">
        <div className="nav-inner">
          <Link to="/" className="lp-logo">
            <img src="/assets/app-icon.png" alt="Peptide AI" />
          </Link>
          <div className="nav-links">
            <Link to="/#how">How it works</Link>
            <Link to="/#features">Features</Link>
            <Link to="/partners" className="active">Partners</Link>
            <Link to="/affiliates">Affiliates</Link>
          </div>
          <div className="nav-cta">
            <Link to="/#cta" className="btn btn-mint">Get the app</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="p-hero">
        <div className="p-hero-eyebrow">
          <span className="dot"></span>
          Brand Partners
        </div>
        <h1>Built with the <em>best in wellness.</em></h1>
        <p>Peptide AI partners with supplement brands, protein companies, clothing lines, and performance brands whose audience overlaps with serious athletes running real protocols.</p>
      </section>

      {/* CLINICAL PARTNER */}
      <section className="p-partners-section">
        <div className="clinical-partner-card">
          <div className="cp-logo-box">
            <img src="/assets/overtime-logo-new.png" alt="Overtime Men's Health" />
          </div>
          <div className="cp-meta">
            <div className="partner-badge">Clinical Partner</div>
            <p className="cp-desc">Our trusted clinical partner for supervised peptide and hormone protocols.</p>
          </div>
        </div>
      </section>

      {/* PARTNER FORM */}
      <section className="p-form-section" id="partner-apply">
        {/* LEFT: Pitch */}
        <div className="pf-pitch">
          <h2>Partner with <em>Peptide AI.</em></h2>
          <p>We're building the most trusted platform in performance optimization. If your brand serves serious athletes and biohackers, let's talk about what we can build together.</p>
          <p>We work with brands on co-marketing, in-app placements, sponsored content, discount integrations, and product spotlights inside the app.</p>
          <div className="pf-category-grid">
            {['Supplements', 'Protein & Nutrition', 'Clothing & Apparel', 'Fitness Equipment', 'Performance Tech', 'Recovery Brands'].map(c => (
              <span key={c} className="pf-cat-chip">{c}</span>
            ))}
          </div>
          <div className="pf-not-looking">
            <p><strong>Not currently accepting:</strong> labs, clinics, compounding pharmacies, or medical providers. Our clinical partnership roster is full. If you are a supplement brand, performance apparel company, or consumer wellness product, this is the right form for you.</p>
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
              <p>Thanks for applying. We review brand partnership applications within 3–5 business days and will reach out via email.</p>
            </div>
          ) : (
            <div className="pf-form-card">
              <h3>Brand Partnership Application</h3>
              <p>Tell us about your brand and how we could work together.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="pf-field-row">
                  <div className="pf-field">
                    <label htmlFor="companyName">Company Name <span className="req">*</span></label>
                    <input id="companyName" name="companyName" type="text" placeholder="Your Brand Co." value={form.companyName} onChange={handleChange} required autoComplete="organization" />
                  </div>
                  <div className="pf-field">
                    <label htmlFor="contactName">Your Name <span className="req">*</span></label>
                    <input id="contactName" name="contactName" type="text" placeholder="Jane Smith" value={form.contactName} onChange={handleChange} required autoComplete="name" />
                  </div>
                </div>
                <div className="pf-field-row">
                  <div className="pf-field">
                    <label htmlFor="email">Business Email <span className="req">*</span></label>
                    <input id="email" name="email" type="email" placeholder="jane@yourbrand.com" value={form.email} onChange={handleChange} required autoComplete="email" />
                  </div>
                  <div className="pf-field">
                    <label htmlFor="phone">Phone <span className="opt">(optional)</span></label>
                    <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} autoComplete="tel" />
                  </div>
                </div>
                <div className="pf-field">
                  <label htmlFor="brandCategory">Brand Category <span className="req">*</span></label>
                  <select id="brandCategory" name="brandCategory" value={form.brandCategory} onChange={handleChange} required>
                    <option value="">Select your brand type</option>
                    {BRAND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="pf-field">
                  <label htmlFor="website">Brand Website <span className="opt">(optional)</span></label>
                  <input id="website" name="website" type="url" placeholder="https://yourbrand.com" value={form.website} onChange={handleChange} />
                </div>
                <div className="pf-field">
                  <label htmlFor="partnershipIdea">Partnership Idea <span className="opt">(optional)</span></label>
                  <textarea id="partnershipIdea" name="partnershipIdea" rows={3} placeholder="Co-marketing, in-app discount code, sponsored content, product gifting, ambassador program…" value={form.partnershipIdea} onChange={handleChange} />
                </div>
                <div className="pf-field">
                  <label htmlFor="notes">Anything else? <span className="opt">(optional)</span></label>
                  <textarea id="notes" name="notes" rows={2} placeholder="Links, previous partnerships, audience size, questions…" value={form.notes} onChange={handleChange} />
                </div>

                {status === 'error' && (
                  <div className="pf-error">{errorMsg}</div>
                )}
                <button type="submit" className="pf-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Submitting…' : 'Submit Partnership Application →'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* LEGAL */}
      <section className="legal-disclaimer">
        <div className="legal-box">
          <p>
            <strong>Trademark Notice:</strong> "Overtime Men's Health" and the Overtime Men's Health logo are trademarks or registered trademarks of their respective owners. Their use on this page is for informational purposes only and does not imply endorsement of Peptide AI by Overtime Men's Health beyond the scope of the described partnership. All intellectual property rights related to Overtime Men's Health — including its name, logo, trade dress, and associated marks — remain the exclusive property of their respective owners. Peptide AI, the Peptide AI logo, and all associated software, algorithms, and data models are the exclusive intellectual property of Peptide AI LLC. © 2026 Peptide AI LLC. All rights reserved.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-footer">
        <p>© 2026 Peptide AI. All rights reserved.</p>
        <div className="p-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span style={{ color: 'var(--ink-mute)', margin: '0 4px' }}>·</span>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
