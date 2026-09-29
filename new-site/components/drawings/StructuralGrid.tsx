// Structural plan: column grid with axis bubbles, beams, a braced bay, loads and dimensions.
// Every stroke uses pathLength=1 so it can be drawn by animating stroke-dashoffset 1 → 0.
const X = [14, 38, 62, 86, 110];
const Y = [26, 50, 74];
const letters = ['A', 'B', 'C', 'D', 'E'];

export default function StructuralGrid({ className = '' }: { className?: string }) {
  const p = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 } as const;
  return (
    <svg viewBox="0 0 124 100" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth="0.25" className={className} aria-hidden>
      {/* axes */}
      <g data-g="axes" opacity="0.5" strokeDasharray="1.2 0.8">
        {X.map((x) => (
          <line key={`x${x}`} x1={x} y1="12" x2={x} y2="88" />
        ))}
        {Y.map((y) => (
          <line key={`y${y}`} x1="6" y1={y} x2="118" y2={y} />
        ))}
      </g>
      {/* axis bubbles */}
      <g data-g="bubbles">
        {X.map((x, i) => (
          <g key={`b${x}`}>
            <circle {...p} cx={x} cy="8" r="3.2" />
            <text x={x} y="9.2" textAnchor="middle" fontSize="3.2" fill="currentColor" stroke="none" fontFamily="var(--font-plex), monospace">
              {letters[i]}
            </text>
          </g>
        ))}
        {Y.map((y, i) => (
          <g key={`n${y}`}>
            <circle {...p} cx="3.6" cy={y} r="3" />
            <text x="3.6" y={y + 1.1} textAnchor="middle" fontSize="3" fill="currentColor" stroke="none" fontFamily="var(--font-plex), monospace">
              {i + 1}
            </text>
          </g>
        ))}
      </g>
      {/* beams */}
      <g data-g="beams" strokeWidth="0.7">
        {Y.map((y) => (
          <path key={`bm${y}`} {...p} d={`M${X[0]} ${y} H${X[X.length - 1]}`} />
        ))}
        {X.map((x) => (
          <path key={`bv${x}`} {...p} d={`M${x} ${Y[0]} V${Y[Y.length - 1]}`} />
        ))}
      </g>
      {/* columns */}
      <g data-g="columns" strokeWidth="0.4">
        {X.flatMap((x) => Y.map((y) => <rect key={`c${x}-${y}`} {...p} x={x - 1.6} y={y - 1.6} width="3.2" height="3.2" />))}
      </g>
      {/* bracing */}
      <g data-g="brace" strokeWidth="0.35" opacity="0.8">
        <path {...p} d={`M${X[1]} ${Y[0]} L${X[2]} ${Y[1]} M${X[2]} ${Y[0]} L${X[1]} ${Y[1]}`} />
        <path {...p} d={`M${X[3]} ${Y[1]} L${X[4]} ${Y[2]} M${X[4]} ${Y[1]} L${X[3]} ${Y[2]}`} />
      </g>
      {/* loads */}
      <g data-g="loads" strokeWidth="0.3">
        {[26, 50, 74, 98].map((x) => (
          <path key={`l${x}`} {...p} d={`M${x} 15 V${Y[0] - 3} M${x - 1} ${Y[0] - 4.6} L${x} ${Y[0] - 3} L${x + 1} ${Y[0] - 4.6}`} />
        ))}
      </g>
      {/* dimensions */}
      <g data-g="dims" strokeWidth="0.2" opacity="0.8">
        <path {...p} d={`M${X[0]} 94 H${X[X.length - 1]}`} />
        {X.map((x) => (
          <path key={`d${x}`} {...p} d={`M${x - 0.8} 94.8 L${x + 0.8} 93.2`} />
        ))}
        {X.slice(0, -1).map((x, i) => (
          <text key={`t${x}`} x={(x + X[i + 1]) / 2} y="92.4" textAnchor="middle" fontSize="2.4" fill="currentColor" stroke="none" fontFamily="var(--font-plex), monospace">
            6000
          </text>
        ))}
      </g>
    </svg>
  );
}
