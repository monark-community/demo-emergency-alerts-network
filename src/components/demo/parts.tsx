"use client"

import { BadgeCheckIcon, CircleAlertIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import type * as React from "react"

import { TxStatus } from "@/components/ui/tx-status"
import { tierFor } from "@/lib/demo/seed"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-context"

/** Where a flow's transaction stands, shown inline next to the action it reports on. */
export type FlowStatus =
  | { kind: "idle" }
  | { kind: "signing" }
  | { kind: "pending"; text: string }
  | { kind: "confirmed"; text: string; hash?: string }
  | { kind: "failed"; text: string; hash?: string }
  | { kind: "error"; text: string }

export function StatusLine({ status, className }: { status: FlowStatus; className?: string }) {
  const { d } = useCopy()
  if (status.kind === "idle" || status.kind === "signing") return null
  if (status.kind === "pending")
    return (
      <p role="status" className={cn("flex items-center gap-2 text-sm font-medium", className)}>
        <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
        {status.text}
      </p>
    )
  if (status.kind === "confirmed")
    return (
      <div role="status" className={cn("space-y-2", className)}>
        <p className="text-sm font-medium">{status.text}</p>
        {status.hash ? <TxStatus status="confirmed" hash={status.hash} label={d.record.confirmed} /> : null}
      </div>
    )
  return (
    <div role="alert" className={cn("rounded-md border-2 border-destructive/70 bg-signal-wash p-3", className)}>
      <p className="flex items-start gap-2 text-sm font-medium">
        {status.kind === "failed" ? (
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        )}
        {status.text}
      </p>
      {status.kind === "failed" && status.hash ? (
        <TxStatus status="failed" hash={status.hash} label={d.record.failed} className="mt-2" />
      ) : null}
    </div>
  )
}

export function TestnetNote({ className }: { className?: string }) {
  const { c } = useCopy()
  return <p className={cn("font-mono text-[11px] tracking-wide text-muted-foreground uppercase", className)}>{c.testnet}</p>
}

export function TierTag({ score, firstAid }: { score: number; firstAid?: boolean }) {
  const { d } = useCopy()
  const tier = tierFor(score)
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <span>
        {d.record.tiers[tier].name} · <span className="font-mono">{score}</span>
      </span>
      {firstAid ? (
        <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
          <BadgeCheckIcon className="size-3.5" aria-hidden="true" />
          {d.live.firstAid}
        </span>
      ) : null}
    </span>
  )
}

/** The hi-vis meet-code plate, edged with reflective tape. */
export function CodePlate({ code, title, size = "lg", className }: { code: string; title: string; size?: "lg" | "md"; className?: string }) {
  return (
    <div className={cn("tape rounded-lg p-1.5", className)}>
      <div className="flex items-center justify-between gap-3 rounded-md bg-accent px-4 py-3 text-accent-foreground">
        <span className="text-sm font-bold">{title}</span>
        <span
          className={cn("font-mono font-semibold tracking-[0.35em]", size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl")}
          aria-label={code.split("").join(" ")}
        >
          {code}
        </span>
      </div>
    </div>
  )
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border-2 border-foreground bg-card", className)}>{children}</section>
}

export function Countdown({ total, remaining, label }: { total: number; remaining: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100))
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full bg-primary transition-[width] duration-300 ease-linear" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
