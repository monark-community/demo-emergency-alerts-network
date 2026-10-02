/** Small line diagrams for the "four moves" strip. Decorative. */
export function MoveGlyph({ index }: { index: number }) {
  const common = { viewBox: "0 0 96 64", className: "h-16 w-24", "aria-hidden": true as const }
  if (index === 0)
    return (
      <svg {...common}>
        <circle cx="48" cy="32" r="22" className="fill-none stroke-border" strokeWidth="5" />
        <path d="M48 10a22 22 0 0 1 21 28" className="fill-none stroke-primary" strokeWidth="5" strokeLinecap="round" />
        <circle cx="48" cy="32" r="14" className="fill-signal" />
      </svg>
    )
  if (index === 1)
    return (
      <svg {...common}>
        <circle cx="48" cy="32" r="26" className="fill-primary/10 stroke-primary" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="48" cy="32" r="5" className="fill-signal" />
        {[
          [26, 20],
          [70, 24],
          [60, 50],
          [30, 46],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" className="fill-card stroke-foreground" strokeWidth="2" />
        ))}
      </svg>
    )
  if (index === 2)
    return (
      <svg {...common}>
        {["4", "7", "1", "9"].map((d, i) => (
          <g key={d}>
            <rect x={6 + i * 22} y="14" width="18" height="36" rx="3" className="fill-accent stroke-foreground" strokeWidth="2" />
            <text x={15 + i * 22} y="39" textAnchor="middle" className="fill-accent-foreground font-mono" fontSize="18" fontWeight="600">
              {d}
            </text>
          </g>
        ))}
      </svg>
    )
  return (
    <svg {...common}>
      <rect x="6" y="12" width="84" height="14" rx="3" className="fill-muted stroke-foreground" strokeWidth="2" />
      <rect x="6" y="38" width="40" height="14" rx="3" className="fill-primary" />
      <rect x="50" y="38" width="40" height="14" rx="3" className="fill-primary" />
      <path d="M26 28v8M70 28v8" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
