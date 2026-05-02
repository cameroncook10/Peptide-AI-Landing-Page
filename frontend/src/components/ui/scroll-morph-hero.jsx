"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

// --- FlipCard Component ---
const IMG_WIDTH = 160;
const IMG_HEIGHT = 320;

function FlipCard({ src, index, target }) {
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
                stiffness: 18,
                damping: 12,
                mass: 1.4,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                {/* Front Face — phone screen */}
                <div
                    style={{
                        backfaceVisibility: "hidden",
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        overflow: 'hidden',
                        borderRadius: 28,
                        background: 'linear-gradient(145deg, #1a1c1b, #000)',
                        padding: 4,
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px -15px rgba(0,0,0,0.6), 0 0 40px -10px rgba(45,216,132,0.12)',
                    }}
                >
                    {/* Notch */}
                    <div style={{
                        position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                        width: 50, height: 14, background: '#000', borderRadius: 10, zIndex: 5,
                    }} />
                    <img
                        src={src}
                        alt={`screen-${index}`}
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'top center',
                            display: 'block', borderRadius: 24,
                        }}
                    />
                </div>

                {/* Back Face — Peptide AI branding */}
                <div
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        overflow: 'hidden',
                        borderRadius: 28,
                        background: 'linear-gradient(160deg, #0d110f, #050706)',
                        border: '1px solid rgba(45,216,132,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                    }}
                >
                    <img
                        src="/assets/app-icon.png"
                        alt="Peptide AI"
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: '#f2efe8', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Fraunces', serif" }}>Peptide AI</p>
                        <p style={{ fontSize: 11, color: '#2dd884', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500 }}>Stack Intelligence</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 4;
const MAX_SCROLL = 1600;

const IMAGES = [
    "/assets/screen-dashboard.png",
    "/assets/screen-track.png",
    "/assets/screen-stack.png",
    "/assets/screen-injection-sites.png",
];

const lerp = (start, end, t) => start * (1 - t) + end * t;

export default function IntroAnimation() {
    const [introPhase, setIntroPhase] = useState("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = (entries) => {
            for (const entry of entries) {
                setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        };
        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
        return () => observer.disconnect();
    }, []);

    // Tie to actual page scroll
    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const mappedScroll = Math.min(Math.max(window.scrollY * 0.8, 0), MAX_SCROLL);
            scrollRef.current = mappedScroll;
            virtualScroll.set(mappedScroll);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, [virtualScroll]);

    // Gentle morph: line → arc
    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 20, damping: 16 });

    // Very slow shuffle after morph
    const scrollRotate = useTransform(virtualScroll, [600, MAX_SCROLL], [0, 60]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 16, damping: 16 });

    // Subtle mouse parallax
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 16, damping: 16 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 25);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // Intro: scatter → line → circle (gentle timing)
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 600);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2800);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // Scatter positions (tight, centered)
    const scatterPositions = useMemo(() => {
        return IMAGES.map(() => ({
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 300,
            rotation: (Math.random() - 0.5) * 40,
            scale: 0.5,
            opacity: 0,
        }));
    }, []);

    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const u1 = smoothMorph.on("change", setMorphValue);
        const u2 = smoothScrollRotate.on("change", setRotateValue);
        const u3 = smoothMouseX.on("change", setParallaxValue);
        return () => { u1(); u2(); u3(); };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    return (
        <div
            ref={containerRef}
            style={{
                height: 500,
                width: '100%',
                position: 'relative',
                overflow: 'visible',
                zIndex: 5,
                marginTop: 60,
            }}
        >
            <div style={{
                display: 'flex', height: '100%', width: '100%',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    position: 'relative', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '100%',
                }}>
                    {IMAGES.map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            // 4 cards in a neat centered line
                            const lineSpacing = 190;
                            const totalWidth = (TOTAL_IMAGES - 1) * lineSpacing;
                            const lineX = i * lineSpacing - totalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            // Circle → gentle arc morph
                            const isMobile = containerSize.width < 768;

                            // Circle
                            const circleRadius = isMobile ? 120 : 180;
                            const circleAngle = (i / TOTAL_IMAGES) * 360 - 90; // start from top
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: 0, // keep upright in circle
                            };

                            // Gentle arc — fan out into a soft bottom curve
                            const arcRadius = isMobile ? 400 : 600;
                            const arcCenterY = 350;
                            const spreadAngle = isMobile ? 50 : 70;
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            const scrollProgress = Math.min(Math.max(rotateValue / 60, 0), 1);
                            const boundedRotation = -scrollProgress * spreadAngle * 0.3;
                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.0 : 1.15,
                            };

                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(1, arcPos.scale, morphValue),
                                opacity: 1,
                            };
                        }

                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                target={target}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
