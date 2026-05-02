import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import IntroAnimation from './ui/scroll-morph-hero';
import MeshGradientBg from './ui/mesh-gradient-bg';
import IPhoneFrame from './IPhoneFrame';
import './LandingPage.css';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/peptide-ai-stack-intelligence/id6760374374';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.peptideai.app';

/* ──────────────────────────────────────────────────────────────
   Marquee data — three columns of peptide/biomarker cards.
   Each column is doubled so the CSS scrollDown/scrollUp keyframes
   (translate 0 → -50%) loop seamlessly.
   ────────────────────────────────────────────────────────────── */

const COL_1 = [
  { type: 'peptide',  name: 'Epitalon',     meta: ['Longevity', '·', '10mg'] },
  { type: 'biomarker', value: '218',  meta: [{ t: 'IGF-1' }, { t: '↑ 14%', cls: 'trend-up' }] },
  { type: 'biomarker', value: '1.8',  meta: [{ t: 'TSH' },   { t: 'stable', cls: 'trend-flat' }] },
  { type: 'biomarker', value: '84',   meta: [{ t: 'ApoB' },  { t: 'watch',  cls: 'trend-flat' }] },
  { type: 'peptide',  name: 'Retatrutide',   meta: ['Metabolic', '·', '2mg'] },
  { type: 'peptide',  name: 'Cagrilintide',  meta: ['Appetite', '·', '2.4mg'] },
  { type: 'biomarker', value: '92',   meta: [{ t: 'LDL-C' }, { t: '↓ 11%', cls: 'trend-up' }] },
  { type: 'peptide',  name: 'Thymosin α-1',  meta: ['Immune', '·', '1.6mg'] },
  { type: 'biomarker', value: '68ms', meta: [{ t: 'HRV' },   { t: '↑ 9%',  cls: 'trend-up' }] },
  { type: 'peptide',  name: 'Ipamorelin',    meta: ['GH pulse', '·', '200mcg'] },
  { type: 'biomarker', value: '52',   meta: [{ t: 'VO2 max' }, { t: '↑ 3%', cls: 'trend-up' }] },
  { type: 'peptide',  name: 'TB-500',        meta: ['Tissue repair', '·', '2mg'] },
];

const COL_2 = [
  { type: 'peptide',  name: 'AOD-9604',      meta: ['Fat loss', '·', '300mcg'] },
  { type: 'biomarker', value: '84/100', meta: [{ t: 'Recovery' }, { t: '↑ 12', cls: 'trend-up' }] },
  { type: 'peptide',  name: 'PT-141',        meta: ['Libido', '·', '1mg'] },
  { type: 'peptide',  name: 'Selank',        meta: ['Cognitive', '·', '300mcg'] },
  { type: 'biomarker', value: '142',  meta: [{ t: 'Ferritin' },        { t: 'stable', cls: 'trend-flat' }] },
  { type: 'biomarker', value: '86',   meta: [{ t: 'Fasting glucose' }, { t: '↓ 5%',   cls: 'trend-up' }] },
  { type: 'peptide',  name: 'BPC-157',       meta: ['Regenerative', '·', '250mcg'] },
  { type: 'peptide',  name: '5-Amino-1MQ',   meta: ['Metabolic', '·', '50mg'] },
  { type: 'biomarker', value: '52',   meta: [{ t: 'Vit D' }, { t: '↑ 18%', cls: 'trend-up' }] },
  { type: 'biomarker', value: '5.1',  meta: [{ t: 'HbA1c' }, { t: 'stable', cls: 'trend-flat' }] },
  { type: 'peptide',  name: 'Dihexa',        meta: ['Nootropic', '·', '8mg'] },
  { type: 'peptide',  name: 'MOTS-c',        meta: ['Mitochondrial', '·', '5mg'] },
];

