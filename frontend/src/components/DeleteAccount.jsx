import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function DeleteAccount() {
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
            <div className="legal-badge">Account</div>
            <h1 className="legal-title">Delete Your Account</h1>
            <p className="legal-subtitle">We're sorry to see you go. Follow the steps below to request permanent deletion of your Peptide AI account and associated data.</p>
          </div>

          <div className="legal-body">
            <div className="legal-section">
              <h2 className="legal-section-title">How to Delete Your Account</h2>
              <p className="legal-p">You can delete your account directly from the Peptide AI app or by contacting us via email.</p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Option 1: Delete from the App</h2>
              <ol className="legal-ul" style={{ listStyleType: 'decimal' }}>
                <li>Open the Peptide AI app and go to <strong>Settings</strong>.</li>
                <li>Scroll down and tap <strong>Account</strong>.</li>
                <li>Tap <strong>Delete Account</strong>.</li>
                <li>Confirm the deletion when prompted.</li>
              </ol>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">Option 2: Request via Email</h2>
              <p className="legal-p">Send an email to <a href="mailto:privacy@peptideai.co">privacy@peptideai.co</a> from the email address associated with your account with the subject line <strong>"Delete My Account"</strong>. We will process your request within 30 days.</p>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">What Gets Deleted</h2>
              <p className="legal-p">When you delete your account, the following data will be permanently removed:</p>
              <ul className="legal-ul">
                <li>Your profile information (name, email, phone number)</li>
                <li>Protocol logs and history</li>
                <li>Biometric and health tracking data</li>
                <li>AI-generated insights and recommendations</li>
                <li>App preferences and settings</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-section-title">What We May Retain</h2>
              <p className="legal-p">Certain data may be retained as required by law or for legitimate business purposes, including:</p>
              <ul className="legal-ul">
                <li>Transaction and billing records (as required for tax/legal compliance)</li>
                <li>Anonymized, aggregated analytics data that cannot identify you</li>
                <li>Records required to comply with legal obligations or resolve disputes</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-warn" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Need Help?</p>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>If you have questions about account deletion or need assistance, contact our support team.</p>
                <a href="mailto:privacy@peptideai.co" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>privacy@peptideai.co</a>
              </div>
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
            <p>© 2026 PeptideAI LLC · <a href="mailto:info@peptideai.co">info@peptideai.co</a></p>
          </footer>
        </main>
      </div>
    </div>
  );
}
