// A minimal architectural elevation of a modern villa, drawn with pathLength=1 so any
// parent can animate stroke-dashoffset from 1 to 0 to "draw" it.
export default function VillaElevation({ className = '', strokeWidth = 1 }: { className?: string; strokeWidth?: number }) {
  const common = { pathLength: 1 };
  return (
    <svg viewBox="0 0 600 300" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      {/* dimension line */}
      <g className="draw draw-1" opacity="0.55">
        <path {...common} d="M60 36 H470" />
        <path {...common} d="M60 30 V42 M470 30 V42 M200 30 V42 M330 30 V42" />
      </g>
      {/* ground */}
      <path {...common} className="draw draw-2" d="M16 252 H584" />
      {/* lower volume */}
      <path {...common} className="draw draw-3" d="M92 252 V132 H330 V252" />
      {/* cantilevered slab */}
      <path {...common} className="draw draw-4" d="M58 132 H372 V122 H58 Z" />
      {/* upper volume */}
      <path {...common} className="draw draw-5" d="M200 122 V70 H452 V122" />
      <path {...common} className="draw draw-5" d="M186 70 H470 V62 H186 Z" />
      {/* right wing */}
      <path {...common} className="draw draw-6" d="M330 252 V162 H520 V252" />
      {/* glazing */}
      <path {...common} className="draw draw-7" d="M112 150 H206 V236 H112 Z M143 150 V236 M175 150 V236" />
      <path {...common} className="draw draw-7" d="M236 86 H430 V112 H236 Z M301 86 V112 M366 86 V112" />
      <path {...common} className="draw draw-7" d="M352 182 H500 V240 H352 Z M401 182 V240 M450 182 V240" />
      {/* pier */}
      <path {...common} className="draw draw-8" d="M228 132 V252 M246 132 V252" />
      {/* pool */}
      <path {...common} className="draw draw-8" d="M372 262 H578 M392 270 H560" opacity="0.55" />
      {/* axis marks */}
      <g className="draw draw-9" opacity="0.4">
        <path {...common} d="M92 262 V286 M330 262 V286 M520 262 V286" />
      </g>
    </svg>
  );
}
