"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

/* ─── Realistic iPhone Frame ──────────────────────────────────────── */
const PHONE_W = 170;
const PHONE_H = 340;
const BEZEL = 5;
const OUTER_R = 44;
const INNER_R = 38;

function RealisticPhone({ src, index, target }) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 16,
        damping: 12,
        mass: 1.5,
      }}
      style={{
        position: "absolute",
        width: PHONE_W,
        height: PHONE_H,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
    >
      <motion.div
        style={{ width: '100%', height: '100%', transformStyle: "preserve-3d", position: 'relative' }}
        transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 22 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* ──── FRONT FACE ──── */}
        <div style={{
          backfaceVisibility: "hidden",
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        }}>
          {/* Titanium outer shell */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: OUTER_R,
            background: 'linear-gradient(165deg, #2a2a2c 0%, #1a1a1c 30%, #0e0e0f 70%, #1f1f21 100%)',
            padding: BEZEL,
            position: 'relative',
            boxShadow: `
              0 0 0 0.5px rgba(255,255,255,0.12),
              inset 0 0.5px 0 rgba(255,255,255,0.08),
              0 25px 50px -12px rgba(0,0,0,0.7),
              0 0 80px -20px rgba(45,216,132,0.08)
            `,
          }}>
            {/* Side buttons — left */}
            <div style={{
              position: 'absolute', left: -2.5, top: 80,
              width: 3, height: 28, borderRadius: 2,
              background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
            }} />
            <div style={{
              position: 'absolute', left: -2.5, top: 120,
              width: 3, height: 44, borderRadius: 2,
              background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
            }} />
            <div style={{
              position: 'absolute', left: -2.5, top: 172,
              width: 3, height: 44, borderRadius: 2,
              background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
            }} />
            {/* Side button — right (power) */}
            <div style={{
              position: 'absolute', right: -2.5, top: 130,
              width: 3, height: 52, borderRadius: 2,
              background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)',
              boxShadow: '1px 0 2px rgba(0,0,0,0.5)',
            }} />

            {/* Screen area */}
            <div style={{
              width: '100%', height: '100%',
              borderRadius: INNER_R,
              overflow: 'hidden',
              position: 'relative',
              background: '#000',
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                width: 72, height: 20, background: '#000',
                borderRadius: 14, zIndex: 10,
                boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.04)',
              }}>
                {/* Camera lens */}
                <div style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'radial-gradient(circle, #1a2a3a 30%, #0a0a0f 60%, #000 100%)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                }} />
              </div>

              {/* App screenshot */}
              <img
                src={src}
                alt={`screen-${index}`}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'top center',
                  display: 'block',
                }}
              />

              {/* Glass highlight — top edge reflection */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />

              {/* Home indicator */}
              <div style={{
                position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                width: 100, height: 4, borderRadius: 4,
                background: 'rgba(255,255,255,0.15)',
              }} />
            </div>

            {/* Frame highlight — top edge glint */}
            <div style={{
              position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              borderRadius: OUTER_R,
            }} />
          </div>
        </div>

        {/* ──── BACK FACE ──── */}
        <div style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: OUTER_R,
            background: 'linear-gradient(165deg, #2a2a2c 0%, #1a1a1c 30%, #0e0e0f 70%, #1f1f21 100%)',
            position: 'relative',
            boxShadow: `
              0 0 0 0.5px rgba(255,255,255,0.12),
              inset 0 0.5px 0 rgba(255,255,255,0.08),
              0 25px 50px -12px rgba(0,0,0,0.7)
            `,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            {/* Camera bump */}
            <div style={{
              position: 'absolute', top: 14, left: 14,
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #1a1a1c, #0e0e0f)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'radial-gradient(circle, #1a2a3a 20%, #0a0a0f 60%, #000 100%)',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.05), inset 0 0 4px rgba(0,200,100,0.2)',
              }} />
            </div>

            {/* Logo + branding */}
            <img
              src="/assets/app-icon.png"
              alt="Peptide AI"
              style={{ width: 56, height: 56, borderRadius: 14, marginTop: 20 }}
            />
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: 20, fontWeight: 600, color: '#f2efe8', margin: 0,
                letterSpacing: '-0.02em', fontFamily: "'Fraunces', serif",
              }}>Peptide AI</p>
              <p style={{
                fontSize: 10, color: '#2dd884', margin: '5px 0 0',
                textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500,
              }}>Stack Intelligence</p>
            </div>

            {/* Back frame highlight */}
            <div style={{
              position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              borderRadius: OUTER_R,
            }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Carousel ──────────────────────────────────────────── */
const TOTAL_IMAGES = 4;
const MAX_SCROLL = 1600;

const IMAGES = [
  "/assets/screen-dashboard.png",
  "/assets/screen-track.png",
  "/assets/screen-stack.png",
  "/assets/screen-injection-sites.png",
];

const lerp = (a, b, t) => a * (1 - t) + b * t;

export default function IntroAnimation() {
  const [introPhase, setIntroPhase] = useState("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setContainerSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    obs.observe(containerRef.current);
    setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    return () => obs.disconnect();
  }, []);

  const virtualScroll = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => virtualScroll.set(Math.min(Math.max(window.scrollY * 0.7, 0), MAX_SCROLL));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [virtualScroll]);

  const morphProgress = useTransform(virtualScroll, [0, 700], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 18, damping: 14 });

  const scrollRotate = useTransform(virtualScroll, [700, MAX_SCROLL], [0, 50]);
  const smoothRotate = useSpring(scrollRotate, { stiffness: 14, damping: 14 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 14, damping: 14 });

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onMove = (e) => {
      const r = c.getBoundingClientRect();
      mouseX.set(((e.clientX - r.left) / r.width * 2 - 1) * 20);
    };
    c.addEventListener("mousemove", onMove);
    return () => c.removeEventListener("mousemove", onMove);
  }, [mouseX]);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("line"), 500);
    const t2 = setTimeout(() => setIntroPhase("circle"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scatterPos = useMemo(() =>
    IMAGES.map(() => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 350,
      rotation: (Math.random() - 0.5) * 35,
      scale: 0.4, opacity: 0,
    })), []);

  const [mVal, setMVal] = useState(0);
  const [rVal, setRVal] = useState(0);
  const [pVal, setPVal] = useState(0);

  useEffect(() => {
    const u1 = smoothMorph.on("change", setMVal);
    const u2 = smoothRotate.on("change", setRVal);
    const u3 = smoothMouseX.on("change", setPVal);
    return () => { u1(); u2(); u3(); };
  }, [smoothMorph, smoothRotate, smoothMouseX]);

  return (
    <div
      ref={containerRef}
      style={{
        height: 520,
        width: '100%',
        position: 'relative',
        overflow: 'visible',
        zIndex: 5,
        marginTop: 48,
      }}
    >
      <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          {IMAGES.map((src, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
            const isMobile = containerSize.width < 768;

            if (introPhase === "scatter") {
              target = scatterPos[i];
            } else if (introPhase === "line") {
              const spacing = isMobile ? 140 : 200;
              const totalW = (TOTAL_IMAGES - 1) * spacing;
              target = { x: i * spacing - totalW / 2, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              // Circle
              const cR = isMobile ? 100 : 170;
              const cAngle = (i / TOTAL_IMAGES) * 360 - 90;
              const cRad = (cAngle * Math.PI) / 180;
              const cPos = { x: Math.cos(cRad) * cR, y: Math.sin(cRad) * cR, rotation: 0 };

              // Arc
              const aR = isMobile ? 350 : 550;
              const aCY = 340;
              const spread = isMobile ? 45 : 65;
              const startA = -90 - spread / 2;
              const step = spread / (TOTAL_IMAGES - 1);
              const sP = Math.min(Math.max(rVal / 50, 0), 1);
              const bR = -sP * spread * 0.25;
              const curA = startA + i * step + bR;
              const aRad = (curA * Math.PI) / 180;
              const aPos = {
                x: Math.cos(aRad) * aR + pVal,
                y: Math.sin(aRad) * aR + aCY,
                rotation: curA + 90,
                scale: isMobile ? 0.95 : 1.1,
              };

              target = {
                x: lerp(cPos.x, aPos.x, mVal),
                y: lerp(cPos.y, aPos.y, mVal),
                rotation: lerp(cPos.rotation, aPos.rotation, mVal),
                scale: lerp(1, aPos.scale, mVal),
                opacity: 1,
              };
            }

            return <RealisticPhone key={i} src={src} index={i} target={target} />;
          })}
        </div>
      </div>
    </div>
  );
}
