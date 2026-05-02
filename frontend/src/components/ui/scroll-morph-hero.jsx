"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

/* ─── Dimensions ──────────────────────────────────────── */
const PHONE_W = 280;
const PHONE_H = 570;
const BEZEL = 7;
const OUTER_R = 56;
const INNER_R = 48;

/* ─── DNA Helix SVG (matches Peptide AI branding) ───── */
function DnaHelix() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2C8 2 24 8 24 12C24 16 8 18 8 22C8 26 24 28 24 32C24 36 8 38 8 38" stroke="#2dd884" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M24 2C24 2 8 8 8 12C8 16 24 18 24 22C24 26 8 28 8 32C8 36 24 38 24 38" stroke="#2dd884" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="8" y1="12" x2="24" y2="12" stroke="#2dd884" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="8" y1="22" x2="24" y2="22" stroke="#2dd884" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="8" y1="32" x2="24" y2="32" stroke="#2dd884" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="12" y1="7" x2="20" y2="7" stroke="#2dd884" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <line x1="12" y1="17" x2="20" y2="17" stroke="#2dd884" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <line x1="12" y1="27" x2="20" y2="27" stroke="#2dd884" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <line x1="12" y1="37" x2="20" y2="37" stroke="#2dd884" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}

/* ─── Realistic iPhone ────────────────────────────────── */
function PhoneCard({ src, index, style: cardStyle }) {
  return (
    <motion.div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        transformStyle: "preserve-3d",
        perspective: 1200,
        flexShrink: 0,
        ...cardStyle,
      }}
    >
      <motion.div
        style={{ width: '100%', height: '100%', transformStyle: "preserve-3d", position: 'relative' }}
        transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 22 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* ──── FRONT ──── */}
        <div style={{
          backfaceVisibility: "hidden",
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: OUTER_R,
            background: 'linear-gradient(165deg, #2a2a2c 0%, #1a1a1c 30%, #0e0e0f 70%, #1f1f21 100%)',
            padding: BEZEL,
            position: 'relative',
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.12), inset 0 0.5px 0 rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 80px -20px rgba(45,216,132,0.08)',
          }}>
            {/* Side buttons */}
            <div style={{ position: 'absolute', left: -2.5, top: 80, width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)', boxShadow: '-1px 0 2px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', left: -2.5, top: 120, width: 3, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)', boxShadow: '-1px 0 2px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', left: -2.5, top: 172, width: 3, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)', boxShadow: '-1px 0 2px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', right: -2.5, top: 130, width: 3, height: 52, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a3c, #1a1a1c)', boxShadow: '1px 0 2px rgba(0,0,0,0.5)' }} />

            {/* Screen */}
            <div style={{ width: '100%', height: '100%', borderRadius: INNER_R, overflow: 'hidden', position: 'relative', background: '#000' }}>
              <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 72, height: 20, background: '#000', borderRadius: 14, zIndex: 10, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.04)' }}>
                <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: 'radial-gradient(circle, #1a2a3a 30%, #0a0a0f 60%, #000 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }} />
              </div>
              <img src={src} alt={`screen-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 100, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Top glint */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', borderRadius: OUTER_R }} />
          </div>
        </div>

        {/* ──── BACK — Peptide AI Logo ──── */}
        <div style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: OUTER_R,
            background: 'linear-gradient(165deg, #1a1c1b 0%, #0e0f0e 40%, #050706 100%)',
            position: 'relative',
            boxShadow: '0 0 0 0.5px rgba(255,255,255,0.12), inset 0 0.5px 0 rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            {/* Camera bump */}
            <div style={{ position: 'absolute', top: 14, left: 14, width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1a1a1c, #0e0e0f)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle, #1a2a3a 20%, #0a0a0f 60%, #000 100%)', boxShadow: '0 0 0 2px rgba(255,255,255,0.05), inset 0 0 4px rgba(0,200,100,0.2)' }} />
            </div>

            {/* Logo — DNA helix + Peptide AI */}
            <DnaHelix />
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <p style={{ fontSize: 26, fontWeight: 500, color: '#f2efe8', margin: 0, letterSpacing: '-0.03em', fontFamily: "'Fraunces', serif", lineHeight: 1.1 }}>
                Peptide <span style={{ color: '#2dd884' }}>AI</span>
              </p>
            </div>

            {/* Top glint */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', borderRadius: OUTER_R }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────── */
const IMAGES = [
  "/assets/screen-dashboard.png",
  "/assets/screen-track.png",
  "/assets/screen-stack.png",
  "/assets/screen-injection-sites.png",
];

export default function IntroAnimation() {
  const containerRef = useRef(null);

  // Very gentle scroll-based vertical parallax per card
  const scrollY = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  // Each card gets a slightly different parallax amount
  const p0 = useTransform(scrollY, [0, 1000], [0, -15]);
  const p1 = useTransform(scrollY, [0, 1000], [0, -30]);
  const p2 = useTransform(scrollY, [0, 1000], [0, -45]);
  const p3 = useTransform(scrollY, [0, 1000], [0, -25]);

  const sp0 = useSpring(p0, { stiffness: 30, damping: 30 });
  const sp1 = useSpring(p1, { stiffness: 30, damping: 30 });
  const sp2 = useSpring(p2, { stiffness: 30, damping: 30 });
  const sp3 = useSpring(p3, { stiffness: 30, damping: 30 });

  const parallaxValues = [sp0, sp1, sp2, sp3];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        position: 'relative',
        zIndex: 5,
        marginTop: 56,
        paddingBottom: 20,
      }}
    >
      {/* Clean horizontal line of phones */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          flexWrap: 'nowrap',
        }}
      >
        {IMAGES.map((src, i) => (
          <motion.div key={i} style={{ y: parallaxValues[i] }}>
            <PhoneCard src={src} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
