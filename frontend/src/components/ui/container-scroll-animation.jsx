import { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const rotate   = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale    = useTransform(scrollYProgress, [0, 1], isMobile ? [0.75, 0.95] : [1.04, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div className="h-[52rem] md:h-[70rem] flex items-center justify-center relative p-2 md:p-16"
      ref={containerRef}>
      <div className="py-8 md:py-32 w-full relative" style={{ perspective: '1000px' }}>
        <motion.div style={{ translateY: translate }} className="max-w-4xl mx-auto text-center mb-0">
          {titleComponent}
        </motion.div>
        <motion.div
          style={{
            rotateX: rotate, scale,
            boxShadow: '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026',
          }}
          className="max-w-4xl -mt-8 mx-auto h-[28rem] md:h-[38rem] w-full
            border border-[rgba(0,229,160,0.12)] p-1.5 md:p-3
            bg-[#0a0d14] rounded-[28px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-[20px] bg-[#060810]">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
