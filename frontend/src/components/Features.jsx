import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Build your peptide stack',
    desc: 'Design personalized protocols with precise dosing schedules. BPC-157, TB-500, Semax and more — all tracked in one place.',
    image: '/assets/screen1.png',
  },
  {
    num: '02',
    title: 'Monitor your optimization',
    desc: 'Watch HRV trends, sleep quality, and recovery metrics evolve as your protocol progresses. The data tells the full story.',
    image: '/assets/screen2.png',
  },
  {
    num: '03',
    title: 'AI-powered insights',
    desc: 'Get personalized analysis showing exactly how your stack is performing — backed entirely by your own biometric data.',
    image: '/assets/screen3.png',
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef([]);
  const imgRef = useRef(null);
  const currentRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = stepRefs.current.indexOf(entry.target);
          if (idx === -1 || idx === currentRef.current) continue;
          currentRef.current = idx;
          setActiveIndex(idx);
          if (imgRef.current) {
            imgRef.current.style.opacity = '0';
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              if (imgRef.current) {
                imgRef.current.src = STEPS[idx].image;
                imgRef.current.style.opacity = '1';
              }
            }, 200);
          }
        }
      },
      { root: null, rootMargin: '-35% 0px -35% 0px', threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="features" id="features">
      <div className="features-sticky">
        <div className="phone-frame">
          <div className="phone-screen">
            <img
              ref={imgRef}
              src={STEPS[0].image}
              alt="App screenshot"
              className="phone-img"
            />
            <div className="phone-overlay" />
          </div>
          <div className="dots">
            {STEPS.map((_, i) => (
              <span key={i} className={i === activeIndex ? 'dot is-active' : 'dot'} />
            ))}
          </div>
        </div>
      </div>

      <div className="story-sections">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={i === activeIndex ? 'step is-active' : 'step'}
            ref={(el) => (stepRefs.current[i] = el)}
          >
            <div className="step-number">{step.num}</div>
            <h2>{step.title}</h2>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