const COL_3 = [
  { type: 'peptide',  name: 'Semaglutide',   meta: ['Metabolic', '·', '0.5mg'] },
  { type: 'biomarker', value: '742',  meta: [{ t: 'Total T' }, { t: '↑ 6%', cls: 'trend-up' }] },
  { type: 'biomarker', value: '58',   meta: [{ t: 'HDL-C' },   { t: '↑ 4%', cls: 'trend-up' }] },
  { type: 'peptide',  name: 'NAD+',          meta: ['Cellular', '·', '100mg'] },
  { type: 'peptide',  name: 'GHK-Cu',        meta: ['Skin, healing', '·', '1mg'] },
  { type: 'peptide',  name: 'Tirzepatide',   meta: ['Metabolic', '·', '5mg'] },
  { type: 'biomarker', value: '7.4h', meta: [{ t: 'Sleep' }, { t: '↑ 0.6h', cls: 'trend-up' }] },
  { type: 'peptide',  name: 'CJC-1295',      meta: ['GH axis', '·', '300mcg'] },
  { type: 'biomarker', value: '0.8',  meta: [{ t: 'hs-CRP' }, { t: '↓ 22%', cls: 'trend-up' }] },
  { type: 'peptide',  name: 'Sermorelin',    meta: ['GH releasing', '·', '200mcg'] },
  { type: 'peptide',  name: 'DSIP',          meta: ['Sleep', '·', '100mcg'] },
];

