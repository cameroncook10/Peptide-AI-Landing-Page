import { motion, useScroll, useSpring } from 'framer-motion';
import Nav from './components/Nav';
import Hero from './components/Hero';
import FeatureTicker from './components/FeatureTicker';
import AppShowcase from './components/AppShowcase';
import Features from './components/Features';
import Stats from './components/Stats';
import Waitlist from './components/Waitlist';
import Final from './components/Final';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
    />
  );
}

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <Hero />
      <FeatureTicker />
      <AppShowcase />
      <Features />
      <Stats />
      <Waitlist />
      <Final />
    </>
  );
}
