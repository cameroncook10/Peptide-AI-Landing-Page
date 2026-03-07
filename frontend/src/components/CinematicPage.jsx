import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || '';

const FEATURES = [
  {
    num: '01',
    title: 'Build your peptide stack',
    desc: 'Design personalized protocols with precise dosing schedules. BPC-157, TB-500, Semax — all tracked in one place.',
    screen: '/assets/screen1.png',
  },
  {
    num: '02',
    title: 'Monitor your optimization',
    desc: 'Watch HRV trends, sleep quality, and recovery metrics evolve as your protocol progresses. The data tells the story.',
    screen: '/assets/screen2.png',
  },
  {
    num: '03',
    title: 'AI-powered insights',
    desc: 'Get personalized analysis showing exactly how your stack performs — backed entirely by your own biometric data.',
    screen: '/assets/screen3.png',
  },
];

/* ───────────────────────────────────────────────────
   Subtle full-page DNA shader (scroll-aware)
   ─────────────────────────────────────────────────── */
const dnaShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform float scroll;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
#define PI 3.14159265359

float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f*=f*(3.-2.*f);
  return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),
             mix(h2(i+vec2(0,1)),h2(i+1.),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.+vec2(3.7,1.9);a*=.5;}
  return v;
}

// Brand palette
#define ACCENT   vec3(0.,0.898,0.627)   // #00E5A0
#define ACCENT2  vec3(0.,0.702,0.784)   // #00B3C8 muted teal
#define BG_TINT  vec3(0.024,0.031,0.063)// #060810 layer-0
#define DIM_ACCENT vec3(0.,0.45,0.32)   // darker accent for subtle elements

void main(){
  vec2 uv=(FC-.5*R)/MN;

  // Rotate UV ~30deg for diagonal DNA
  float ra=PI/5.5;
  float cs=cos(ra),sn=sin(ra);
  vec2 dnaUv=mat2(cs,-sn,sn,cs)*uv;
  dnaUv.y+=scroll*3.5;

  // Dark base matching --layer-0
  vec3 col=BG_TINT;

  // Atmospheric nebula — brand-tinted
  float nb=fbm(uv*1.2+T*.018);
  col+=vec3(0.,0.02,0.035)*nb*nb*2.0;
  col+=vec3(0.,0.012,0.025)*fbm(uv*2.4-T*.012)*.25;

  // Star field — tinted accent
  vec2 starGrid=uv+vec2(0.,scroll*0.3);
  vec2 gridId=floor(starGrid*30.);
  vec2 gridUv=fract(starGrid*30.)-.5;
  float rnd=h2(gridId);
  if(rnd>.86){
    float twinkle=.5+.5*sin(T*1.4+rnd*12.);
    float starD=length(gridUv);
    float brightness=.00025*twinkle*smoothstep(.05,.0,starD);
    vec3 starCol=mix(ACCENT,ACCENT2,h2(gridId+1.));
    col+=starCol*brightness;
  }

  // Faint molecular dot grid
  vec2 molUv=fract(dnaUv*5.+vec2(T*.005,-T*.004))-.5;
  float molDot=smoothstep(.06,.02,length(molUv));
  col+=DIM_ACCENT*molDot*.006*fbm(dnaUv*2.5+T*.006);

  // DNA Double Helix — diagonal, brand colors
  float freq=5.5;
  float amp=0.2;
  float scrollAnim=T*0.18+scroll*5.0;
  float phase=dnaUv.y*freq+scrollAnim;
  float xs1=amp*sin(phase);
  float xs2=-xs1;
  float slope=amp*freq*cos(phase);
  float invLen=inversesqrt(1.+slope*slope);
  float dp1=abs(dnaUv.x-xs1)*invLen;
  float dp2=abs(dnaUv.x-xs2)*invLen;

  // Strands — accent green + muted teal
  col+=ACCENT*0.0025/(dp1+0.009);
  col+=ACCENT2*0.0025/(dp2+0.009);

  // Soft axial glow — dark accent tint
  col+=vec3(0.,0.04,0.06)*0.0015/(dnaUv.x*dnaUv.x+0.12);

  // Atom nodes — accent palette
  float nodeT=fract(phase*(3./PI));
  float nodeMask=smoothstep(.4,.0,abs(nodeT-.5));
  float dn1=length(dnaUv-vec2(xs1,dnaUv.y));
  float dn2=length(dnaUv-vec2(xs2,dnaUv.y));
  col+=ACCENT*nodeMask*.005/(dn1*dn1+.001);
  col+=ACCENT2*nodeMask*.005/(dn2*dn2+.001);

  // Cross-bridges — muted teal
  float bGlow=0.;
  for(float period=-3.;period<=3.;period++){
    for(float k=0.;k<6.;k++){
      float angle=k*(PI/3.);
      float bY=(angle+2.*PI*period-scrollAnim)/freq;
      if(abs(bY-dnaUv.y)<.44){
        float bx1=amp*sin(angle);
        float bx2=-bx1;
        float lo=min(bx1,bx2),hi=max(bx1,bx2);
        float cx=clamp(dnaUv.x,lo,hi);
        float bd=length(dnaUv-vec2(cx,bY));
        bGlow+=.5/(bd*bd*900.+1.);
      }
    }
  }
  col+=ACCENT2*bGlow*.0012;

  // Floating beads — brand colors only
  for(float i=0.;i<6.;i++){
    vec2 pos=vec2(h2(vec2(i*17.3,1.)),h2(vec2(i*6.1,3.)))-.5;
    pos*=2.6;
    pos.x+=sin(T*.1+i*2.1)*.12;
    pos.y+=cos(T*.08+i*1.85)*.12;
    pos.y+=scroll*1.2;
    float d=length(uv-pos);
    vec3 beadCol=i<3. ? ACCENT : ACCENT2;
    float pulse=.5+.5*sin(T*1.+i*2.7);
    float r=.01+.004*pulse;
    col+=beadCol*.001/(d*d+.0015);
    col+=beadCol*.1*smoothstep(r,r*.4,d);
  }

  // Very gentle vignette
  col*=1.-smoothstep(1.0,2.2,length(uv));

  // Tone map + gamma
  col=col/(1.+col*.7);
  col=pow(max(col,0.),vec3(.45));

  O=vec4(col,1.);
}`;

/* ───────────────────────────────────────────────────
   Full-page WebGL background hook
   ─────────────────────────────────────────────────── */
function useFullPageShader() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
      }
      return s;
    }

    const vs = compile(
      gl.VERTEX_SHADER,
      `#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}`
    );
    const fs = compile(gl.FRAGMENT_SHADER, dnaShaderSource);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'resolution');
    const uTime = gl.getUniformLocation(prog, 'time');
    const uScroll = gl.getUniformLocation(prog, 'scroll');

    function onScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function loop(now) {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 1e-3);
      gl.uniform1f(uScroll, scrollRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(loop);
    }
    animFrameRef.current = requestAnimationFrame(loop);

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animFrameRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return canvasRef;
}

