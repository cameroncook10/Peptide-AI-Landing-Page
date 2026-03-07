import { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current.querySelector('.waitlist-inner').classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the waitlist!");
        setEmail('');
        setPhone('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again later.');
    }
  }

  return (
    <section className="waitlist" id="waitlist" ref={sectionRef}>
      <div className="waitlist-glow" />
      <div className="waitlist-inner reveal">
        <div className="eyebrow">Early Access</div>
        <h2>
          Be first in line<br />
          <span className="accent">when we launch.</span>
        </h2>
        <p>
          Get notified the moment Peptide AI drops on the App Store and Google Play.<br />
          Enter your email and phone for SMS alerts — no spam, ever.
        </p>

        {status === 'success' ? (
          <div className="waitlist-success-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>{message}</p>
          </div>
        ) : (
          <form className="waitlist-form" onSubmit={handleSubmit}>
            <div className="waitlist-fields">
              <input
                className="waitlist-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
              <input
                className="waitlist-input"
                type="tel"
                placeholder="Phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
            <button className="waitlist-btn" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Joining...' : 'Notify Me'}
            </button>
          </form>
        )}

        {status === 'error' && <p className="waitlist-status error">{message}</p>}
        <p className="waitlist-fine">We only send launch notifications. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
