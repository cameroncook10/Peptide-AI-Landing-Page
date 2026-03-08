import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import './CinematicPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

/* ═══════════════════════════════════════════════════
   Nebula Background Shaders
   ═══════════════════════════════════════════════════ */
const NEBULA_VERT = `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const NEBULA_FRAG = `
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float s=0.0,a=0.5;
  for(int i=0;i<5;i++){s+=noise(p)*a;p*=2.0;a*=0.5;}
  return s;
}
void main(){
  float t=uTime*0.025;
  float n1=fbm(vUv*2.5+vec2(t,t*0.6));
  float n2=fbm(vUv*3.5-vec2(t*0.4,t*0.25));
  float n3=fbm(vUv*5.0+vec2(-t*0.2,t*0.4));
  float n4=fbm(vUv*1.8+vec2(t*0.15,-t*0.35));
  vec3 c=vec3(0.001,0.004,0.002);
  c+=vec3(0.0,0.03,0.012)*pow(n1,2.5);
  c+=vec3(0.0,0.02,0.008)*pow(n2,2.0);
  c+=vec3(0.0,0.04,0.015)*pow(max(n3-0.3,0.0),2.0)*0.9;
  c+=vec3(0.0,0.015,0.006)*n4*n1;
  gl_FragColor=vec4(c,1.0);
}`;

// Custom glow point shader — circular soft glow with per-particle size
const GLOW_POINT_VERT = `
attribute float aSize;
attribute float aBright;
varying float vBright;
void main(){
  vBright=aBright;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*(300.0/(-mv.z));
  gl_Position=projectionMatrix*mv;
}`;

const GLOW_POINT_FRAG = `
uniform vec3 uColor;
uniform float uOpacity;
varying float vBright;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  if(d>1.0) discard;
  float glow=exp(-d*d*2.0);
  float core=smoothstep(0.35,0.0,d);
  float outer=exp(-d*d*0.8)*0.3;
  float alpha=(glow*0.7+core*1.0+outer)*vBright*uOpacity;
  vec3 c=uColor*(0.6+core*0.6);
  gl_FragColor=vec4(c*alpha,alpha);
}`;

// Animated flying star shader
const STAR_VERT = `
attribute float aSize;
attribute float aSpeed;
attribute float aPhase;
uniform float uTime;
varying float vAlpha;
void main(){
  vec3 p=position;
  // Orbit slowly
  float angle=uTime*aSpeed+aPhase;
  float ca=cos(angle),sa=sin(angle);
  p=vec3(p.x*ca-p.z*sa, p.y+sin(uTime*aSpeed*0.5+aPhase)*2.0, p.x*sa+p.z*ca);
  // Twinkle
  vAlpha=0.3+0.7*pow(sin(uTime*aSpeed*3.0+aPhase)*0.5+0.5,2.0);
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=aSize*(200.0/(-mv.z));
  gl_Position=projectionMatrix*mv;
}`;

const STAR_FRAG = `
uniform vec3 uColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  if(d>1.0) discard;
  float glow=exp(-d*d*4.0);
  gl_FragColor=vec4(uColor*glow*vAlpha,glow*vAlpha);
}`;

/* ═══════════════════════════════════════════════════
   High-Quality DNA Helix Scene
   ═══════════════════════════════════════════════════ */
function createScene(canvas, THREE, postFx) {
  const mob = innerWidth < 780;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: false });
  const dpr = Math.min(devicePixelRatio, mob ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000800);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  // No shadow maps needed — fully particle-based scene

  // ── Nebula sky-dome (lightweight — renders immediately) ──
  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERT,
    fragmentShader: NEBULA_FRAG,
    uniforms: { uTime: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(90, mob ? 32 : 64, mob ? 16 : 32), nebulaMat));

  // ── DNA Group ──
  const dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  // ── Lights (cheap, create immediately) ──
  // Minimal lighting — particles are self-illuminated via additive blending + shaders
  scene.add(new THREE.AmbientLight(0x001a08, 0.5));
  const keyLight = new THREE.PointLight(0x00ff88, 2.0, 40);
  const fillLight = new THREE.PointLight(0x00cc66, 1.0, 30);
  fillLight.position.set(-5, 0, -5);
  const rimLight = new THREE.PointLight(0x00ffaa, 0.8, 25);
  rimLight.position.set(0, -10, 5);
  scene.add(keyLight, fillLight, rimLight);
  const shadowLight = { position: keyLight.position, target: { position: new THREE.Vector3(), updateMatrixWorld(){} } };

  // ── Camera path ──
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 10, mob ? 32 : 26),
    new THREE.Vector3(4, 7, mob ? 26 : 22),
    new THREE.Vector3(7, 4, mob ? 22 : 18),
    new THREE.Vector3(-5, 1, mob ? 16 : 12),
    new THREE.Vector3(-6, -2, mob ? 12 : 8),
    new THREE.Vector3(4, -5, mob ? 8 : 6),
    new THREE.Vector3(2, -8, mob ? 5 : 3),
    new THREE.Vector3(0, -12, mob ? 2 : 1),
    new THREE.Vector3(0, -15, mob ? 1 : 0.5),
  ]);

  // ── Bloom post-processing (desktop only) ──
  let composer = null;
  if (!mob && postFx) {
    composer = new postFx.EffectComposer(renderer);
    composer.addPass(new postFx.RenderPass(scene, camera));
    composer.addPass(new postFx.UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight), 2.5, 1.0, 0.05,
    ));
  }

  // ── Build queue: neon particle-cloud DNA + flying stars ──
  const TURNS = 8, HEIGHT = 50, RADIUS = 2.8;
  const SEGMENTS = mob ? 200 : 500;
  const RUNG_COUNT = mob ? 50 : 120;
  const STRAND_PTS = mob ? 1200 : 5000;
  const HALO_PTS = mob ? 600 : 2000;
  const RUNG_INTERP = mob ? 12 : 22;

  const buildQueue = [];
  const ctx = { c1: null, c2: null, starMat: null };

  // Step 1: helix backbone strands with custom glow shader
  buildQueue.push(() => {
    const pts1 = [], pts2 = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const a = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HEIGHT;
      pts1.push(new THREE.Vector3(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS));
      pts2.push(new THREE.Vector3(Math.cos(a + Math.PI) * RADIUS, y, Math.sin(a + Math.PI) * RADIUS));
    }
    ctx.c1 = new THREE.CatmullRomCurve3(pts1);
    ctx.c2 = new THREE.CatmullRomCurve3(pts2);

    function makeStrand(curve, count, noiseR, baseSize, sizeVar) {
      const pos = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const brights = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const p = curve.getPoint(t);
        const u1 = Math.random() || 0.001, u2 = Math.random();
        const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * noiseR;
        const angle = Math.random() * Math.PI * 2;
        pos[i * 3] = p.x + Math.cos(angle) * g;
        pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * noiseR * 0.4;
        pos[i * 3 + 2] = p.z + Math.sin(angle) * g;
        sizes[i] = baseSize + Math.random() * sizeVar;
        brights[i] = 0.5 + Math.random() * 0.5;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));
      return geo;
    }

    // Core strands — bright neon green, tight cluster
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ffbb) }, uOpacity: { value: 1.0 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (const c of [ctx.c1, ctx.c2]) {
      dnaGroup.add(new THREE.Points(makeStrand(c, STRAND_PTS, 0.12, 0.06, 0.08), coreMat));
    }

    // Outer glow halo — softer, wider, larger particles
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ff99) }, uOpacity: { value: 0.4 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (const c of [ctx.c1, ctx.c2]) {
      dnaGroup.add(new THREE.Points(makeStrand(c, HALO_PTS, 0.45, 0.15, 0.2), haloMat));
    }
  });

  // Step 2: neon rung connections + bright junction nodes
  buildQueue.push(() => {
    const rPos = [], rSizes = [], rBrights = [];
    const nPos = [], nSizes = [], nBrights = [];
    for (let i = 0; i < RUNG_COUNT; i++) {
      const t = i / RUNG_COUNT;
      const p1 = ctx.c1.getPoint(t), p2 = ctx.c2.getPoint(t);
      for (let j = 0; j <= RUNG_INTERP; j++) {
        const f = j / RUNG_INTERP;
        rPos.push(
          p1.x + (p2.x - p1.x) * f + (Math.random() - 0.5) * 0.06,
          p1.y + (p2.y - p1.y) * f + (Math.random() - 0.5) * 0.06,
          p1.z + (p2.z - p1.z) * f + (Math.random() - 0.5) * 0.06,
        );
        rSizes.push(0.03 + Math.random() * 0.04);
        rBrights.push(0.4 + Math.random() * 0.4);
      }
      // Bright junction nodes
      for (const p of [p1, p2]) {
        nPos.push(p.x, p.y, p.z);
        nSizes.push(0.12 + Math.random() * 0.1);
        nBrights.push(0.8 + Math.random() * 0.2);
      }
    }

    const rungMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ee77) }, uOpacity: { value: 0.6 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rPos), 3));
    rGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(rSizes), 1));
    rGeo.setAttribute('aBright', new THREE.BufferAttribute(new Float32Array(rBrights), 1));
    dnaGroup.add(new THREE.Points(rGeo, rungMat));

    const nodeMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x33ffdd) }, uOpacity: { value: 1.2 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nPos), 3));
    nGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(nSizes), 1));
    nGeo.setAttribute('aBright', new THREE.BufferAttribute(new Float32Array(nBrights), 1));
    dnaGroup.add(new THREE.Points(nGeo, nodeMat));
  });

  // Step 3: floating particles around helix + flying animated stars
  buildQueue.push(() => {
    // Surrounding particle mist
    const P_COUNT = mob ? 800 : 4000;
    const pPos = [], pSizes = [], pBrights = [];
    for (let i = 0; i < P_COUNT; i++) {
      const t = Math.random(), angle = Math.random() * Math.PI * 2;
      const y = (t - 0.5) * HEIGHT, r = RADIUS + (Math.random() - 0.5) * 6;
      pPos.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
      pSizes.push(0.03 + Math.random() * 0.06);
      pBrights.push(0.2 + Math.random() * 0.5);
    }
    const mistMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ff99) }, uOpacity: { value: 0.4 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pPos), 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(pSizes), 1));
    pGeo.setAttribute('aBright', new THREE.BufferAttribute(new Float32Array(pBrights), 1));
    dnaGroup.add(new THREE.Points(pGeo, mistMat));

    // Flying animated stars — these orbit and twinkle
    const S_COUNT = mob ? 1500 : 5000;
    const sPos = new Float32Array(S_COUNT * 3);
    const sSizes = new Float32Array(S_COUNT);
    const sSpeeds = new Float32Array(S_COUNT);
    const sPhases = new Float32Array(S_COUNT);
    for (let i = 0; i < S_COUNT; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 15 + Math.random() * 50;
      sPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      sPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      sPos[i * 3 + 2] = r * Math.cos(ph);
      sSizes[i] = 0.04 + Math.random() * 0.12;
      sSpeeds[i] = 0.02 + Math.random() * 0.08;
      sPhases[i] = Math.random() * Math.PI * 2;
    }
    const starMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x88ffcc) }, uTime: { value: 0 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    ctx.starMat = starMat;
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('aSize', new THREE.BufferAttribute(sSizes, 1));
    sGeo.setAttribute('aSpeed', new THREE.BufferAttribute(sSpeeds, 1));
    sGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhases, 1));
    scene.add(new THREE.Points(sGeo, starMat));
  });

  return { scene, camera, renderer, composer, keyLight, fillLight, rimLight, shadowLight, cameraPath, dnaGroup, nebulaMat, buildQueue, ctx };
}

/* ═══════════════════════════════════════════════════
   Ticker Data
   ═══════════════════════════════════════════════════ */
const TICKER1 = ['AI Insights', 'BPC-157', 'HRV Tracking', 'Sleep Analysis', 'Protocol Builder', 'Dose Schedules', 'TB-500', 'Biometric Data', 'Stack Optimizer', 'Smart Alerts', 'Semax', 'Progress Charts'];
const TICKER2 = ['Growth Hormone', 'CJC-1295', 'Recovery Metrics', 'Peptide Logs', 'Custom Protocols', 'IGF-1 Tracking', 'Daily Reports', 'PT-141', 'AOD-9604', 'Ipamorelin', 'DSIP', 'Epitalon'];
const ACCENTS = new Set(['AI Insights', 'Stack Optimizer', 'Custom Protocols', 'IGF-1 Tracking']);

/* ═══════════════════════════════════════════════════
   Stats
   ═══════════════════════════════════════════════════ */
const STATS = [
  { end: 1000, suffix: '+', label: 'Clinical studies referenced' },
  { end: 50, suffix: '+', label: 'Peptides cataloged' },
  { end: 12, suffix: '+', label: 'Biomarkers tracked' },
];

function AnimatedNum({ end, suffix, decimal, star, trigger }) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!trigger || ran.current) return;
    ran.current = true;
    const dur = 1800, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      setVal((1 - Math.pow(1 - p, 3)) * end);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }, [trigger, end]);
  return (
    <span className="cine-stat-num">
      {decimal ? val.toFixed(1) : Math.round(val)}{suffix}
      {star && <span className="cine-stat-star">★</span>}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   Research Cards Data
   ═══════════════════════════════════════════════════ */
const RESEARCH = [
  {
    title: 'Peptide Database',
    desc: '50+ peptides cataloged with dosing protocols, half-lives, and synergy data sourced from peer-reviewed literature.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.14A1 1 0 0 0 5.598 22h12.804a1 1 0 0 0 .879-1.86l-5.07-9.716A2 2 0 0 1 14 9.527V2" />
        <path d="M8.5 2h7" /><path d="M7 16.5h10" />
      </svg>
    ),
  },
  {
    title: 'Biometric Integration',
    desc: 'Real-time HRV, sleep quality, and recovery data synced from Apple Health, Oura Ring, and compatible wearables.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'AI Analysis Engine',
    desc: 'Machine learning models analyze your protocol outcomes to surface personalized, data-backed optimization insights.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function CinematicPage() {
  const canvasRef = useRef(null);
  const spacerRef = useRef(null);
  const panelsRef = useRef([]);
  const heroRef = useRef(null);

  // Waitlist state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [joinCount, setJoinCount] = useState(0);

  // InView refs for content sections
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const researchRef = useRef(null);
  const researchInView = useInView(researchRef, { once: true, margin: '-80px' });
  const showcaseRef = useRef(null);
  const showcaseInView = useInView(showcaseRef, { once: true, margin: '-80px' });

  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist/count`)
      .then(r => r.json())
      .then(d => { if (d.count != null) setWaitlistCount(d.count); })
      .catch(() => {});
  }, [joinCount]);

  const handleSubmit = useCallback(async (e) => {
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
        setEmail(''); setPhone('');
        setJoinCount(c => c + 1);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again.');
    }
  }, [email, phone]);

  // ── Three.js (desktop only) + scroll-driven panels (always) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let fid, onScroll, onResize, renderer;
    let cancelled = false;
    const mob = innerWidth < 780;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Scroll tracking (runs on all devices) ──
    let current = 0, target = 0;
    onScroll = () => {
      const spacer = spacerRef.current;
      if (!spacer) return;
      const spacerBottom = spacer.offsetTop + spacer.offsetHeight;
      const scrollable = spacerBottom - innerHeight;
      target = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const milestones = [0.10, 0.30, 0.50, 0.72];
    const panels = panelsRef.current;

    function updatePanels(p) {
      for (let i = 0; i < panels.length; i++) {
        const el = panels[i];
        if (!el) continue;
        const start = milestones[i];
        const end = milestones[i + 1] || 0.94;
        el.classList.toggle('visible', p >= start && p < end);
      }
    }

    function updateHero(p) {
      const hero = heroRef.current;
      if (!hero) return;
      const o = Math.max(0, 1 - p * 7);
      hero.style.opacity = o;
      hero.style.pointerEvents = o > 0.1 ? 'auto' : 'none';
    }

    // ── Mobile: run scroll loop immediately, defer Three.js to background ──
    // ── Desktop: load Three.js right away ──
    let lightFid;
    if (mob) {
      // Lightweight loop so panels + hero work instantly while Three.js downloads
      function lightLoop() {
        lightFid = requestAnimationFrame(lightLoop);
        if (reducedMotion) current = 0;
        else current += (target - current) * 0.06;
        const t = Math.max(0, Math.min(1, current));
        updatePanels(t);
        updateHero(t);
      }
      lightLoop();
    }

    // Defer Three.js import on mobile so first paint is instant
    const deferMs = mob ? 1500 : 0;
    const deferTimer = setTimeout(() => {
      if (cancelled) return;

      const imports = mob
        ? [import('three')]
        : [
            import('three'),
            import('three/examples/jsm/postprocessing/EffectComposer.js'),
            import('three/examples/jsm/postprocessing/RenderPass.js'),
            import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
          ];

      Promise.all(imports).then(([THREE, ...postMods]) => {
        if (cancelled) return;

        // Kill the lightweight scroll loop — the full animate loop takes over
        if (lightFid) { cancelAnimationFrame(lightFid); lightFid = null; }

        const postFx = mob ? null : {
          EffectComposer: postMods[0].EffectComposer,
          RenderPass: postMods[1].RenderPass,
          UnrealBloomPass: postMods[2].UnrealBloomPass,
        };

        const { scene, camera, renderer: r, composer, keyLight, fillLight, rimLight, shadowLight, cameraPath, dnaGroup, nebulaMat, buildQueue, ctx: sceneCtx } =
          createScene(canvas, THREE, postFx);
        renderer = r;

        // Fade canvas in on mobile after scene is ready
        if (mob) {
          canvas.style.opacity = '0';
          canvas.style.transition = 'opacity 0.8s ease';
          requestAnimationFrame(() => { canvas.style.opacity = '1'; });
        }

        onResize = () => {
          camera.aspect = innerWidth / innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(innerWidth, innerHeight);
          if (composer) composer.setSize(innerWidth, innerHeight);
        };
        addEventListener('resize', onResize);

        const lookAt = new THREE.Vector3();
        const lerpSpeed = mob ? 0.08 : 0.055;

        function animate() {
          fid = requestAnimationFrame(animate);

          if (buildQueue.length > 0) buildQueue.shift()();

          if (reducedMotion) current = 0;
          else current += (target - current) * lerpSpeed;

          const t = Math.max(0, Math.min(1, current));
          const now = performance.now() * 0.001;

          camera.position.copy(cameraPath.getPoint(t));
          lookAt.set(0, t * -15, 0);
          camera.lookAt(lookAt);

          keyLight.position.copy(camera.position).multiplyScalar(0.8);
          keyLight.intensity = 2.0 + Math.sin(now * 0.4) * 0.4;
          fillLight.intensity = 1.0 + Math.sin(now * 0.25 + 1) * 0.2;
          rimLight.intensity = 0.8 + Math.sin(now * 0.55 + 2) * 0.15;

          // Smooth organic rotation
          dnaGroup.rotation.y = now * 0.025;
          nebulaMat.uniforms.uTime.value = now;

          // Animate flying stars
          if (sceneCtx.starMat) sceneCtx.starMat.uniforms.uTime.value = now;

          updatePanels(t);
          updateHero(t);

          if (composer) composer.render();
          else renderer.render(scene, camera);
        }
        animate();
      });
    }, deferMs);

    return () => {
      cancelled = true;
      clearTimeout(deferTimer);
      if (lightFid) cancelAnimationFrame(lightFid);
      if (fid) cancelAnimationFrame(fid);
      if (onScroll) removeEventListener('scroll', onScroll);
      if (onResize) removeEventListener('resize', onResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <main className="cinematic-world">
      {/* ═══ PHASE 1: Cinematic DNA Scroll ═══ */}

      <div className="cinematic-scroll-spacer" ref={spacerRef}>
        <div id="top" style={{ position: 'absolute', top: 0 }} />
        <div id="features" style={{ position: 'absolute', top: '10%' }} />
      </div>

      <div className="cinematic-canvas-wrap">
        <canvas ref={canvasRef} />
        <div className="cinematic-noise" />
      </div>

      {/* ── Hero Overlay ── */}
      <div className="cinematic-hero" ref={heroRef}>
        <div className="hero-badge">AI-Powered Peptide Tracking</div>
        <h1 className="hero-headline">
          <span className="hw" style={{ animationDelay: '0.2s' }}>Optimize</span>{' '}
          <span className="hw" style={{ animationDelay: '0.35s' }}>Your</span>
          <br />
          <span className="hw accent" style={{ animationDelay: '0.5s' }}>Peptide</span>{' '}
          <span className="hw accent" style={{ animationDelay: '0.65s' }}>Stack</span>
        </h1>
        <p className="hero-sub">
          Build protocols, track doses, and let AI surface the insights
          that show exactly how your stack is performing.
        </p>
        <div className="hero-scroll-cue">
          <span>Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>

      {/* ── Panel 1: Build ── */}
      <div className="cinematic-panel" ref={el => (panelsRef.current[0] = el)}>
        <span className="panel-step">01</span>
        <h2>Build your peptide stack</h2>
        <p>Design personalized protocols with precise dosing schedules. BPC-157, TB-500, Semax — all tracked in one place.</p>
        <img className="panel-preview" src="/assets/screen1.png" alt="Stack tracking" loading="lazy" />
      </div>

      {/* ── Panel 2: Monitor ── */}
      <div className="cinematic-panel" ref={el => (panelsRef.current[1] = el)}>
        <span className="panel-step">02</span>
        <h2>Monitor your optimization</h2>
        <p>Watch HRV trends, sleep quality, and recovery metrics evolve as your protocol progresses.</p>
        <img className="panel-preview" src="/assets/screen2.png" alt="Dashboard" loading="lazy" />
      </div>

      {/* ── Panel 3: Insights ── */}
      <div className="cinematic-panel" ref={el => (panelsRef.current[2] = el)}>
        <span className="panel-step">03</span>
        <h2>AI-powered insights</h2>
        <p>Get personalized analysis showing exactly how your stack performs — backed entirely by your own biometric data.</p>
        <img className="panel-preview" src="/assets/screen3.png" alt="AI Insights" loading="lazy" />
      </div>

      {/* ── Panel 4: Quick CTA ── */}
      <div className="cinematic-panel cinematic-panel-cta" ref={el => (panelsRef.current[3] = el)}>
        <span className="panel-step">04</span>
        <h2>Your biology is your data.</h2>
        <p>Be first in line when we launch.</p>
        <a className="panel-cta-btn" href="#waitlist">Join the Waitlist</a>
      </div>

      {/* ═══ PHASE 2: Rich Content (normal scroll) ═══ */}
      <div className="content-below">

        {/* ── Feature Ticker ── */}
        <div className="cine-ticker-wrap">
          <div className="cine-ticker-fade cine-ticker-fade-left" />
          <div className="cine-ticker-fade cine-ticker-fade-right" />
          <div className="cine-ticker-row">
            <div className="cine-ticker-track cine-ticker-left">
              {[...TICKER1, ...TICKER1].map((tag, i) => (
                <span key={i} className={`cine-ticker-tag${ACCENTS.has(tag) ? ' cine-ticker-accent' : ''}`}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="cine-ticker-row">
            <div className="cine-ticker-track cine-ticker-right">
              {[...TICKER2, ...TICKER2].map((tag, i) => (
                <span key={i} className={`cine-ticker-tag${ACCENTS.has(tag) ? ' cine-ticker-accent' : ''}`}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── App Showcase ── */}
        <section className="cine-showcase" ref={showcaseRef}>
          <div className="cine-section-header">
            <div className="cine-eyebrow">See It In Action</div>
            <h2>Track every metric. <span className="accent">See real results.</span></h2>
          </div>
          <motion.div
            className="cine-showcase-screens"
            initial={{ opacity: 0, y: 40 }}
            animate={showcaseInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="cine-phone">
              <img src="/assets/screen1.png" alt="Stack screen" loading="lazy" />
            </div>
            <div className="cine-phone cine-phone-center">
              <img src="/assets/screen2.png" alt="Dashboard screen" loading="lazy" />
            </div>
            <div className="cine-phone">
              <img src="/assets/screen3.png" alt="Insights screen" loading="lazy" />
            </div>
          </motion.div>
        </section>

        {/* ── Stats ── */}
        <section className="cine-stats" ref={statsRef}>
          <div className="cine-section-header">
            <div className="cine-eyebrow">By The Numbers</div>
            <h2>Grounded in <span className="accent">real research.</span></h2>
          </div>
          <div className="cine-stats-grid">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                className="cine-stat-card"
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatedNum end={s.end} suffix={s.suffix} decimal={s.decimal} star={s.star} trigger={statsInView} />
                <div className="cine-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Research / Science ── */}
        <section className="cine-research" ref={researchRef}>
          <div className="cine-section-header">
            <div className="cine-eyebrow">Backed By Science</div>
            <h2>Research-grade <span className="accent">protocol intelligence.</span></h2>
            <p className="cine-section-sub">Every recommendation is grounded in peer-reviewed literature and your own biometric data — never guesswork.</p>
          </div>
          <div className="cine-research-grid">
            {RESEARCH.map((item, i) => (
              <motion.div
                key={i}
                className="cine-research-card"
                initial={{ opacity: 0, y: 30 }}
                animate={researchInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cine-research-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Final CTA / Waitlist ── */}
        <section className="cine-final" id="waitlist">
          <div className="cine-final-glow" />
          <div className="cine-final-inner">
            <div className="cine-eyebrow">Launching Soon</div>
            <h2>The smarter way to run your <span className="accent">protocol.</span></h2>
            <p>Peptide AI combines protocol management, biometric tracking, and AI insights in one clean app. Join the waitlist to be first in.</p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="ok"
                  className="cine-final-success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="cine-final-check">
                    <motion.svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <motion.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                      <motion.polyline points="22 4 12 14.01 9 11.01" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
                    </motion.svg>
                  </div>
                  <p>{message}</p>
                </motion.div>
              ) : (
                <motion.form key="form" className="cine-final-form" onSubmit={handleSubmit} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <input className="cine-final-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'} />
                  <input className="cine-final-input" type="tel" placeholder="Phone (optional — for SMS)" value={phone} onChange={e => setPhone(e.target.value)} disabled={status === 'loading'} />
                  <button className="cine-final-btn" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {status === 'error' && <p className="cine-final-error">{message}</p>}

            {waitlistCount > 0 && (
              <div className="cine-final-proof">
                Join <strong>{Math.max(500, waitlistCount).toLocaleString()}+</strong> on the waitlist
              </div>
            )}

            <div className="cine-social-links">
              <a href="https://www.tiktok.com/@peptideai.co" target="_blank" rel="noopener" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V6.93a4.85 4.85 0 0 1-1.01-.24z" /></svg>
              </a>
              <a href="https://www.instagram.com/peptideai.co" target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="https://twitter.com/PeptideAI" target="_blank" rel="noopener" aria-label="Twitter / X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.734-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
              </a>
            </div>

            <a className="cine-backtop" href="#top">↑ Back to top</a>
          </div>
        </section>
      </div>
    </main>
  );
}
