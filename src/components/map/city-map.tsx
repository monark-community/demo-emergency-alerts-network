import type * as React from "react"

import { METRES_PER_UNIT, STREETS } from "@/lib/demo/seed"
import type { Point } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

/*
 * A stylised Milton-Parc (Montréal) street grid drawn in code: no map tiles, no
 * third-party requests, and nothing that could leak a real location.
 */

const SIZE = 600
const STREET_W = 20

function blocks(): { x: number; y: number; w: number; h: number }[] {
  const xs = [0, ...STREETS.vertical.map((s) => s.x), SIZE]
  const ys = [0, ...STREETS.horizontal.map((s) => s.y), SIZE]
  const out: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i]! + (i === 0 ? 0 : STREET_W / 2)
      const x1 = xs[i + 1]! - (i === xs.length - 2 ? 0 : STREET_W / 2)
      const y0 = ys[j]! + (j === 0 ? 0 : STREET_W / 2)
      const y1 = ys[j + 1]! - (j === ys.length - 2 ? 0 : STREET_W / 2)
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
    }
  }
  return out
}

const BLOCKS = blocks()

export function CityMap({
  label,
  campusLabel,
  parkLabel,
  className,
  children,
  focus,
}: {
  label: string
  campusLabel: string
  parkLabel: string
  className?: string
  children?: React.ReactNode
  /** Optional viewBox focus (zoom) as [x, y, w, h]. */
  focus?: [number, number, number, number]
}) {
  const vb = focus ?? [0, 0, SIZE, SIZE]
  return (
    <svg
      viewBox={vb.join(" ")}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      className={cn("block size-full select-none", className)}
    >
      <rect x={-200} y={-200} width={SIZE + 400} height={SIZE + 400} className="fill-map-street" />
      {BLOCKS.map((b, i) => {
        const isPark = b.x > 500 && b.y < 230
        const isCampus = b.x < 90 && b.y > 370
        return (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={4}
              className={isPark ? "fill-map-park" : "fill-map-block"}
            />
            {!isPark && b.w > 60 && b.h > 60 ? (
              <rect
                x={b.x + 10}
                y={b.y + 10}
                width={b.w - 20}
                height={b.h - 20}
                rx={3}
                className="fill-map-ground"
                opacity={isCampus ? 0.5 : 0.9}
              />
            ) : null}
          </g>
        )
      })}
      {/* Street names, set like signs. */}
      {STREETS.horizontal.map((s) => (
        <text
          key={s.name}
          x={400}
          y={s.y + 4.5}
          className="fill-map-label font-mono"
          fontSize={11}
          letterSpacing={1}
          style={{ textTransform: "uppercase" }}
        >
          {s.name}
        </text>
      ))}
      {STREETS.vertical.map((s) => (
        <text
          key={s.name}
          x={s.x + 4}
          y={24}
          transform={`rotate(90 ${s.x + 4} 24)`}
          className="fill-map-label font-mono"
          fontSize={11}
          letterSpacing={1}
          style={{ textTransform: "uppercase" }}
        >
          {s.name}
        </text>
      ))}
      <text x={548} y={140} textAnchor="middle" className="fill-map-label" fontSize={12} fontWeight={600}>
        {parkLabel.split(" ").map((w, i) => (
          <tspan key={i} x={548} dy={i === 0 ? 0 : 14}>
            {w}
          </tspan>
        ))}
      </text>
      <text x={40} y={470} textAnchor="middle" className="fill-map-label" fontSize={12} fontWeight={600}>
        {campusLabel}
      </text>
      {children}
    </svg>
  )
}

export function metresToUnits(m: number): number {
  return m / METRES_PER_UNIT
}

/** The alert radius. Rolls outward once when `animate` is set. */
export function MapRing({ at, radiusM, animate, tone = "primary", delay = 0 }: { at: Point; radiusM: number; animate?: boolean; tone?: "primary" | "signal"; delay?: number }) {
  const r = metresToUnits(radiusM)
  return (
    <g style={{ transformOrigin: `${at.x}px ${at.y}px`, transformBox: "view-box", animationDelay: `${delay}ms` }} className={animate ? "animate-ring-out" : undefined}>
      <circle
        cx={at.x}
        cy={at.y}
        r={r}
        className={tone === "signal" ? "fill-signal/8 stroke-signal" : "fill-primary/8 stroke-primary"}
        strokeWidth={2}
        strokeDasharray="6 6"
      />
    </g>
  )
}

export function MapArea({ at, label }: { at: Point; label?: string }) {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={62} className="fill-signal/15 stroke-signal" strokeWidth={2} strokeDasharray="3 5" />
      {label ? (
        <text x={at.x} y={at.y - 70} textAnchor="middle" className="fill-signal" fontSize={13} fontWeight={700}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

export function MapRoute({ points, tone = "hivis" }: { points: Point[]; tone?: "hivis" | "primary" }) {
  if (points.length < 2) return null
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
  return (
    <g>
      <path d={d} fill="none" className="stroke-foreground/80" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        className={tone === "hivis" ? "stroke-accent" : "stroke-primary"}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 9"
      />
    </g>
  )
}

/** "You" (or the sender): a dot in a plate. Pulses in signal red while an alert is live. */
export function MapYou({ at, label, live }: { at: Point; label: string; live?: boolean }) {
  return (
    <g>
      {live ? (
        <circle cx={at.x} cy={at.y} r={16} className="fill-signal/25 motion-safe:animate-ping" style={{ transformOrigin: `${at.x}px ${at.y}px`, transformBox: "view-box" }} />
      ) : null}
      <circle cx={at.x} cy={at.y} r={13} className="fill-card stroke-foreground" strokeWidth={2.5} />
      <circle cx={at.x} cy={at.y} r={7} className={live ? "fill-signal" : "fill-foreground"} />
      <g transform={`translate(${at.x} ${at.y + 24})`}>
        <rect x={-24} y={-1} width={48} height={20} rx={4} className="fill-foreground" />
        <text x={0} y={13.5} textAnchor="middle" className="fill-background" fontSize={12} fontWeight={700}>
          {label}
        </text>
      </g>
    </g>
  )
}

export type PinTone = "idle" | "moving" | "here" | "done"

export function MapPin({ at, tone, label, clasp }: { at: Point; tone: PinTone; label?: string; clasp?: boolean }) {
  const fill =
    tone === "idle" ? "fill-card stroke-muted-foreground" : tone === "moving" ? "fill-accent stroke-foreground" : "fill-primary stroke-foreground"
  return (
    <g className="animate-pin-in" style={{ transformOrigin: `${at.x}px ${at.y}px`, transformBox: "view-box" }}>
      {clasp ? (
        <circle cx={at.x} cy={at.y} r={10} className="fill-primary/60 animate-clasp" style={{ transformOrigin: `${at.x}px ${at.y}px`, transformBox: "view-box" }} />
      ) : null}
      <circle cx={at.x} cy={at.y + 1.5} r={9} className="fill-foreground/25" />
      <circle cx={at.x} cy={at.y} r={tone === "idle" ? 6.5 : 9} className={fill} strokeWidth={2} />
      {label ? (
        <g transform={`translate(${at.x + 14} ${at.y - 10})`}>
          <rect x={0} y={0} width={label.length * 7.4 + 12} height={20} rx={4} className={tone === "moving" ? "fill-accent stroke-foreground" : "fill-card stroke-foreground"} strokeWidth={1.5} />
          <text x={6} y={14} className={tone === "moving" ? "fill-accent-foreground" : "fill-foreground"} fontSize={12} fontWeight={700}>
            {label}
          </text>
        </g>
      ) : null}
    </g>
  )
}
