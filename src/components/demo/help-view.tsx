"use client"

import { BadgeCheckIcon, FootprintsIcon, HandIcon, RadioIcon, ShieldCheckIcon, TriangleAlertIcon, UndoIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TokenAmount } from "@/components/ui/token-amount"
import { TxStatus } from "@/components/ui/tx-status"
import { href, intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { TOKEN } from "@/lib/demo/chain"
import {
  ALLOWANCE_CHOICES,
  DEMO_TIME_SCALE,
  DEPOSIT_FOR_RADIUS,
  RADII,
  respondersWithin,
  SITUATIONS,
  WINDOW_MS,
} from "@/lib/demo/seed"
import { firstCheckInAt, outgoingView, responderById, type OutgoingResponderView } from "@/lib/demo/sim"
import { useDemo } from "@/lib/demo/store"
import type { OutgoingAlert, RadiusM, Situation, TxResult } from "@/lib/demo/types"
import { formatAmount, formatClock, formatNames } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-context"
import { Gate } from "./gate"
import { HelpMap } from "./help-map"
import { HoldButton } from "./hold-button"
import { CodePlate, Countdown, Panel, StatusLine, TierTag, type FlowStatus } from "./parts"

/** tUSDC has 6 decimals; amounts in the demo are plain numbers. */
function Amount({ value, className }: { value: number; className?: string }) {
  const { locale } = useCopy()
  return (
    <TokenAmount
      value={BigInt(Math.round(value * 1_000_000))}
      decimals={6}
      fractionDigits={2}
      symbol={TOKEN}
      locale={intlLocale[locale]}
      className={className}
    />
  )
}

function failText(res: TxResult, failed: string, rejected: string): FlowStatus {
  if (res.ok) return { kind: "idle" }
  return res.reason === "rejected" ? { kind: "error", text: rejected } : { kind: "failed", text: failed, hash: res.hash }
}

function Setup() {
  const { approve, pending } = useDemo()
  const { d, locale } = useCopy()
  const s = d.setup
  const [choice, setChoice] = useState<number>(10)
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const busy = status.kind === "signing" || pending?.action === "approve"
  return (
    <Panel className="overflow-hidden">
      <div className="border-b-2 border-foreground bg-muted px-5 py-3 font-mono text-xs font-semibold tracking-wide uppercase">{s.eyebrow}</div>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h1 className="font-sign text-2xl leading-tight sm:text-3xl">{s.title}</h1>
          <p className="mt-3 text-muted-foreground">{s.body}</p>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">{s.choicesLabel}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ALLOWANCE_CHOICES.map((a) => (
              <label
                key={a}
                className={cn(
                  "flex h-14 cursor-pointer items-center justify-center rounded-md border-2 font-mono text-lg font-semibold has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                  choice === a ? "border-foreground bg-foreground text-background" : "border-input bg-card"
                )}
              >
                <input type="radio" name="allowance" value={a} checked={choice === a} onChange={() => setChoice(a)} className="sr-only" />
                {a}
              </label>
            ))}
          </div>
        </fieldset>
        <Button
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={async () => {
            setStatus({ kind: "signing" })
            const res = await approve(choice)
            if (res.ok) toast.success(t(s.approved, { amount: formatAmount(choice, locale) }))
            setStatus(res.ok ? { kind: "confirmed", text: t(s.approved, { amount: formatAmount(choice, locale) }), hash: res.hash } : failText(res, s.failed, s.rejected))
          }}
        >
          <ShieldCheckIcon aria-hidden="true" />
          {t(s.approve, { amount: formatAmount(choice, locale) })}
        </Button>
        {pending?.action === "approve" ? <StatusLine status={{ kind: "pending", text: t(s.approving, { amount: formatAmount(choice, locale) }) }} /> : null}
        <StatusLine status={status} />
      </div>
    </Panel>
  )
}

