"use client"

import { SirenIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const HOLD_MS = 1000
const R = 70
const CIRC = 2 * Math.PI * R

/**
 * Signature moment 1: press and hold for one second, so a pocket can't raise an alert.
 * Works with pointer (mouse, touch, pen) and keyboard (hold Space or Enter).
 */
export function HoldButton({
  label,
  holdingLabel,
  releasedLabel,
  hint,
  disabled,
  onComplete,
}: {
  label: string
  holdingLabel: string
  releasedLabel: string
  hint: string
  disabled?: boolean
  onComplete: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [released, setReleased] = useState(false)
  const start = useRef<number | null>(null)
  const raf = useRef<number | null>(null)
  const done = useRef(false)

  const stop = useCallback((early: boolean) => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    raf.current = null
    if (start.current !== null && early && !done.current) setReleased(true)
    start.current = null
    if (!done.current) setProgress(0)
  }, [])

  const begin = useCallback(() => {
    if (disabled || start.current !== null) return
    setReleased(false)
    start.current = performance.now()
    const step = () => {
      if (start.current === null) return
      const p = Math.min(1, (performance.now() - start.current) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        done.current = true
        start.current = null
        raf.current = null
        setProgress(0)
        onComplete()
        done.current = false
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [disabled, onComplete])

  useEffect(() => () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
  }, [])

  const holding = progress > 0
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        aria-describedby="hold-hint"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          begin()
        }}
        onPointerUp={() => stop(true)}
        onPointerCancel={() => stop(false)}
        onLostPointerCapture={() => stop(true)}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault()
            begin()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault()
            stop(true)
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative grid size-40 touch-none place-items-center rounded-full outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-50",
          "transition-transform active:scale-[0.98]"
        )}
      >
        <svg viewBox="0 0 160 160" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
          <circle cx="80" cy="80" r={R} className="fill-none stroke-border" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r={R}
            className="fill-none stroke-foreground"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
          />
        </svg>
        <span className="grid size-[7.25rem] place-items-center rounded-full border-4 border-foreground bg-signal text-destructive-foreground">
          <span className="flex flex-col items-center gap-1 px-2 text-center text-sm leading-tight font-bold">
            <SirenIcon className="size-7" aria-hidden="true" />
            {holding ? holdingLabel : label}
          </span>
        </span>
      </button>
      <p id="hold-hint" className="max-w-xs text-center text-xs text-muted-foreground">
        {hint}
      </p>
      <p aria-live="polite" className="min-h-5 text-sm font-semibold text-signal">
        {released ? releasedLabel : ""}
      </p>
    </div>
  )
}
