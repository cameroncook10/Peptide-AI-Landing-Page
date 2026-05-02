"use client";

import React, { useState, useEffect } from "react";
import { LayoutGroup, motion, useAnimate } from "framer-motion";

/* ─── Phone Dimensions ─── */
const PHONE_W = 220;
const PHONE_H = 450;
const BEZEL = 6;
const OUTER_R = 46;
const INNER_R = 40;
/* Push phones this far above the arm top so they orbit further from center */
const PHONE_MARGIN_TOP = -Math.round(PHONE_H * 0.28); // -126px → orbit radius ~380px desktop

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

/* ─── iPhone 16 Pro Frame ─── */
function PhoneFrame({ src, name }) {
  const diW = Math.round((PHONE_W - BEZEL * 2) * 0.33);
  const diH = Math.max(20, Math.round((PHONE_W - BEZEL * 2) * 0.09));

  return (
    <div style={{ width: PHONE_W, height: PHONE_H, position: "relative" }}>
      {/* Action button */}
      <div style={{
        position: "absolute", left: -3, top: Math.round(PHONE_H * 0.11),
        width: 3, height: Math.round(PHONE_H * 0.053), borderRadius: "2px 0 0 2px",
        background: "linear-gradient(to right, #1c1c1e, #141416)",
        boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.06)",
        zIndex: 2,
      }} />
      {/* Volume up */}
      <div style={{
        position: "absolute", left: -3, top: Math.round(PHONE_H * 0.19),
        width: 3, height: Math.round(PHONE_H * 0.098), borderRadius: "2px 0 0 2px",
        background: "linear-gradient(to right, #1c1c1e, #141416)",
        boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.06)",
        zIndex: 2,
      }} />
      {/* Volume down */}
      <div style={{
        position: "absolute", left: -3, top: Math.round(PHONE_H * 0.305),
        width: 3, height: Math.round(PHONE_H * 0.098), borderRadius: "2px 0 0 2px",
        background: "linear-gradient(to right, #1c1c1e, #141416)",
        boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.06)",
        zIndex: 2,
      }} />
      {/* Power button */}
      <div style={{
        position: "absolute", right: -3, top: Math.round(PHONE_H * 0.235),
        width: 3, height: Math.round(PHONE_H * 0.12), borderRadius: "0 2px 2px 0",
        background: "linear-gradient(to left, #1c1c1e, #141416)",
        boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.06)",
        zIndex: 2,
      }} />

      {/* Space Black chassis */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: OUTER_R,
        background: "linear-gradient(150deg, #1a1a1c 0%, #111113 8%, #0b0b0d 18%, #070709 32%, #09090b 48%, #0d0d0f 62%, #111113 76%, #161618 90%, #1c1c1e 100%)",
        boxShadow: [
          "inset 0 0 0 0.5px rgba(255,255,255,0.05)",
          "inset 0 1px 0 rgba(255,255,255,0.07)",
          "inset 0 -1px 0 rgba(0,0,0,0.8)",
          "0 0 0 0.5px rgba(0,0,0,0.95)",
          "0 20px 50px -12px rgba(0,0,0,0.85)",
          "0 0 30px -6px rgba(45,216,132,0.12)",
        ].join(", "),
        padding: BEZEL,
      }}>
        {/* OLED screen */}
        <div style={{
          width: "100%", height: "100%",
          borderRadius: INNER_R, overflow: "hidden",
          position: "relative", background: "#000",
          boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.04)",
        }}>
          {/* Dynamic Island */}
          <div style={{
            position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
            width: diW, height: diH, borderRadius: 999,
            background: "#000", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 7,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, #162030, #020202 70%)",
              border: "1px solid #141414",
            }} />
          </div>

          {/* Screenshot */}
          <img src={src} alt={name} draggable={false} style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "top center", display: "block",
          }} />

          {/* Home indicator */}
          <div style={{
            position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
            width: "32%", height: 3, borderRadius: 3,
            background: "rgba(255,255,255,0.18)",
          }} />

          {/* Glass sheen */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 25%, transparent 55%)",
          }} />
        </div>

        {/* Top chassis glint */}
        <div style={{
          position: "absolute", top: 0, left: "18%", right: "18%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
          borderRadius: OUTER_R, pointerEvents: "none",
        }} />
      </div>
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

  const stageSize = isMobile ? 560 : 980;
  const phoneScale = isMobile ? 0.65 : 1;

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
                  marginTop: PHONE_MARGIN_TOP,
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
