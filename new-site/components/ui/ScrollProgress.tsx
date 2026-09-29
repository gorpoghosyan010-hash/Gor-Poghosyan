'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** A bronze hairline across the top of the viewport that fills as the page is read. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-bronze" style={{ scaleX }} />;
}