function RaiseForm({ situation, setSituation, radius, setRadius }: { situation: Situation; setSituation: (s: Situation) => void; radius: RadiusM; setRadius: (r: RadiusM) => void }) {
  const { raise, state, pending } = useDemo()
  const { d, c, locale } = useCopy()
  const r = d.raise
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const deposit = DEPOSIT_FOR_RADIUS[radius]
  const allowance = state.profile.allowance
  const tooLow = allowance < deposit
  const busy = status.kind === "signing" || pending?.action === "raise"

  async function go() {
    setStatus({ kind: "signing" })
    const res = await raise(situation, radius)
    if (!res.ok) setStatus(failText(res, r.failed, r.rejected))
  }

  return (
    <Panel>
      <div className="space-y-6 p-5 sm:p-6">
        <h1 className="font-sign text-2xl sm:text-3xl">{r.title}</h1>
        <fieldset>
          <legend className="text-sm font-semibold">{r.situationLabel}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SITUATIONS.map((s) => (
              <label
                key={s}
                className={cn(
                  "flex min-h-14 cursor-pointer flex-col justify-center rounded-md border-2 px-3 py-2 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                  situation === s ? "border-foreground bg-foreground text-background" : "border-input bg-card"
                )}
              >
                <input type="radio" name="situation" value={s} checked={situation === s} onChange={() => setSituation(s)} className="sr-only" />
                <span className="text-sm font-bold">{r.situations[s]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold">{r.radiusLabel}</legend>
          <div className="mt-2 grid grid-cols-3 rounded-md border-2 border-foreground p-0.5">
            {RADII.map((rad) => (
              <label
                key={rad}
                className={cn(
                  "flex h-11 cursor-pointer items-center justify-center rounded-sm font-mono text-sm font-semibold has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                  radius === rad ? "bg-foreground text-background" : ""
                )}
              >
                <input type="radio" name="radius" value={rad} checked={radius === rad} onChange={() => setRadius(rad)} className="sr-only" />
                {rad} m
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t(r.radiusReach, { count: respondersWithin(radius).length })}</p>
        </fieldset>
        <div className="rounded-md border bg-muted/50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold">{r.deposit}</span>
            <Amount value={deposit} className="text-lg font-semibold" />
          </div>
          <details className="mt-1.5 text-sm">
            <summary className="cursor-pointer font-medium text-primary underline underline-offset-2">{r.depositHow}</summary>
            <p className="mt-1.5 text-muted-foreground">{r.depositBody}</p>
          </details>
          <p className={cn("mt-2 text-xs", tooLow ? "font-semibold text-destructive" : "text-muted-foreground")}>
            {tooLow ? r.allowanceLow : t(r.allowanceLeft, { amount: formatAmount(allowance, locale) })}{" "}
            {tooLow ? (
              <Link href={href(locale, "/app/record")} className="underline underline-offset-2">
                {r.allowanceLink}
              </Link>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col items-center pt-2">
          <HoldButton label={r.hold} holdingLabel={r.holding} releasedLabel={r.released} hint={r.holdHint} disabled={busy || tooLow} onComplete={go} />
          {busy ? <StatusLine status={{ kind: "pending", text: t(r.broadcasting, { radius }) }} /> : null}
          <StatusLine status={status} className="w-full" />
          {status.kind === "failed" ? (
            <Button variant="outline" className="mt-3" onClick={go}>
              {r.retry}
            </Button>
          ) : null}
        </div>
        <p className="flex items-start gap-2 border-l-4 border-signal pl-3 text-sm font-medium">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
          {c.call911}
        </p>
      </div>
    </Panel>
  )
}

function ResponderRow({ v, now }: { v: OutgoingResponderView; now: number }) {
  const { d } = useCopy()
  const l = d.live
  const etaMin = (v.etaMs * DEMO_TIME_SCALE) / 60_000
  const eta = etaMin < 1 ? l.etaSoon : t(l.etaMin, { min: Math.ceil(etaMin) })
  const statusText = v.status === "on-the-way" ? t(l.status["on-the-way"], { eta }) : l.status[v.status]
  const Icon = v.status === "checked-in" ? BadgeCheckIcon : v.status === "notified" ? RadioIcon : v.status === "arrived" ? HandIcon : FootprintsIcon
  const fresh = now - v.notifiedAt < 700
  return (
    <li className={cn("flex items-center gap-3 px-4 py-3", fresh && "animate-rise")}>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border-2",
          v.status === "on-the-way" && "border-foreground bg-accent text-accent-foreground",
          (v.status === "checked-in" || v.status === "arrived") && "border-foreground bg-primary text-primary-foreground",
          (v.status === "notified" || v.status === "stood-down") && "border-border text-muted-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{v.responder.name}</span>
        <TierTag score={v.responder.score} firstAid={v.responder.firstAid} />
      </span>
      <span className={cn("text-right text-sm", v.status === "notified" ? "text-muted-foreground" : "font-semibold")}>{statusText}</span>
    </li>
  )
}

function LivePanel({ alert }: { alert: OutgoingAlert }) {
  const { now, release, cancelOutgoing, pending } = useDemo()
  const { d, locale } = useCopy()
  const l = d.live
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const views = outgoingView(alert, now)
  const accepted = views.filter((v) => v.acceptedAt !== undefined)
  const checkedIn = views.filter((v) => v.status === "checked-in")
  const arrived = views.filter((v) => v.status === "arrived")
  const first = firstCheckInAt(alert)
  const busy = status.kind === "signing" || pending?.action === "release" || pending?.action === "cancel"
  const sorted = [...views].sort((a, b) => (b.acceptedAt ? 1 : 0) - (a.acceptedAt ? 1 : 0))

  async function onRelease() {
    setStatus({ kind: "signing" })
    const res = await release()
    setStatus(res.ok ? { kind: "idle" } : failText(res, l.failed, l.rejected))
  }
  async function onCancel() {
    setStatus({ kind: "signing" })
    const res = await cancelOutgoing()
    setStatus(res.ok ? { kind: "idle" } : failText(res, l.failed, l.rejected))
  }

  return (
    <Panel className="overflow-hidden">
      <div className="tape h-2" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 bg-signal px-5 py-3 text-destructive-foreground">
        <h1 className="flex items-center gap-2 font-sign text-lg">
          <span className="size-2.5 rounded-full bg-destructive-foreground motion-safe:animate-pulse" aria-hidden="true" />
          {l.banner}
        </h1>
        <span className="font-mono text-sm">{t(l.elapsed, { time: formatClock(now - alert.raisedAt) })}</span>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          {d.raise.situations[alert.situation]} · <span className="font-mono">{alert.radius} m</span> ·{" "}
          <span className="font-mono">
            {formatAmount(alert.deposit, locale)} {TOKEN}
          </span>
        </p>

        <div aria-live="polite" className="space-y-3">
          {arrived[0] ? <p className="text-lg font-bold">{t(l.arrived, { name: arrived[0].responder.name })}</p> : null}
          {!arrived[0] && checkedIn.length ? (
            <p className="flex items-center gap-2 text-lg font-bold text-primary">
              <BadgeCheckIcon className="size-5" aria-hidden="true" />
              {t(l.verified, { name: formatNames(checkedIn.map((v) => v.responder.name), locale) })}
            </p>
          ) : null}
        </div>
        <CodePlate code={alert.code} title={l.codeTitle} className={cn(arrived.length ? "" : "opacity-95")} />
        <p className="-mt-3 text-sm text-muted-foreground">{l.codeBody}</p>

        <div className="rounded-md border">
          <h2 className="border-b px-4 py-2 font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">{l.respondersTitle}</h2>
          {views.length ? (
            <ul className="divide-y">
              {sorted.map((v) => (
                <ResponderRow key={v.responder.id} v={v} now={now} />
              ))}
            </ul>
          ) : (
            <p role="status" className="px-4 py-4 text-sm text-muted-foreground">
              {l.waiting}
            </p>
          )}
        </div>

        {first !== null && now >= first ? (
          <Countdown total={WINDOW_MS} remaining={first + WINDOW_MS - now} label={t(l.autoRelease, { time: formatClock(first + WINDOW_MS - now) })} />
        ) : null}

        <div className="space-y-3">
          <Button size="lg" className="w-full" disabled={busy || checkedIn.length === 0} onClick={onRelease}>
            <ShieldCheckIcon aria-hidden="true" />
            {l.safe}
          </Button>
          <Button variant="destructive" className="w-full" disabled={busy} onClick={onCancel}>
            <UndoIcon aria-hidden="true" />
            {l.cancel}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {accepted.length && !checkedIn.length ? t(l.cancelAfter, { count: accepted.length }) : l.cancelBefore}
          </p>
          {pending?.action === "release" ? <StatusLine status={{ kind: "pending", text: l.releasing }} /> : null}
          {pending?.action === "cancel" ? <StatusLine status={{ kind: "pending", text: l.cancelling }} /> : null}
          <StatusLine status={status} />
        </div>
      </div>
    </Panel>
  )
}

function Receipt({ alert }: { alert: OutgoingAlert }) {
  const { dismissOutgoing, state } = useDemo()
  const { d, locale } = useCopy()
  const rc = d.receipt
  const payouts = alert.payouts ?? []
  const title = alert.outcome === "cancelled" ? rc.cancelled : alert.outcome === "auto" ? rc.auto : rc.safe
  const body = alert.outcome === "cancelled" ? rc.cancelledBody : alert.outcome === "auto" ? rc.autoBody : rc.safeBody
  const stood = (alert.stoodDown ?? []).map((id) => responderById(id)?.name ?? id)
  const settlementTx = state.ledger.find((e) => e.alertId === alert.id && (e.kind === "release" || e.kind === "cancel") && e.status === "confirmed")
  const segments = [...payouts.map((p) => ({ key: p.responderId, amount: p.amount, tone: "bg-primary" })), ...(alert.refund ? [{ key: "refund", amount: alert.refund, tone: "bg-muted-foreground/40" }] : [])]
  return (
    <Panel className="overflow-hidden">
      <div className={cn("px-5 py-4", alert.outcome === "cancelled" ? "bg-muted" : "bg-primary text-primary-foreground")}>
        <h1 className="font-sign text-xl sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm opacity-90">{body}</p>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        {/* Signature moment 3: the deposit divides and slides to each person. */}
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">{rc.total}</span>
            <Amount value={alert.deposit} className="font-semibold" />
          </div>
          <div className="mt-2 flex h-4 gap-1" aria-hidden="true">
            {segments.map((s, i) => (
              <div
                key={s.key}
                className={cn("h-full animate-slide-share rounded-sm", s.tone)}
                style={{ width: `${(s.amount / alert.deposit) * 100}%`, animationDelay: `${150 + i * 180}ms` }}
              />
            ))}
          </div>
        </div>
        {payouts.length ? (
          <div>
            <h2 className="font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">{rc.paidTo}</h2>
            <ul className="mt-2 divide-y rounded-md border">
              {payouts.map((p, i) => {
                const who = responderById(p.responderId)
                return (
                  <li key={p.responderId} className="flex animate-slide-share items-center justify-between gap-3 px-4 py-3" style={{ animationDelay: `${300 + i * 180}ms` }}>
                    <span>
                      <span className="block font-semibold">{who?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.kind === "share" ? rc.share : rc.walk}
                        {p.kind === "share" ? <span className="ml-2 font-semibold text-primary">{rc.reputation}</span> : null}
                      </span>
                    </span>
                    <Amount value={p.amount} className="font-semibold" />
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
        {alert.refund ? (
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <span className="font-semibold">{rc.refund}</span>
            <Amount value={alert.refund} className="font-semibold" />
          </div>
        ) : null}
        {stood.length ? <p className="text-sm text-muted-foreground">{t(rc.stoodDown, { names: formatNames(stood, locale) })}</p> : null}
        {settlementTx ? <TxStatus status="confirmed" hash={settlementTx.hash} label={`${rc.tx} · ${d.record.confirmed}`} /> : null}
        <Button size="lg" variant="outline" className="w-full" onClick={dismissOutgoing}>
          {rc.done}
        </Button>
      </div>
    </Panel>
  )
}

export function HelpView() {
  const { state, now } = useDemo()
  const [situation, setSituation] = useState<Situation>("followed")
  const [radius, setRadius] = useState<RadiusM>(300)
  const hasApproved = state.ledger.some((e) => e.kind === "approve" && e.status === "confirmed")
  const out = state.outgoing

  let panel: React.ReactNode
  if (!state.connected) panel = <Gate />
  else if (!out && !hasApproved) panel = <Setup />
  else if (!out) panel = <RaiseForm situation={situation} setSituation={setSituation} radius={radius} setRadius={setRadius} />
  else if (out.phase === "live") panel = <LivePanel alert={out} />
  else panel = <Receipt alert={out} />

  const showPreview = state.connected && !out && hasApproved
  return (
    <div className="mx-auto grid w-full max-w-[1400px] flex-1 md:grid-cols-[minmax(380px,460px)_1fr] md:gap-6 md:px-6 md:py-6">
      <div className="order-2 px-4 py-5 md:order-1 md:p-0">{panel}</div>
      <div className="order-1 h-[42vh] min-h-64 border-b-2 border-foreground md:sticky md:top-[142px] md:order-2 md:h-[calc(100dvh-166px)] md:overflow-hidden md:rounded-lg md:border-2 lg:top-[90px] lg:h-[calc(100dvh-114px)]">
        <HelpMap alert={out} previewRadius={showPreview ? radius : undefined} now={now} />
      </div>
    </div>
  )
}