/* ───────────────────────────────────────────────────
   Counter component
   ─────────────────────────────────────────────────── */
function Counter({ end, suffix = '', decimal = false }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !ran.current) {
          ran.current = true;
          const t0 = performance.now();
          (function tick(now) {
            const p = Math.min((now - t0) / 1800, 1);
            setVal((1 - Math.pow(1 - p, 3)) * end);
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="proof-value">
      {decimal ? val.toFixed(1) : Math.round(val)}
      {suffix}
    </span>
  );
}

/* ───────────────────────────────────────────────────
   Main page
   ─────────────────────────────────────────────────── */
export default function CinematicPage() {
  const canvasRef = useFullPageShader();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [joinCount, setJoinCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist/count`)
      .then((r) => r.json())
      .then((d) => {
        if (d.count !== null && d.count !== undefined)
          setWaitlistCount(d.count);
      })
      .catch(() => {});
  }, [joinCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the waitlist!");
        setEmail('');
        setPhone('');
        setJoinCount((c) => c + 1);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again.');
    }
  }

  return (
    <main className="world">
      {/* ── Fixed shader background ── */}
      <div className="atmos">
        <canvas ref={canvasRef} className="atmos-shader" />
        <div className="atmos-noise" />
      </div>

      {/* ══════════════════════════════════
          HERO ZONE
          ══════════════════════════════════ */}
      <section className="zone-hero-content" id="top">
        <div className="hero-fade-in-down" style={{ marginBottom: '2rem' }}>
          <div className="hero-trust-badge">
            <span className="hero-pulse-dot" />
            <span>AI-Powered Peptide Tracking</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '64rem', margin: '0 auto' }}>
          <h1 className="hero-fade-in-up hero-delay-200 hero-headline">
            Optimize Your
          </h1>
          <h1 className="hero-fade-in-up hero-delay-400 hero-headline hero-headline-alt">
            Peptide Stack.
          </h1>

          <p className="hero-fade-in-up hero-delay-600 hero-subtitle">
            Build protocols, track doses, and let AI surface the insights that
            show exactly how your stack is performing.
          </p>

          <div className="hero-fade-in-up hero-delay-800 hero-buttons">
            <a className="btn btn-primary" href="#waitlist" style={{ minWidth: '180px' }}>
              <span>Join the Waitlist</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a className="btn btn-ghost" href="#features" style={{ minWidth: '160px' }}>
              See the App
            </a>
          </div>

          <div className="hero-fade-in-up hero-delay-800 hero-tags">
            <span className="tag-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </span>
            <span className="tag-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l12.19-12.2L12.88 8l-9.7 15.76zM20.7 10.06l-3.13-1.8-3.59 3.59 3.59 3.59 3.16-1.82c.9-.52.9-1.56-.03-2.07M3.14.32C2.8.6 2.6 1.04 2.6 1.6v20.84l9.6-9.6L3.14.32zM16.36 3.74L4.17.04c-.35-.1-.69-.06-.97.12l9.64 9.65 3.52-6.07z" /></svg>
              Google Play
            </span>
            <span className="tag-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              Coming Soon
            </span>
          </div>
        </div>

        <a href="#features" className="hero-fade-in-up hero-delay-800 hero-scroll-cue">
          <span>Scroll to explore</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </section>

      {/* ══════════════════════════════════
          FEATURES ZONE
          ══════════════════════════════════ */}
      <section className="zone zone-features" id="features">
        <div className="feat-gallery">
          <div className="gallery-glow" />
          <div className="gallery-stage">
            {FEATURES.map((f, i) => (
              <div key={i} className={`gallery-card gc-${i + 1}`}>
                <img src={f.screen} alt={f.title} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="gallery-dots">
            {FEATURES.map((_, i) => (
              <span key={i} className={`gallery-dot gd-${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="feat-copy">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feat-item fi-${i + 1}`}>
              <span className="feat-num">{f.num}</span>
              <h2 className="feat-title">{f.title}</h2>
              <p className="feat-desc">{f.desc}</p>
              <div className="feat-accent" />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          PROOF / STATS ZONE
          ══════════════════════════════════ */}
      <section className="zone zone-proof">
        <div className="proof-inner">
          <h2 className="proof-h2">
            Trusted by the <span className="accent-text">community.</span>
          </h2>
          <div className="proof-grid">
            <div className="proof-card">
              <span className="proof-value proof-value-sm">Custom AI Protocol</span>
              <span className="proof-label">Trained on <strong>1,000+</strong> clinical trials</span>
            </div>
            <div className="proof-card">
              <Counter end={50} suffix="+" />
              <span className="proof-label">Peptides tracked</span>
            </div>
            <div className="proof-card">
              <span className="proof-value proof-value-sm">Evidence-Based</span>
              <span className="proof-label">Science-backed recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          WAITLIST ZONE
          ══════════════════════════════════ */}
      <section className="zone zone-wl" id="waitlist">
        <div className="wl-content">
          <div className="badge">
            <span className="badge-dot" />
            Early Access
          </div>

          <h2 className="wl-h2">
            Be first in line
            <br />
            <span className="accent-grad">when we launch.</span>
          </h2>

          <p className="wl-sub">
            Get notified the moment Peptide AI drops on the App Store and
            Google Play. Enter your email and phone for SMS alerts.
          </p>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="ok"
                className="wl-ok"
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="wl-ok-icon">
                  <motion.svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <motion.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                    <motion.polyline points="22 4 12 14.01 9 11.01" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
                  </motion.svg>
                </div>
                <p>{message}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="wl-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="wl-field">
                  <svg className="wl-field-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <polyline points="22,7 12,13 2,7" />
                  </svg>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                <div className="wl-field">
                  <svg className="wl-field-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5" y="2" width="14" height="20" rx="3" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                  <input
                    type="tel"
                    placeholder="Phone (optional — for SMS)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={status === 'loading'}
                  />
                </div>
                <button className="wl-btn" type="submit" disabled={status === 'loading'}>
                  <span className="wl-btn-bg" />
                  <span className="wl-btn-text">
                    {status === 'loading' ? (
                      <>
                        <span className="spinner" /> Joining...
                      </>
                    ) : (
                      <>
                        Notify Me
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === 'error' && <p className="wl-err">{message}</p>}

          <div className="wl-proof">
            <div className="wl-avatars">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="wl-av" style={{ '--i': i }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </div>
              ))}
            </div>
            <span className="wl-proof-text">
              Join <strong>{Math.max(500, waitlistCount || 0).toLocaleString()}+</strong> on the waitlist
            </span>
          </div>

          <div className="wl-trust">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              No spam
            </span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Encrypted
            </span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Instant alerts
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CLOSING ZONE
          ══════════════════════════════════ */}
      <section className="zone zone-close">
        <div className="close-inner">
          <h2 className="close-h2">
            The smarter way to run
            <br />
            your <span className="accent-text">protocol.</span>
          </h2>
          <p className="close-sub">
            Protocol management, biometric tracking, and AI insights — one
            clean app. Join the waitlist to be first in.
          </p>
          <div className="close-actions">
            <a className="btn btn-primary" href="#waitlist">Join the Waitlist</a>
            <a className="btn btn-ghost" href="https://peptideai.co" target="_blank" rel="noopener">Learn More</a>
          </div>
          <div className="socials">
            <a href="https://www.tiktok.com/@peptideai.co" target="_blank" rel="noopener" aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V6.93a4.85 4.85 0 0 1-1.01-.24z" /></svg>
            </a>
            <a href="https://www.instagram.com/peptideai.co" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://twitter.com/PeptideAI" target="_blank" rel="noopener" aria-label="X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.734-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
            </a>
          </div>
          <a className="top-link" href="#top">Back to top</a>
        </div>
      </section>
    </main>
  );
}
