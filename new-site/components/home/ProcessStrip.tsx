'use client';

import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

/** Six stages on one ruled line: the line draws itself, then each stage lifts in turn. */
export default function ProcessStrip({ steps }: { steps: { t: string }[] }) {
  return (
    <motion.ol
      className="relative grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
    >
      <motion.span
        aria-hidden
        className="absolute left-0 right-0 top-0 hidden h-px origin-left bg-bronze/60 lg:block"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.8, ease } } }}
      />
      {steps.map((s, i) => (
        <motion.li
          key={s.t}
          className="relative flex flex-col gap-3 border-t hairline pt-6 pr-4 lg:border-t-0"
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 1, ease, delay: 0.3 + i * 0.12 } }
          }}
        >
          <span aria-hidden className="absolute -top-[3.5px] left-0 hidden h-[7px] w-[7px] rounded-full bg-bronze lg:block" />
          <span className="font-display text-5xl font-light text-bronze-soft">0{i + 1}</span>
          <span className="text-[15px] tracking-[0.02em]">{s.t}</span>
        </motion.li>
      ))}
    </motion.ol>
  );
}
