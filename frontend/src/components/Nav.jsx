import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="topbar-inner" aria-label="Primary">
        <a className="brand" href="#top">
          <img src="/assets/app-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Peptide AI</span>
        </a>
        <div className="topbar-nav">
          <a className="topbar-link" href="#features">Features</a>
          <a className="topbar-link" href="#pricing">Pricing</a>
          <a className="topbar-link" href="#faq">FAQ</a>
        </div>
        <a
          className="topbar-cta"
          href="https://apps.apple.com/us/app/peptide-ai-stack-intelligence/id6760374374"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Download</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </nav>
    </header>
  );
}
