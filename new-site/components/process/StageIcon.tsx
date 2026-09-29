// Line drawings for the six process stages; drawn by animating stroke-dashoffset 1 → 0.
const p = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 } as const;

const icons: React.ReactNode[] = [
  // 01 Concept — a sketched roofline and an idea circle
  <>
    <path {...p} d="M12 70 Q30 40 50 34 T88 62" />
    <path {...p} d="M20 78 H84" />
    <circle {...p} cx="72" cy="24" r="10" />
    <path {...p} d="M28 64 L50 44 L72 64" />
  </>,
  // 02 Design — floor plan
  <>
    <rect {...p} x="14" y="16" width="72" height="68" />
    <path {...p} d="M14 48 H52 V84 M52 48 V16" />
    <path {...p} d="M60 48 H86" />
    <path {...p} d="M52 62 A10 10 0 0 1 42 72" />
    <path {...p} d="M24 26 H42 M64 26 H78" />
  </>,
  // 03 Engineering — beam on columns with loads
  <>
    <path {...p} d="M10 40 H90 M10 46 H90" />
    <path {...p} d="M22 46 V86 M78 46 V86 M16 86 H28 M72 86 H84" />
    <path {...p} d="M30 16 V34 M26 30 L30 34 L34 30 M50 16 V34 M46 30 L50 34 L54 30 M70 16 V34 M66 30 L70 34 L74 30" />
    <path {...p} d="M22 46 L50 70 L78 46" />
  </>,
  // 04 Construction — crane over a rising frame
  <>
    <path {...p} d="M22 88 V14 M22 14 H86 M22 24 L34 14 M86 14 V30" />
    <rect {...p} x="80" y="30" width="12" height="8" />
    <path {...p} d="M44 88 V56 H76 V88 M44 70 H76 M60 56 V88" />
    <path {...p} d="M10 88 H92" />
  </>,
  // 05 Interior — lamp, sofa, frame
  <>
    <path {...p} d="M18 70 V56 Q18 50 24 50 H76 Q82 50 82 56 V70 M18 70 H82 M22 70 V78 M78 70 V78" />
    <path {...p} d="M30 50 V42 H70 V50" />
    <path {...p} d="M50 10 V20 M40 30 L50 20 L60 30 Z" />
  </>,
  // 06 Completion — house with key
  <>
    <path {...p} d="M16 48 L50 20 L84 48 M24 42 V84 H76 V42" />
    <rect {...p} x="42" y="60" width="16" height="24" />
    <circle {...p} cx="72" cy="72" r="6" />
    <path {...p} d="M78 72 H92 M88 72 V78" />
  </>
];

export default function StageIcon({ index, className = '' }: { index: number; className?: string }) {
  return (
    <svg data-icon viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {icons[index]}
    </svg>
  );
}