function MarqueeCard({ item }) {
  if (item.type === 'peptide') {
    return (
      <div className="marq-card peptide-card">
        <div className="marq-label">Peptide</div>
        <div className="marq-name">{item.name}</div>
        <div className="marq-meta">
          {item.meta.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="marq-card biomarker-card">
      <div className="marq-label">Biomarker</div>
      <div className="marq-value">{item.value}</div>
      <div className="marq-meta">
        {item.meta.map((m, i) =>
          m.cls ? (
            <span key={i} className={m.cls}>{m.t}</span>
          ) : (
            <span key={i}>{m.t}</span>
          )
        )}
      </div>
    </div>
  );
}

function MarqueeColumn({ items, colClass }) {
  // Double the list so the -50% translate keyframe wraps seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className={`marq-col ${colClass}`}>
      {doubled.map((item, i) => (
        <MarqueeCard key={i} item={item} />
      ))}
    </div>
  );
}

const PHONE_SCREENS = [
  { img: '/assets/screen-stack.png',           num: '01', label: 'Protocol Stack',  desc: 'Build your entire stack in one place' },
  { img: '/assets/screen-dashboard.png',       num: '02', label: 'Dashboard',        desc: 'Your protocol at a glance' },
  { img: '/assets/screen-track.png',           num: '03', label: 'Dose Tracking',    desc: 'Log every dose, never miss a beat' },
  { img: '/assets/screen-injection-sites.png', num: '04', label: 'Injection Sites',  desc: 'Rotate smarter, recover faster' },
];

function PhoneScroll() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const sectionRef = useRef(null);
  const isMobile = useRef(typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);

  // Scroll-driven on desktop
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(0.999, scrolled / scrollable));
      const idx = Math.floor(progress * PHONE_SCREENS.length);
      setActive(prev => {
        if (idx !== prev) setDir(idx > prev ? 1 : -1);
        return idx;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-cycle on mobile
  useEffect(() => {
    if (!isMobile.current) return;
    const t = setInterval(() => {
      setActive(prev => (prev + 1) % PHONE_SCREENS.length);
      setDir(1);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="psc-section"
      style={{ height: isMobile.current ? 'auto' : `${PHONE_SCREENS.length * 100}vh` }}
    >
      <div className="psc-sticky">
        <div className="psc-inner">

          {/* LEFT — feature labels (desktop) */}
          <div className="psc-labels">
            {PHONE_SCREENS.map((s, i) => (
              <button
                key={i}
                className={`psc-label${i === active ? ' active' : ''}`}
                onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
              >
                <span className="psc-num">{s.num}</span>
                <div className="psc-label-text">
                  <div className="psc-name">{s.label}</div>
                  <div className="psc-desc">{s.desc}</div>
                </div>
                <div className="psc-bar" />
              </button>
            ))}
          </div>

          {/* CENTER — phone mockup */}
          <div className="psc-device-wrap">
            <div className="psc-glow" />
            <div className="psc-phone-v2">
              {PHONE_SCREENS.map((s, i) => (
                <div
                  key={i}
                  className={`psc-screen-switch${i === active ? ' active' : ''}`}
                  style={{ '--dir': dir }}
                >
                  <IPhoneFrame src={s.img} alt={s.label} width={260} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — current label (mobile / right column desktop) */}
          <div className="psc-right-col">
            {PHONE_SCREENS.map((s, i) => (
              <div key={i} className={`psc-right-label${i === active ? ' active' : ''}`}>
                <div className="psc-right-num">{s.num}</div>
                <div className="psc-right-name">{s.label}</div>
                <div className="psc-right-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="psc-dots">
          {PHONE_SCREENS.map((_, i) => (
            <button
              key={i}
              className={`psc-dot${i === active ? ' active' : ''}`}
              onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
              aria-label={PHONE_SCREENS[i].label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


export default function LandingPage() {
  const navRef = useRef(null);
  const rootRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() { setMenuOpen(false); }

  // Nav frosted-glass on scroll
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // run once on mount in case the page loaded scrolled
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver reveal
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp-root" ref={rootRef}>
      {/* Animated mesh gradient background */}
      <MeshGradientBg />

      {/* NAV */}
      <nav className="lp-nav" id="nav" ref={navRef}>
        <div className="nav-inner">
          <a href="#" className="lp-logo">
            <img src="/assets/app-icon.png" alt="Peptide AI" />
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/partners">Partners</Link>
            <Link to="/affiliates">Affiliates</Link>
          </div>
          <div className="nav-cta">
            <a href="#cta" className="btn btn-mint">Get the app</a>
            <button
              className={`nav-hamburger${menuOpen ? ' open' : ''}`}
              aria-label="Menu"
              onClick={() => setMenuOpen(o => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#how" onClick={closeMenu}>How it works</a>
        <a href="#features" onClick={closeMenu}>Features</a>
        <Link to="/partners" onClick={closeMenu}>Partners</Link>
        <Link to="/affiliates" onClick={closeMenu}>Affiliates</Link>
        <a href="#cta" className="mm-cta" onClick={closeMenu}>Get the app</a>
      </div>

      {/* HERO */}
      <section className="hero-v8" id="hero">
        <div className="hero-v8-inner">
          <div className="hero-v8-kicker reveal">
            <span className="kicker-dot"></span>
            Mastering your peptide protocols
          </div>
          <h1 className="hero-v8-title reveal d1">
            <span className="hv8-word" data-dir="-1">Peptide</span>
            <span className="hv8-word" data-dir="1"><em>AI</em></span>
          </h1>
          <p className="hero-v8-sub reveal d2">
            Peptides are powerful amino acid chains that signal your body to heal, recover, and optimize performance. Peptide AI removes the guesswork from your therapy — log doses, sync wearables, upload labs, and see exactly how your body responds.
          </p>
          <div className="hero-store-row reveal d3">
            <a href={APP_STORE_URL} className="hero-store-btn" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              <span className="hsb-label"><span className="hsb-sub">Download on the</span><span className="hsb-name">App Store</span></span>
            </a>
            <a href={PLAY_STORE_URL} className="hero-store-btn" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.21 12l2.488-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z"/></svg>
              <span className="hsb-label"><span className="hsb-sub">Get it on</span><span className="hsb-name">Google Play</span></span>
            </a>
          </div>

          {/* SCROLL MORPH HERO SHOWCASE — centered below store buttons */}
          <IntroAnimation />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="section-head">
          <div className="label reveal">How it works</div>
          <h2 className="section-title reveal d1">
            From guessing<br />to <em>knowing,</em> in four steps.
          </h2>
        </div>
        <div className="steps-wrap">
          <div className="step reveal">
            <div className="step-num">01</div>
            <h3>Build your <em>protocol.</em></h3>
            <p>Log every peptide, dose, route, and cycle — with stack templates and reminders built around how real protocols run, not generic medication apps.</p>
          </div>
          <div className="step reveal">
            <div className="step-num">02</div>
            <h3>Connect your <em>data.</em></h3>
            <p>Sync Whoop, Oura, and Apple Health. Upload bloodwork from Quest, LabCorp, Function, or a PDF. One source of truth for your biology.</p>
          </div>
          <div className="step reveal">
            <div className="step-num">03</div>
            <h3>See what's <em>working.</em></h3>
            <p>AI cross-references your protocol against biomarker shifts and wearable trends — surfacing the signal, not another dashboard of numbers.</p>
          </div>
          <div className="step reveal">
            <div className="step-num">04</div>
            <h3>Optimize and <em>repeat.</em></h3>
            <p>Get specific, research-grounded guidance on what to adjust, cycle, or stack next — with your Peptide Score tracking the arc.</p>
          </div>
        </div>
      </section>

      {/* 3D MARQUEE */}
      <section className="marquee-section" id="library">
        <div className="marquee-head">
          <div className="label reveal">The library</div>
          <h2 className="section-title reveal d1">
            57 peptides. Every<br />biomarker that <em>matters.</em>
          </h2>
          <p className="section-lead reveal d2">
            From BPC-157 to Retatrutide. From IGF-1 to ApoB. The only app that connects them.
          </p>
        </div>
        <div className="marquee-stage">
          <div className="marquee-3d">
            <MarqueeColumn items={COL_1} colClass="marq-col-1" />
            <MarqueeColumn items={COL_2} colClass="marq-col-2" />
            <MarqueeColumn items={COL_3} colClass="marq-col-3" />
          </div>
        </div>
      </section>


      {/* PHONE SCROLL — interactive app showcase */}
      <PhoneScroll />

      {/* FEATURES — real app screens */}
      <section className="section" id="features">
        <div className="section-head">
          <div className="label reveal">Inside the app</div>
          <h2 className="section-title reveal d1">
            Four screens that<br />change how you run <em>protocols.</em>
          </h2>
        </div>

        <div className="showcase">
          {/* ROW 1: Protocol Stack */}
          <div className="show-row">
            <div className="show-phone reveal">
              <IPhoneFrame src="/assets/screen-stack.png" alt="Peptide Stack screen" width={300} className="show-iphone" />
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">01 / Protocol Stack</div>
              <h3>Build and manage<br /><em>your entire stack.</em></h3>
              <p>
                Add every peptide, dose, route, and cycle to your personalized stack. Visualize what's active, what's coming up, and what you've cycled — all in one organized view.
              </p>
              <ul className="show-list">
                <li>Log 50+ peptides with dose, frequency, and route</li>
                <li>Stack templates and AI-assisted protocol builder</li>
                <li>Cycle tracking with on/off phase reminders</li>
              </ul>
            </div>
          </div>

          {/* ROW 2: Dashboard */}
          <div className="show-row reverse">
            <div className="show-phone reveal">
              <IPhoneFrame src="/assets/screen-dashboard.png" alt="Dashboard screen" width={300} className="show-iphone" />
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">02 / Dashboard</div>
              <h3>Your protocol,<br /><em>at a glance.</em></h3>
              <p>
                See everything that matters on one screen — active compounds, today's doses, wearable data, and recent AI insights. Your entire protocol, organized and actionable.
              </p>
              <ul className="show-list">
                <li>Active compound count with real-time cycle tracking</li>
                <li>Quick-log doses with a single tap</li>
                <li>Sync with Whoop, Oura, and Apple Health</li>
              </ul>
            </div>
          </div>

          {/* ROW 3: Dose Tracking */}
          <div className="show-row">
            <div className="show-phone reveal">
              <IPhoneFrame src="/assets/screen-track.png" alt="Dose Tracking screen" width={300} className="show-iphone" />
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">03 / Dose Tracking</div>
              <h3>Log every dose,<br /><em>never miss a beat.</em></h3>
              <p>
                One-tap dose logging with timestamps, route of administration, and cycle-day tracking. Build a complete injection history so the AI always has full context.
              </p>
              <ul className="show-list">
                <li>Timestamped dose logs with route and amount</li>
                <li>Streak and adherence tracking per compound</li>
                <li>AI insights pull from your actual log history</li>
              </ul>
            </div>
          </div>

          {/* ROW 4: Injection Sites */}
          <div className="show-row reverse">
            <div className="show-phone reveal">
              <IPhoneFrame src="/assets/screen-injection-sites.png" alt="Injection Sites screen" width={300} className="show-iphone" />
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">04 / Injection Sites</div>
              <h3>Rotate smarter,<br /><em>recover faster.</em></h3>
              <p>
                Track every injection site on a visual body map. The app remembers where you last pinned and suggests optimal rotation to reduce scar tissue buildup and improve absorption.
              </p>
              <ul className="show-list">
                <li>Visual body map with pin history</li>
                <li>Smart rotation suggestions based on healing time</li>
                <li>Log pain, swelling, or bruising per site</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* GREEN WAVE SECTION */}
      <section className="green-wave-section">
        <div className="green-wave-bg" />
        <div className="wave-inner">
          <p className="wave-quote reveal">Built for athletes who <em>run real protocols</em> — not guesswork.</p>
          <div className="wave-stat-row">
            <div className="wave-stat reveal">
              <div className="num">57</div>
              <div className="desc">Peptides in catalog</div>
            </div>
            <div className="wave-stat reveal d1">
              <div className="num">4</div>
              <div className="desc">Wearable integrations</div>
            </div>
            <div className="wave-stat reveal d2">
              <div className="num">AI</div>
              <div className="desc">Protocol intelligence</div>
            </div>
            <div className="wave-stat reveal d3">
              <div className="num">0</div>
              <div className="desc">Guesswork required</div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="label reveal">The problem</div>
        <p className="manifesto-quote reveal d1">
          Most peptide users are <em>flying blind</em> — running protocols built from forum posts and guessing whether any of it is working.
        </p>
        <div className="manifesto-cite reveal d2">Peptide AI is the intelligence layer.</div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testify">
        <div className="label reveal">What users are saying</div>
        <p className="testify-quote reveal">
          "Finally an app that treats peptide protocols seriously. The AI chat knows my stack <em>and</em> my labs — it's like having a smart friend who actually reads the research."
        </p>
        <div className="testify-person reveal d1">
          <span className="testify-name">@BrickBoyDior</span> &nbsp;·&nbsp; Fitness Influencer
        </div>
        <p className="testify-quote reveal" style={{ marginTop: '3rem' }}>
          "This is the tool I wish I had when I started. Tracking doses, syncing my wearable data, and getting AI insights in one place — Peptide AI makes it effortless."
        </p>
        <div className="testify-person reveal d1">
          <span className="testify-name">@RaphKG</span> &nbsp;·&nbsp; Fitness Creator
        </div>
        <p className="testify-quote reveal" style={{ marginTop: '3rem' }}>
          "Gharilla approved. The body scan and protocol tracker alone are worth it — I can actually see the comp changes in real time."
        </p>
        <div className="testify-person reveal d1">
          <span className="testify-name">@Gharilla</span> &nbsp;·&nbsp; Fitness Influencer
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="section-head">
          <div className="label reveal">Pricing</div>
          <h2 className="section-title reveal d1">Simple, transparent<br /><em>pricing.</em></h2>
          <p className="section-lead reveal d2" style={{ fontSize: '16px' }}>Start monthly, or commit yearly and save over 54%. Most users switch to yearly within the first month.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', maxWidth: '820px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Yearly — PRIMARY */}
          <div className="reveal" style={{ background: 'var(--card)', border: '2px solid var(--mint)', borderRadius: '1.25rem', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative', boxShadow: '0 0 60px -20px rgba(45,216,132,0.25)' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--mint)', color: '#000', fontSize: '.75rem', fontWeight: 700, padding: '.3rem .9rem', borderRadius: '1rem', whiteSpace: 'nowrap' }}>Best Value — Save 54%</div>
            <div style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--mint)', marginBottom: '.75rem' }}>Yearly</div>
            <div style={{ fontSize: '3rem', fontWeight: 600, fontFamily: "'Fraunces',serif", color: 'var(--ink)' }}><span style={{ fontSize: '1.5rem', verticalAlign: 'super' }}>$</span>54.99<span style={{ fontSize: '1rem', color: 'var(--ink-soft)' }}>/year</span></div>
            <div style={{ fontSize: '.82rem', color: 'var(--mint)', margin: '.4rem 0 1.25rem', fontWeight: 500 }}>≈ $4.58 / month</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0', textAlign: 'left', color: 'var(--ink-soft)', fontSize: '.95rem', lineHeight: 2.2 }}>
              <li>✓ Full peptide tracking (57 compounds)</li>
              <li>✓ AI Insights Chatbot</li>
              <li>✓ AI Body Scanner</li>
              <li>✓ Protocol &amp; stack builder</li>
              <li>✓ Priority support</li>
              <li>✓ Early access to new features</li>
            </ul>
            <a href="#cta" className="btn btn-mint" style={{ width: '100%', display: 'block', textAlign: 'center', fontSize: '1rem' }}>Get started →</a>
          </div>
          {/* Monthly */}
          <div className="reveal d1" style={{ background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '1.25rem', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line-2)', color: 'var(--ink-soft)', fontSize: '.75rem', fontWeight: 600, padding: '.3rem .9rem', borderRadius: '1rem', whiteSpace: 'nowrap' }}>Most Popular</div>
            <div style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-soft)', marginBottom: '.75rem' }}>Monthly</div>
            <div style={{ fontSize: '3rem', fontWeight: 600, fontFamily: "'Fraunces',serif", color: 'var(--ink)' }}><span style={{ fontSize: '1.5rem', verticalAlign: 'super' }}>$</span>9.99<span style={{ fontSize: '1rem', color: 'var(--ink-soft)' }}>/month</span></div>
            <div style={{ fontSize: '.82rem', color: 'var(--ink-mute)', margin: '.4rem 0 1.25rem' }}>Cancel anytime</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0', textAlign: 'left', color: 'var(--ink-soft)', fontSize: '.95rem', lineHeight: 2.2 }}>
              <li>✓ Full peptide tracking (57 compounds)</li>
              <li>✓ AI Insights Chatbot</li>
              <li>✓ AI Body Scanner</li>
              <li>✓ Protocol &amp; stack builder</li>
              <li>✓ Priority support</li>
              <li style={{ color: 'var(--ink-mute)' }}>✗ Early access to new features</li>
            </ul>
            <a href="#cta" className="btn btn-ghost" style={{ width: '100%', display: 'block', textAlign: 'center' }}>Get started</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="cta-card reveal">
          <h2>Stop guessing.<br /><em>Start measuring.</em></h2>
          <p>Join thousands of serious users running their protocols with precision. Download free, upgrade when you're ready.</p>
          <div className="cta-buttons">
            <a
              href={APP_STORE_URL}
              className="store-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>
                <span className="s">Download on the</span>
                <span className="b">App Store</span>
              </span>
            </a>
            <a
              href={PLAY_STORE_URL}
              className="store-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.21 12l2.488-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z" />
              </svg>
              <span>
                <span className="s">Get it on</span>
                <span className="b">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#" className="lp-logo">
              <img src="/assets/app-icon.png" alt="Peptide AI" style={{ height: '30px' }} />
            </a>
            <p>The precision layer for peptide protocols. Built in Blacksburg, VA.</p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">iOS</a></li>
              <li><a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">Android</a></li>
              <li><a href="#cta">Pricing</a></li>
              <li><a href="#features">Changelog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#hero">About</a></li>
              <li><a href="#how">Science</a></li>
              <li><Link to="/partners">Partners</Link></li>
              <li><Link to="/affiliates">Affiliates</Link></li>
              <li><Link to="/support">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/ccpa">CCPA</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Peptide AI LLC</div>
          <div>Informational tracking only. Not a medical device.</div>
        </div>
      </footer>
    </div>
  );
}
