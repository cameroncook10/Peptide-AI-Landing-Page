"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: isMobile ? '50rem' : '70rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: isMobile ? '0.5rem' : '5rem',
      }}
    >
      <div
        style={{
          perspective: "1000px",
          width: '100%',
          position: 'relative',
          paddingTop: isMobile ? '2.5rem' : '10rem',
          paddingBottom: isMobile ? '2.5rem' : '10rem',
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <PhoneCard rotate={rotate} translate={translate} scale={scale} isMobile={isMobile}>
          {children}
        </PhoneCard>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const PhoneCard = ({
  rotate,
  scale,
  children,
  isMobile,
}) => {
  const phoneWidth = isMobile ? 260 : 320;
  const phoneHeight = isMobile ? 530 : 660;

  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        width: phoneWidth,
        height: phoneHeight,
        margin: '0 auto',
        marginTop: '-3rem',
        position: 'relative',
      }}
    >
      {/* Phone outer shell */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #1a1c1b, #000)',
          borderRadius: 42,
          padding: 6,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.08),
            0 60px 120px -30px rgba(0,0,0,0.7),
            0 30px 60px -15px rgba(45, 216, 132, 0.18)
          `,
          position: 'relative',
        }}
      >
        {/* Dynamic island / notch */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 22,
            background: '#000',
            borderRadius: 12,
            zIndex: 10,
          }}
        />

        {/* Screen content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 36,
            overflow: 'hidden',
            background: '#0a0a0a',
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

// Keep backward compat export
export const Card = PhoneCard;
