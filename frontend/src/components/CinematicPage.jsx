import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
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
  float t=uTime*0.03;
  float n1=fbm(vUv*3.0+vec2(t,t*0.7));
  float n2=fbm(vUv*2.5-vec2(t*0.5,t*0.3));
  float n3=fbm(vUv*4.0+vec2(-t*0.3,t*0.5));
  vec3 c=mix(vec3(0.02,0.03,0.07),vec3(0.0,0.05,0.04),n1*0.6);
  c=mix(c,vec3(0.04,0.015,0.06),n2*0.3);
  c+=vec3(0.0,n3*0.012,n3*0.008);
  gl_FragColor=vec4(c,1.0);
}`;

/* ═══════════════════════════════════════════════════
   High-Quality DNA Helix Scene
   ═══════════════════════════════════════════════════ */
function createScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const dpr = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x020308);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ── Nebula sky-dome ──
  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERT,
    fragmentShader: NEBULA_FRAG,
    uniforms: { uTime: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
  });
  const nebula = new THREE.Mesh(new THREE.SphereGeometry(90, 64, 32), nebulaMat);
  nebula.renderOrder = -1000;
  scene.add(nebula);

  // ── DNA Group ──
  const dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  const TURNS = 8, HEIGHT = 50, RADIUS = 2.8, SEGMENTS = 500;

  const pts1 = [], pts2 = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const a = t * Math.PI * 2 * TURNS;
    const y = (t - 0.5) * HEIGHT;
    pts1.push(new THREE.Vector3(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS));
    pts2.push(new THREE.Vector3(Math.cos(a + Math.PI) * RADIUS, y, Math.sin(a + Math.PI) * RADIUS));
  }

  const c1 = new THREE.CatmullRomCurve3(pts1);
  const c2 = new THREE.CatmullRomCurve3(pts2);

  // Backbone tubes (glossy physical material with clearcoat)
  const bbMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5a0,
    emissive: 0x00e5a0,
    emissiveIntensity: 0.5,
    metalness: 0.2,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const bb1 = new THREE.Mesh(new THREE.TubeGeometry(c1, SEGMENTS, 0.12, 16, false), bbMat);
  const bb2 = new THREE.Mesh(new THREE.TubeGeometry(c2, SEGMENTS, 0.12, 16, false), bbMat);
  bb1.castShadow = true; bb1.receiveShadow = true;
  bb2.castShadow = true; bb2.receiveShadow = true;
  dnaGroup.add(bb1, bb2);

  // Base-pair rungs + connection nodes
  const palette = [
    { c: 0x00e5a0, e: 0x00e5a0 },
    { c: 0x00B4D8, e: 0x00B4D8 },
  ];
  const RUNG_COUNT = 100;
  const nodeGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const glowGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < RUNG_COUNT; i++) {
    const t = i / RUNG_COUNT;
    const p1 = c1.getPoint(t), p2 = c2.getPoint(t);
    const dist = p1.distanceTo(p2);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const pal = palette[i % 2];

    const rung = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, dist, 8),
      new THREE.MeshStandardMaterial({
        color: 0x161b24, emissive: pal.e, emissiveIntensity: 0.12,
        metalness: 0.6, roughness: 0.3,
      }),
    );
    rung.position.copy(mid);
    rung.quaternion.setFromUnitVectors(up, dir);
    rung.castShadow = true; rung.receiveShadow = true;
    dnaGroup.add(rung);

    const nMat = new THREE.MeshPhysicalMaterial({
      color: pal.c, emissive: pal.e, emissiveIntensity: 0.9,
      metalness: 0.1, roughness: 0.12,
      clearcoat: 0.6, clearcoatRoughness: 0.2,
    });
    const n1 = new THREE.Mesh(nodeGeo, nMat); n1.position.copy(p1); n1.castShadow = true; dnaGroup.add(n1);
    const n2 = new THREE.Mesh(nodeGeo, nMat); n2.position.copy(p2); n2.castShadow = true; dnaGroup.add(n2);

    // Glow halos (every 3rd rung)
    if (i % 3 === 0) {
      const gMat = new THREE.MeshBasicMaterial({ color: pal.c, transparent: true, opacity: 0.1 });
      const g1 = new THREE.Mesh(glowGeo, gMat); g1.position.copy(p1); dnaGroup.add(g1);
      const g2 = new THREE.Mesh(glowGeo, gMat); g2.position.copy(p2); dnaGroup.add(g2);
    }
  }

  // ── Floating particles near DNA ──
  const P_COUNT = 600;
  const pPos = new Float32Array(P_COUNT * 3);
  for (let i = 0; i < P_COUNT; i++) {
    const t = Math.random(), angle = Math.random() * Math.PI * 2;
    const y = (t - 0.5) * HEIGHT, r = RADIUS + (Math.random() - 0.5) * 8;
    pPos[i * 3] = Math.cos(angle) * r;
    pPos[i * 3 + 1] = y;
    pPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  dnaGroup.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x00e5a0, size: 0.04, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending,
  })));

  // ── Star field ──
  const S_COUNT = 3000;
  const sPos = new Float32Array(S_COUNT * 3);
  for (let i = 0; i < S_COUNT; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = 25 + Math.random() * 40;
    sPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    sPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    sPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
    color: 0x8a94a9, size: 0.05, transparent: true, opacity: 0.6,
  })));

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0x0a0e18, 2));
  const keyLight = new THREE.PointLight(0x00e5a0, 4, 40);
  const fillLight = new THREE.PointLight(0x00B4D8, 2, 30);
  fillLight.position.set(-5, 0, -5);
  const rimLight = new THREE.PointLight(0x00e5a0, 1.5, 25);
  rimLight.position.set(0, -10, 5);
  scene.add(keyLight, fillLight, rimLight);

  // Shadow-casting directional light
  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.6);
  shadowLight.position.set(5, 10, 8);
  shadowLight.castShadow = true;
  shadowLight.shadow.mapSize.width = 1024;
  shadowLight.shadow.mapSize.height = 1024;
  shadowLight.shadow.camera.near = 0.1;
  shadowLight.shadow.camera.far = 80;
  shadowLight.shadow.camera.left = -10;
  shadowLight.shadow.camera.right = 10;
  shadowLight.shadow.camera.top = 30;
  shadowLight.shadow.camera.bottom = -30;
  shadowLight.shadow.bias = -0.002;
  shadowLight.shadow.radius = 4;
  scene.add(shadowLight);

  // ── Camera path (smoother, more keyframes) ──
  const mob = innerWidth < 780;
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

  // ── Bloom post-processing ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    0.4,   // strength — subtle but visible
    0.6,   // radius
    0.3,   // threshold — only bright emissives bloom
  );
  composer.addPass(bloomPass);

  return { scene, camera, renderer, composer, keyLight, fillLight, rimLight, shadowLight, cameraPath, dnaGroup, nebulaMat };
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

  // ── Three.js ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { scene, camera, renderer, composer, keyLight, fillLight, rimLight, shadowLight, cameraPath, dnaGroup, nebulaMat } =
      createScene(canvas);

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0, target = 0;

    function onScroll() {
      const spacer = spacerRef.current;
      if (!spacer) return;
      const spacerBottom = spacer.offsetTop + spacer.offsetHeight;
      const scrollable = spacerBottom - innerHeight;
      target = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
    }
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

    function onResize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
    }
    addEventListener('resize', onResize);

    const lookAt = new THREE.Vector3();
    let fid;

    function animate() {
      fid = requestAnimationFrame(animate);
      if (reducedMotion) current = 0;
      else current += (target - current) * 0.06;

      const t = Math.max(0, Math.min(1, current));
      const now = performance.now() * 0.001;

      // Camera
      camera.position.copy(cameraPath.getPoint(t));
      lookAt.set(0, t * -15, 0);
      camera.lookAt(lookAt);

      // Lights breathe
      keyLight.position.copy(camera.position).multiplyScalar(0.8);
      keyLight.intensity = 4 + Math.sin(now * 0.5) * 0.4;
      fillLight.intensity = 2 + Math.sin(now * 0.3 + 1) * 0.3;
      rimLight.intensity = 1.5 + Math.sin(now * 0.7 + 2) * 0.2;

      // Shadow light follows camera loosely
      shadowLight.position.set(
        camera.position.x + 5,
        camera.position.y + 6,
        camera.position.z + 4,
      );
      shadowLight.target.position.set(0, camera.position.y - 2, 0);
      shadowLight.target.updateMatrixWorld();

      // DNA subtle rotation
      dnaGroup.rotation.y = now * 0.015;

      // Nebula time
      nebulaMat.uniforms.uTime.value = now;

      updatePanels(t);
      updateHero(t);

      composer.render();
    }
    animate();

    return () => {
      cancelAnimationFrame(fid);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      renderer.dispose();
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
