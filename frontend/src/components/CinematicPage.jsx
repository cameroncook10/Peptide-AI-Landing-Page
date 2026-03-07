import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import './CinematicPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

/* ═══════════════════════════════════════════════════
   DNA Helix Three.js Scene
   ═══════════════════════════════════════════════════ */
function createScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x060810);

  // ── DNA Double Helix ──
  const TURNS = 6;
  const HEIGHT = 40;
  const RADIUS = 2.5;
  const SEGMENTS = 200;

  const points1 = [];
  const points2 = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const angle = t * Math.PI * 2 * TURNS;
    const y = (t - 0.5) * HEIGHT;
    points1.push(new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS));
    points2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS));
  }

  const curve1 = new THREE.CatmullRomCurve3(points1);
  const curve2 = new THREE.CatmullRomCurve3(points2);

  // Backbone tubes
  const backboneMat = new THREE.MeshStandardMaterial({
    color: 0x00e5a0,
    emissive: 0x00e5a0,
    emissiveIntensity: 0.5,
    metalness: 0.2,
    roughness: 0.3,
    transparent: true,
    opacity: 0.9,
  });

  scene.add(
    new THREE.Mesh(new THREE.TubeGeometry(curve1, SEGMENTS, 0.08, 8, false), backboneMat),
    new THREE.Mesh(new THREE.TubeGeometry(curve2, SEGMENTS, 0.08, 8, false), backboneMat)
  );

  // Rungs + Nodes
  const rungMat = new THREE.MeshStandardMaterial({
    color: 0x161b24,
    emissive: 0x00e5a0,
    emissiveIntensity: 0.08,
    metalness: 0.6,
    roughness: 0.4,
  });

  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0x00e5a0,
    emissive: 0x00e5a0,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.2,
  });

  const RUNG_COUNT = 60;
  const nodeGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const upVec = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < RUNG_COUNT; i++) {
    const t = i / RUNG_COUNT;
    const p1 = curve1.getPoint(t);
    const p2 = curve2.getPoint(t);

    const distance = p1.distanceTo(p2);
    const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(p2, p1).normalize();

    const rungGeo = new THREE.CylinderGeometry(0.03, 0.03, distance, 6, 1);
    const rung = new THREE.Mesh(rungGeo, rungMat);
    rung.position.copy(midpoint);
    rung.quaternion.setFromUnitVectors(upVec, direction);
    scene.add(rung);

    const n1 = new THREE.Mesh(nodeGeo, nodeMat);
    n1.position.copy(p1);
    scene.add(n1);

    const n2 = new THREE.Mesh(nodeGeo, nodeMat);
    n2.position.copy(p2);
    scene.add(n2);
  }

  // ── Star Field ──
  const STAR_COUNT = 2000;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 20 + Math.random() * 30;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0x7a8499, size: 0.04, transparent: true, opacity: 0.5 })
    )
  );

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0x060810, 1.5));

  const accentLight1 = new THREE.PointLight(0x00e5a0, 3, 30);
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(0x00e5a0, 1.5, 20);
  accentLight2.position.set(-3, 0, -3);
  scene.add(accentLight2);

  const fillLight = new THREE.PointLight(0x0f1318, 0.5, 50);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // ── Camera Path ──
  const isMobile = window.innerWidth < 780;
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 8, isMobile ? 30 : 25),  // zoomed out — full helix
    new THREE.Vector3(6, 4, isMobile ? 22 : 18),   // closing in, orbit right
    new THREE.Vector3(-4, 0, isMobile ? 14 : 10),   // orbiting left, mid-height
    new THREE.Vector3(3, -4, isMobile ? 7 : 5),     // very close, threading
    new THREE.Vector3(0, -8, isMobile ? 3 : 2),     // deep inside
    new THREE.Vector3(0, -12, isMobile ? 1 : 0.5),  // emerged, CTA
  ]);

  return { scene, camera, renderer, accentLight1, accentLight2, cameraPath };
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function CinematicPage() {
  const canvasRef = useRef(null);
  const panelsRef = useRef([]);
  const heroRef = useRef(null);

  // ── Waitlist State ──
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
        if (d.count != null) setWaitlistCount(d.count);
      })
      .catch(() => {});
  }, [joinCount]);

  const handleSubmit = useCallback(
    async (e) => {
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
    },
    [email, phone]
  );

  // ── Three.js Setup ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { scene, camera, renderer, accentLight1, accentLight2, cameraPath } =
      createScene(canvas);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll tracking
    let currentProgress = 0;
    let targetProgress = 0;

    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = max > 0 ? window.scrollY / max : 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Panel milestones
    const milestones = [0.15, 0.35, 0.55, 0.80];
    const panels = panelsRef.current;

    function updatePanels(progress) {
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        if (!panel) continue;
        const start = milestones[i];
        const end = milestones[i + 1] || 1.0;
        panel.classList.toggle('visible', progress >= start && progress < end);
      }
    }

    function updateHero(progress) {
      const hero = heroRef.current;
      if (!hero) return;
      const opacity = Math.max(0, 1 - progress * 5);
      hero.style.opacity = opacity;
      hero.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
    }

    // Resize
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // LookAt target reusable vector
    const lookTarget = new THREE.Vector3();

    // Animation loop
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);

      if (reducedMotion) {
        currentProgress = 0;
      } else {
        currentProgress += (targetProgress - currentProgress) * 0.06;
      }

      const t = Math.max(0, Math.min(1, currentProgress));

      // Camera position from path
      camera.position.copy(cameraPath.getPoint(t));
      lookTarget.set(0, t * -12, 0);
      camera.lookAt(lookTarget);

      // Accent lights follow camera loosely
      accentLight1.position.copy(camera.position).multiplyScalar(0.8);

      // Subtle light breathing
      const now = performance.now() * 0.001;
      accentLight1.intensity = 3 + Math.sin(now * 0.5) * 0.3;
      accentLight2.intensity = 1.5 + Math.sin(now * 0.3 + 1) * 0.2;

      // Update overlays
      updatePanels(t);
      updateHero(t);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <main className="cinematic-world">
      {/* ── Scroll spacer with anchor targets ── */}
      <div className="cinematic-scroll-spacer">
        <div id="top" style={{ position: 'absolute', top: 0 }} />
        <div id="features" style={{ position: 'absolute', top: '12.5%' }} />
        <div id="waitlist" style={{ position: 'absolute', top: '66.67%' }} />
      </div>

      {/* ── Three.js Canvas ── */}
      <div className="cinematic-canvas-wrap">
        <canvas ref={canvasRef} />
        <div className="cinematic-noise" />
      </div>

      {/* ── Hero Overlay ── */}
      <div className="cinematic-hero" ref={heroRef}>
        <div className="hero-badge">AI-Powered Peptide Tracking</div>
        <h1 className="hero-headline">
          Optimize Your
          <br />
          <span>Peptide Stack</span>
        </h1>
        <div className="hero-scroll-cue">Scroll to explore</div>
      </div>

      {/* ── Content Panel 1: Build ── */}
      <div className="cinematic-panel" ref={(el) => (panelsRef.current[0] = el)}>
        <span className="panel-step">01</span>
        <h2>Build your peptide stack</h2>
        <p>
          Design personalized protocols with precise dosing schedules. BPC-157,
          TB-500, Semax — all tracked in one place.
        </p>
      </div>

      {/* ── Content Panel 2: Monitor ── */}
      <div className="cinematic-panel" ref={(el) => (panelsRef.current[1] = el)}>
        <span className="panel-step">02</span>
        <h2>Monitor your optimization</h2>
        <p>
          Watch HRV trends, sleep quality, and recovery metrics evolve as your
          protocol progresses.
        </p>
      </div>

      {/* ── Content Panel 3: Insights ── */}
      <div className="cinematic-panel" ref={(el) => (panelsRef.current[2] = el)}>
        <span className="panel-step">03</span>
        <h2>AI-powered insights</h2>
        <p>
          Get personalized analysis showing exactly how your stack performs —
          backed entirely by your own biometric data.
        </p>
      </div>

      {/* ── Content Panel 4: CTA / Waitlist ── */}
      <div
        className="cinematic-panel cinematic-panel-cta"
        ref={(el) => (panelsRef.current[3] = el)}
      >
        <span className="panel-step">04</span>
        <h2>Your biology is your data.</h2>
        <p>Be first in line when we launch.</p>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="ok"
              className="panel-success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="panel-success-icon">
                <motion.svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <motion.path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.polyline
                    points="22 4 12 14.01 9 11.01"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  />
                </motion.svg>
              </div>
              <p>{message}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="panel-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <input
                className="panel-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
              <input
                className="panel-input"
                type="tel"
                placeholder="Phone (optional — for SMS)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={status === 'loading'}
              />
              <button
                className="panel-button"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Joining...' : 'Notify Me'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {status === 'error' && <p className="panel-error">{message}</p>}

        {waitlistCount > 0 && (
          <div className="panel-proof">
            Join{' '}
            <strong>
              {Math.max(500, waitlistCount).toLocaleString()}+
            </strong>{' '}
            on the waitlist
          </div>
        )}
      </div>
    </main>
  );
}
