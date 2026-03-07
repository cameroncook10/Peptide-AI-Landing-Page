import { useEffect, useRef } from 'react';

const STATS = [
  { num: '10k+', label: 'Users on waitlist' },
  { num: '50+', label: 'Peptides tracked' },
  { num: '4.9★', label: 'App Store rating' },
];

export default function Stats() {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats">
      <div className="stats-inner">
        {STATS.map((s, i) => (
          <div key={i} className="stat reveal" ref={(el) => (refs.current[i] = el)}>
            <span className="stat-num">{s.num}</span>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
