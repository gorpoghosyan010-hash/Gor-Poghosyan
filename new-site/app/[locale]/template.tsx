'use client';

import { motion } from 'framer-motion';

const ease = [0.76, 0, 0.24, 1] as const;

// Every navigation: a bronze hairline sweeps across while a dark sheet lifts off the new page.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] origin-top bg-graphite"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.05 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-1/2 z-[81] h-px origin-left bg-bronze"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ scaleX: { duration: 0.7, ease }, opacity: { duration: 0.3, delay: 0.55 } }}
      />
      {/* Opacity only: a transform here would break GSAP pinning (position: fixed) inside pages. */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}>
        {children}
      </motion.div>
    </>
  );
}
