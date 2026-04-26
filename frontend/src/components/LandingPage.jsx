import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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

export default function LandingPage() {
  const navRef = useRef(null);
  const rootRef = useRef(null);

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
      {/* Shader mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
        <div className="mesh-blob blob-4"></div>
      </div>
      <div className="noise-overlay" aria-hidden="true"></div>
      <div className="grid-overlay" aria-hidden="true"></div>

      {/* NAV */}
      <nav className="lp-nav" id="nav" ref={navRef}>
        <div className="nav-inner">
          <a href="#" className="lp-logo">
            <img src="/assets/app-icon.png" alt="Peptide AI" />
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#library">Library</a>
            <a href="#features">Features</a>
            <Link to="/affiliates">Affiliates</Link>
          </div>
          <div className="nav-cta">
            <a href="#cta" className="btn btn-mint">Get the app</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-v8" id="hero">
        <div className="hero-v8-inner">
          <div className="hero-v8-kicker reveal">
            <span className="kicker-dot"></span>
            Meet Peptide AI
          </div>
          <h1 className="hero-v8-title reveal d1">
            <span className="hv8-word" data-dir="-1">Peptide</span>
            <span className="hv8-word" data-dir="1"><em>Intelligence.</em></span>
          </h1>
          <p className="hero-v8-sub reveal d2">
            Log every dose, sync your wearables, upload your labs — and finally see which compounds are earning their keep. For the people running real protocols, not reading Reddit threads.
          </p>
          <div className="hero-v8-cta reveal d3">
            <a href="#cta" className="btn btn-mint btn-lg">Get the app →</a>
            <a href="#features" className="btn btn-ghost btn-lg">See it in action</a>
          </div>
        </div>

        <div className="hero-v8-phones reveal d2">
          <div className="hv8-phone hv8-phone-left">
            <div className="hv8-phone-frame">
              <img src="/assets/screen1.png" alt="Peptide AI Home" />
            </div>
          </div>
          <div className="hv8-phone hv8-phone-center">
            <div className="hv8-phone-frame">
              <img src="/assets/screen2.png" alt="Peptide AI Optimize" />
            </div>
          </div>
          <div className="hv8-phone hv8-phone-right">
            <div className="hv8-phone-frame">
              <img src="/assets/screen3.png" alt="Peptide AI Body Scan" />
            </div>
          </div>
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
            100+ peptides. Every<br />biomarker that <em>matters.</em>
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

      {/* FEATURES — real app screens */}
      <section className="section" id="features">
        <div className="section-head">
          <div className="label reveal">Inside the app</div>
          <h2 className="section-title reveal d1">
            Three screens that<br />change how you run <em>protocols.</em>
          </h2>
        </div>

        <div className="showcase">
          {/* ROW 1: Today's Stack */}
          <div className="show-row">
            <div className="show-phone reveal">
              <div className="show-phone-frame">
                <img src="/assets/screen1.png" alt="Today's Stack screen" />
              </div>
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">01 / Home</div>
              <h3>Today's stack,<br /><em>front and center.</em></h3>
              <p>
                Every peptide you're running — BPC-157, TB-500, Tirzepatide, whatever the stack — shows up as a single tap-to-log card. Active compound count, doses taken today, current streak. No spreadsheets. No guessing which vial is next.
              </p>
              <ul className="show-list">
                <li>Cycle-aware: auto-tracks Week X of Y on every compound</li>
                <li>Sync with Whoop, Oura, Apple Health for live key metrics</li>
                <li>One-tap Body Scan to AI-analyze progress over time</li>
              </ul>
            </div>
          </div>

          {/* ROW 2: Optimize */}
          <div className="show-row reverse">
            <div className="show-phone reveal">
              <div className="show-phone-frame">
                <img src="/assets/screen2.png" alt="Optimize screen" />
              </div>
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">02 / Optimize</div>
              <h3>Patterns your <em>spreadsheet</em> will never catch.</h3>
              <p>
                Every dose, side effect, and workout logged feeds a 30-day trend engine. Adherence, volume, and response all plotted against your protocol — with AI insights that connect the dots between what you're taking and what's actually shifting.
              </p>
              <ul className="show-list">
                <li>Adherence, side effect, and volume trends — computed live</li>
                <li>Upload bloodwork to unlock biomarker-linked insights</li>
                <li>AI explains <em>why</em> something's moving, not just that it is</li>
              </ul>
            </div>
          </div>

          {/* ROW 3: Body Scan */}
          <div className="show-row">
            <div className="show-phone reveal">
              <div className="show-phone-frame">
                <img src="/assets/screen3.png" alt="Body Scan screen" />
              </div>
            </div>
            <div className="show-copy reveal d1">
              <div className="show-mark">03 / Body Scan</div>
              <h3>See composition change <em>before</em> the scale does.</h3>
              <p>
                Front-facing physique photos, analyzed on-device, never uploaded. The model watches body composition trend across your cycle — so you can tell in week 4 whether that GLP-1 or GH secretagogue is actually doing what you paid for.
              </p>
              <ul className="show-list">
                <li>On-device analysis — your photos never leave your phone</li>
                <li>50 scans/month included, more on higher tiers</li>
                <li>Overlay progress against each active compound's cycle</li>
              </ul>
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
        <div className="manifesto-cite reveal d2">Peptide AI is the precision layer.</div>
      </section>

      {/* TESTIMONIAL */}
      <section className="testify">
        <p className="testify-quote reveal">
          "Finally an app that treats peptide protocols seriously. The AI chat knows my stack <em>and</em> my labs — it's like having a smart friend who actually reads the research."
        </p>
        <div className="testify-person reveal d1">
          <span className="testify-name">Jackson R.</span> &nbsp;·&nbsp; Biohacker, Austin TX
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="cta-card reveal">
          <h2>Your protocol,<br /><em>finally measured.</em></h2>
          <p>Join the serious users running their stacks with precision.</p>
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
