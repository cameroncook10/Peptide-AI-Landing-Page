const steps = Array.from(document.querySelectorAll(".step"));
const img = document.getElementById("storyImage");
const dotsWrap = document.getElementById("dots");
const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];

let currentIndex = 0;

function setActive(index) {
  if (index === currentIndex && img.src.includes(steps[index]?.dataset?.image)) return;
  currentIndex = index;

  steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

  const nextSrc = steps[index]?.dataset?.image;
  if (nextSrc) {
    img.style.opacity = "0";
    setTimeout(() => {
      img.src = nextSrc;
      img.style.opacity = "1";
    }, 180);
  }
}

const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = steps.indexOf(entry.target);
        if (idx !== currentIndex) setActive(idx);
      }
    });
  },
  { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
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
