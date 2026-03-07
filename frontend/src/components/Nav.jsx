export default function Nav() {
  return (
    <nav className="topbar">
      <div className="brand">
        <img src="/assets/app-icon.png" alt="Peptide AI" className="brand-icon" />
        <span className="brand-name">Peptide AI</span>
      </div>
      <div className="topbar-actions">
        <a className="pill" href="#features">Features</a>
        <a className="pill" href="#waitlist">Waitlist</a>

      </div>
    </nav>
  );
}
