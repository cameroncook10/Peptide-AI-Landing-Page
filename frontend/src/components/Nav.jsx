import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="topbar">
      <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
        <img src="/assets/app-icon.png" alt="Peptide AI" className="brand-icon" />
        <span className="brand-name">Peptide AI</span>
      </Link>
      <div className="topbar-actions">
        {isHome && (
          <>
            <a className="pill" href="#features">Features</a>
            <a className="pill" href="#pricing">Pricing</a>
          </>
        )}
        <Link className="pill" to="/affiliates">Affiliates</Link>
        <a className="pill primary" href={isHome ? '#download' : 'https://apps.apple.com/us/app/peptide-ai-stack-intelligence/id6760374374'} target={isHome ? undefined : '_blank'} rel={isHome ? undefined : 'noopener'}>Get the App</a>
      </div>
    </nav>
  );
}
