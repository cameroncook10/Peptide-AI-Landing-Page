import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function LegalPage({ title, subtitle, effectiveDate, sections }) {
  const [activeId, setActiveId] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const observerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const headings = document.querySelectorAll('.legal-section[id]');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    headings.forEach(h => observerRef.current.observe(h));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  return (
    <div className="legal-root">
      {/* Top Nav */}
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
        {/* Sidebar TOC */}
        <aside className="legal-sidebar">
          <div className="legal-sidebar-inner">
            <p className="legal-toc-label">Contents</p>
            <nav className="legal-toc">
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`legal-toc-item ${activeId === s.id ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="legal-sibling-links">
              <p className="legal-toc-label" style={{ marginTop: '2rem' }}>Other Policies</p>
              <Link to="/terms" className={`legal-toc-item ${location.pathname === '/terms' ? 'current' : ''}`}>Terms of Service</Link>
              <Link to="/privacy" className={`legal-toc-item ${location.pathname === '/privacy' ? 'current' : ''}`}>Privacy Policy</Link>
              <Link to="/ccpa" className={`legal-toc-item ${location.pathname === '/ccpa' ? 'current' : ''}`}>CCPA Notice</Link>
              <Link to="/support" className={`legal-toc-item ${location.pathname === '/support' ? 'current' : ''}`}>Support</Link>
            </div>
          </div>
        </aside>

        {/* Mobile TOC toggle */}
        <button className="legal-mobile-toc-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Table of contents">
          {menuOpen ? '✕ Close' : '☰ Contents'}
        </button>
        {menuOpen && (
          <div className="legal-mobile-toc">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="legal-toc-item" onClick={() => setMenuOpen(false)}>{s.label}</a>
            ))}
            <hr className="legal-mobile-hr" />
            <Link to="/terms" className="legal-toc-item" onClick={() => setMenuOpen(false)}>Terms of Service</Link>
            <Link to="/privacy" className="legal-toc-item" onClick={() => setMenuOpen(false)}>Privacy Policy</Link>
            <Link to="/ccpa" className="legal-toc-item" onClick={() => setMenuOpen(false)}>CCPA Notice</Link>
            <Link to="/support" className="legal-toc-item" onClick={() => setMenuOpen(false)}>Support</Link>
          </div>
        )}

        {/* Main Content */}
        <main className="legal-content">
          <div className="legal-hero">
            <div className="legal-badge">Legal</div>
            <h1 className="legal-title">{title}</h1>
            {subtitle && <p className="legal-subtitle">{subtitle}</p>}
            <div className="legal-meta">
              <span>Effective: {effectiveDate}</span>
              <span className="legal-meta-sep">·</span>
              <span>PeptideAI LLC</span>
              <span className="legal-meta-sep">·</span>
              <a href="mailto:legal@peptideai.co" className="legal-meta-link">legal@peptideai.co</a>
            </div>
          </div>

          <div className="legal-body">
            {sections.map(section => (
              <div key={section.id} id={section.id} className="legal-section">
                <h2 className="legal-section-title">{section.title}</h2>
                {section.content}
              </div>
            ))}
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
            <p>© 2026 PeptideAI LLC · <a href="mailto:legal@peptideai.co">legal@peptideai.co</a></p>
          </footer>
        </main>
      </div>
    </div>
  );
}
