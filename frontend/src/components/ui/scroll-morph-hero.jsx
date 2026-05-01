"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

// --- FlipCard Component ---
const IMG_WIDTH = 140;
const IMG_HEIGHT = 280;

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
                stiffness: 22,
                damping: 14,
                mass: 1.2,
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
                {/* Front Face */}
                <div
                    style={{
                        backfaceVisibility: "hidden",
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: 20,
                        background: '#0a0a0a',
                        border: '2px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6), 0 0 40px -10px rgba(45,216,132,0.15)',
                    }}
                >
                    <img
                        src={src}
                        alt={`screen-${index}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                    />
                </div>

                {/* Back Face */}
                <div
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: 20,
                        background: '#111',
                        border: '2px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: '#2dd884', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>View</p>
                        <p style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Details</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
// Only 4 cards — one per actual app screen
const TOTAL_IMAGES = 4;
const MAX_SCROLL = 2000; // Shorter scroll range for gentler motion

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

    // --- Container Size ---
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    // --- Tie animation to actual page scroll (non-trapping) ---
    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const currentScroll = window.scrollY;
            // Gentle mapping — slow progression
            const mappedScroll = Math.min(Math.max(currentScroll * 1.2, 0), MAX_SCROLL);
            scrollRef.current = mappedScroll;
            virtualScroll.set(mappedScroll);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [virtualScroll]);

    // 1. Morph: Circle → gentle arc (slower range)
    const morphProgress = useTransform(virtualScroll, [0, 800], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 25, damping: 18 });

    // 2. Slow rotation / shuffle after morph
    const scrollRotate = useTransform(virtualScroll, [800, MAX_SCROLL], [0, 120]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 20, damping: 18 });

    // --- Mouse Parallax (subtle) ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 20, damping: 18 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 40); // reduced from 100
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence (slower) ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 800);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 3000);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- Random Scatter Positions (smaller range for fewer cards) ---
    const scatterPositions = useMemo(() => {
        return IMAGES.map(() => ({
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 400,
            rotation: (Math.random() - 0.5) * 60,
            scale: 0.6,
            opacity: 0,
        }));
    }, []);

    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    return (
        <div
            ref={containerRef}
            style={{
                height: 700,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 10,
                marginTop: '-3rem',
            }}
        >
            <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                {/* Main Container */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', pointerEvents: 'auto' }}>
                    {IMAGES.map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            // 4 cards in a neat line, nicely spaced
                            const lineSpacing = 170;
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2 + lineSpacing / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            // Circle → arc morph
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            // Circle positions — tight circle for 4 cards
                            const circleRadius = Math.min(minDimension * 0.25, 200);
                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            // Gentle arc — cards spread across bottom in a soft curve
                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.2 : 0.9);
                            const arcApexY = containerSize.height * (isMobile ? 0.3 : 0.2);
                            const arcCenterY = arcApexY + arcRadius;
                            const spreadAngle = isMobile ? 60 : 80; // Narrower spread for 4 cards
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            // Gentle scroll rotation
                            const scrollProgress = Math.min(Math.max(rotateValue / 120, 0), 1);
                            const maxRotation = spreadAngle * 0.4;
                            const boundedRotation = -scrollProgress * maxRotation;
                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.2 : 1.5,
                            };

                            // Morph interpolation
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
