"use client";

import React, { useState, useEffect } from "react";
import { LayoutGroup, motion, useAnimate } from "framer-motion";

/* ─── Phone Dimensions ─── */
const PHONE_W = 190;
const PHONE_H = 390;
const BEZEL = 6;
const OUTER_R = 46;
const INNER_R = 40;

/* ─── Screenshot Data ─── */
const ORBIT_ITEMS = [
  { id: 1, name: "Dashboard", src: "/assets/screen-dashboard.png" },
  { id: 2, name: "Track", src: "/assets/screen-track.png" },
  { id: 3, name: "Stack", src: "/assets/screen-stack.png" },
  { id: 4, name: "Injection Sites", src: "/assets/screen-injection-sites.png" },
];

/* ─── Animation Config ─── */
const springTransition = {
  stiffness: 300,
  damping: 35,
  type: "spring",
  restSpeed: 0.01,
  restDelta: 0.01,
};

const spinConfig = {
  duration: 30,
  ease: "linear",
  repeat: Infinity,
};

/* ─── Helpers ─── */
const qsa = (root, sel) => Array.from(root.querySelectorAll(sel));
const angleOf = (el) => Number(el.dataset.angle || 0);
const armOfPhone = (phone) => phone.closest("[data-arm]");

/* ─── Realistic iPhone Frame ─── */
function PhoneFrame({ src, name }) {
  return (
    <div style={{ width: PHONE_W, height: PHONE_H, position: "relative" }}>
      {/* Titanium bezel */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: OUTER_R,
        background: "linear-gradient(145deg, #4a4a4c 0%, #2c2c2e 25%, #1a1a1c 50%, #2c2c2e 75%, #3a3a3c 100%)",
        boxShadow: `
          0 0 0 0.5px rgba(255,255,255,0.12),
          inset 0 0.5px 0 rgba(255,255,255,0.1),
          0 25px 50px -12px rgba(0,0,0,0.6),
          0 0 20px rgba(45,216,132,0.04)
        `,
        padding: BEZEL,
      }}>
        {/* Screen */}
        <div style={{
          width: "100%", height: "100%",
          borderRadius: INNER_R, overflow: "hidden",
          position: "relative", background: "#000",
        }}>
          {/* Dynamic Island */}
          <div style={{
            position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
            width: 76, height: 22, borderRadius: 14,
            background: "#000", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "radial-gradient(circle, #1a3a2a 20%, #0a0a0f 80%)",
              boxShadow: "0 0 3px rgba(0,200,100,0.15)",
            }} />
          </div>

          {/* Screenshot image */}
          <img
            src={src} alt={name} draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
          />

          {/* Glass highlight */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "30%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Home indicator */}
          <div style={{
            position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
            width: 76, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.15)",
          }} />
        </div>
      </div>

      {/* Top glint */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        borderRadius: OUTER_R,
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Radial Orbit Hero — phones orbit in a circle, counter-
   rotating so screens always face the viewer.
   ═══════════════════════════════════════════════════════════ */
export default function IntroAnimation() {
  const [scope, animate] = useAnimate();
  const step = 360 / ORBIT_ITEMS.length;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const stageSize = isMobile ? 360 : 700;
  const phoneScale = isMobile ? 0.7 : 1;

  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const arms = qsa(root, "[data-arm]");
    const phones = qsa(root, "[data-arm-phone]");
    const stops = [];
    const timers = [];

    /* Phase 1 — lift phones from center to orbit edge */
    timers.push(setTimeout(() => {
      animate(phones, { top: 0 }, springTransition);
    }, 250));

    /* Phase 2 — spread into angular positions */
    const seq = [
      ...arms.map((el) => [el, { rotate: angleOf(el) }, { ...springTransition, at: 0 }]),
      ...phones.map((p) => [
        p,
        { rotate: -angleOf(armOfPhone(p)), opacity: 1 },
        { ...springTransition, at: 0 },
      ]),
    ];
    timers.push(setTimeout(() => animate(seq), 700));

    /* Phase 3 — continuous slow spin (arms CW, phones CCW to stay upright) */
    timers.push(setTimeout(() => {
      arms.forEach((el) => {
        const a = angleOf(el);
        const c = animate(el, { rotate: [a, a + 360] }, spinConfig);
        stops.push(() => c.cancel());
      });
      phones.forEach((p) => {
        const a = armOfPhone(p) ? angleOf(armOfPhone(p)) : 0;
        const c = animate(p, { rotate: [-a, -a - 360] }, spinConfig);
        stops.push(() => c.cancel());
      });
    }, 1300));

    return () => {
      timers.forEach(clearTimeout);
      stops.forEach((s) => s());
    };
  }, [isMobile]);

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      width: "100%", height: stageSize + 60,
      position: "relative", overflow: "visible", zIndex: 5,
    }}>
      <LayoutGroup>
        <motion.div
          ref={scope}
          style={{ position: "relative", overflow: "visible", width: stageSize, height: stageSize }}
          initial={false}
        >
          {ORBIT_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              data-arm
              data-angle={i * step}
              style={{
                position: "absolute", inset: 0,
                willChange: "transform",
                zIndex: ORBIT_ITEMS.length - i,
              }}
              layoutId={`arm-${item.id}`}
            >
              <motion.div
                data-arm-phone
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  marginLeft: -(PHONE_W * phoneScale) / 2,
                  opacity: i === 0 ? 1 : 0,
                  transform: `scale(${phoneScale})`,
                  transformOrigin: "top center",
                }}
                layoutId={`arm-phone-${item.id}`}
              >
                <PhoneFrame src={item.src} name={item.name} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
