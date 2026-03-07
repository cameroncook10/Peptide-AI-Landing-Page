export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="noise" />
      <div className="hero-glow" />
      <div className="hero-inner">
        <div className="eyebrow">AI-Powered Peptide Tracking</div>
        <h1>
          <span className="line">Optimize your</span>
          <span className="line accent">Peptide Stack.</span>
          <span className="line">Like a pro.</span>
        </h1>
        <p className="hero-sub">
          Build protocols, track doses, and let AI surface the insights<br />
          that show exactly how your stack is performing.
        </p>
        <div className="cta-row">
          <a className="cta primary" href="#waitlist">
            Join the Waitlist
          </a>
          <a className="cta secondary" href="#features">
            See the App
          </a>
        </div>
        <div className="hero-badges">
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </span>
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l12.19-12.2L12.88 8l-9.7 15.76zM20.7 10.06l-3.13-1.8-3.59 3.59 3.59 3.59 3.16-1.82c.9-.52.9-1.56-.03-2.07M3.14.32C2.8.6 2.6 1.04 2.6 1.6v20.84l9.6-9.6L3.14.32zM16.36 3.74L4.17.04c-.35-.1-.69-.06-.97.12l9.64 9.65 3.52-6.07z"/></svg>
            Google Play
          </span>
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Coming Soon
          </span>
        </div>
      </div>
      <a className="scroll-cue" href="#features">
        <span>See features</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </header>
  );
}
