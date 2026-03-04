const steps = Array.from(document.querySelectorAll(".step"));
const img = document.getElementById("storyImage");
const dotsWrap = document.getElementById("dots");
const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];

function setActive(index) {
  steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

  const nextSrc = steps[index]?.dataset?.image;
  if (nextSrc && img && img.src !== nextSrc) {
    img.style.opacity = "0";
    setTimeout(() => {
      img.src = nextSrc;
      img.style.opacity = "1";
    }, 180);
  }
}

const storyObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const idx = steps.indexOf(visible.target);
    if (idx >= 0) setActive(idx);
  },
  { root: null, threshold: [0.4, 0.6] }
);

steps.forEach(step => storyObserver.observe(step));
setActive(0);

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach(el => revealObserver.observe(el));

// Staggered stat reveals
const stats = document.querySelectorAll(".stat");
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 120);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
stats.forEach(stat => { stat.classList.add("reveal"); statObserver.observe(stat); });
