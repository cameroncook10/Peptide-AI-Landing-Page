import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Support() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="legal-root">
      <nav className="topbar">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <img src="/assets/app-icon.png" className="brand-icon" alt="PeptideAI" onError={e => e.target.style.display='none'} />
          <span className="brand-name">PeptideAI</span>
        </Link>
        <div className="topbar-actions">
          <Link to="/" className="pill">← Back to Home</Link>
        </div>
      </nav>

      <div className="legal-layout">
        <main className="legal-content" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="legal-hero">
            <div className="legal-badge">Help</div>
            <h1 className="legal-title">Support</h1>
            <p className="legal-subtitle">We're here to help. Reach out to our team and we'll get back to you as soon as possible.</p>
          </div>

          <div className="legal-body">
            <div className="legal-section">
              <div className="legal-warn" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Email Support</p>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>For general inquiries, account help, bug reports, or feedback — send us an email and our team will respond within 24–48 hours.</p>
                <a href="mailto:info@peptideai.co" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>info@peptideai.co</a>
              </div>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Common Topics</h2>
              <ul className="legal-ul">
                <li><strong>Account issues:</strong> trouble signing in, resetting your password, or managing your subscription.</li>
                <li><strong>App feedback:</strong> feature requests, bug reports, or suggestions to improve Peptide AI.</li>
                <li><strong>Billing questions:</strong> charges, refunds, or payment method updates.</li>
                <li><strong>Privacy requests:</strong> data access, deletion, or other privacy-related inquiries.</li>
                <li><strong>General questions:</strong> anything else about Peptide AI — we're happy to help.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Privacy & Legal</h2>
              <p className="legal-p">For privacy-specific requests (data deletion, CCPA/GDPR inquiries), you can also reach us at <a href="mailto:privacy@peptideai.co">privacy@peptideai.co</a>. Review our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link> for more details.</p>
            </div>
          </div>

          <footer className="legal-footer">
            <div className="legal-footer-links">
              <Link to="/terms">Terms of Service</Link>
              <span>·</span>
              <Link to="/privacy">Privacy Policy</Link>
              <span>·</span>
              <Link to="/ccpa">CCPA Notice</Link>
              <span>·</span>
              <Link to="/support">Support</Link>
            </div>
            <p>© 2026 Peptide AI LLC · <a href="mailto:info@peptideai.co">info@peptideai.co</a></p>
          </footer>
        </main>
      </div>
    </div>
  );
}
