"use client"

import { BadgeCheckIcon, FlagIcon, FootprintsIcon, LockIcon, MapPinIcon, RadioTowerIcon, SmartphoneIcon } from "lucide-react"
import { useState } from "react"

import { CityMap, MapArea, MapRoute, MapYou } from "@/components/map/city-map"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TokenAmount } from "@/components/ui/token-amount"
import { intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { TOKEN } from "@/lib/demo/chain"
import { DEMO_TIME_SCALE, RESPONDER_POS, SENDER_CONFIRM_MS, TRUSTED_AT, WINDOW_MS } from "@/lib/demo/seed"
import { incomingProgress, incomingStage, pointAlong, remainingRoute, type IncomingStage } from "@/lib/demo/sim"
import { useDemo } from "@/lib/demo/store"
import type { FlagReason, IncomingAlert, TxResult } from "@/lib/demo/types"
import { formatAmount, formatClock, formatNames, formatShortDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-context"
import { Gate } from "./gate"
import { CodePlate, Countdown, Panel, StatusLine, TierTag, type FlowStatus } from "./parts"

function Amount({ value, className }: { value: number; className?: string }) {
  const { locale } = useCopy()
  return (
    <TokenAmount value={BigInt(Math.round(value * 1_000_000))} decimals={6} fractionDigits={2} symbol={TOKEN} locale={intlLocale[locale]} className={className} />
  )
}

function failText(res: TxResult, failed: string, rejected: string): FlowStatus {
  if (res.ok) return { kind: "idle" }
  return res.reason === "rejected" ? { kind: "error", text: rejected } : { kind: "failed", text: failed, hash: res.hash }
}

function isLocked(alert: IncomingAlert, score: number) {
  return alert.situation === "hurt" && score < TRUSTED_AT
}

function RespondMap({ alert, now }: { alert: IncomingAlert | null; now: number }) {
  const { d } = useCopy()
  const stage = alert ? incomingStage(alert, now) : null
  const progress = alert ? incomingProgress(alert, now) : 0
  const pinKnown = alert && stage !== "open" && stage !== "declined"
  const arrived = alert && pinKnown && progress >= 1
  const youAt = alert && pinKnown ? (arrived ? { x: alert.pin.x - 34, y: alert.pin.y } : pointAlong(alert.route, progress)) : RESPONDER_POS
  return (
    <CityMap label={t(d.map.label, { detail: d.map.detailResponder })} campusLabel={d.map.campus} parkLabel={d.map.park} focus={[60, 120, 500, 500]}>
      {alert && stage === "open" ? <MapArea at={alert.areaCentre} label={d.map.area} /> : null}
      {alert && pinKnown ? (
        <>
          {progress < 1 ? <MapRoute points={remainingRoute(alert.route, progress)} /> : null}
          {!alert.hoax ? (
            <g>
              <circle cx={alert.pin.x} cy={alert.pin.y} r={16} className="fill-signal/25" />
              <circle cx={alert.pin.x} cy={alert.pin.y} r={9} className="fill-signal stroke-foreground" strokeWidth={2.5} />
            </g>
          ) : (
            <circle cx={alert.pin.x} cy={alert.pin.y} r={9} className="fill-card stroke-signal" strokeWidth={2.5} strokeDasharray="3 3" />
          )}
        </>
      ) : null}
      <MapYou at={youAt} label={d.map.you} />
    </CityMap>
  )
}

function FlagDialog({ open, onOpenChange, onFlag }: { open: boolean; onOpenChange: (v: boolean) => void; onFlag: (r: FlagReason) => void }) {
  const { d, c } = useCopy()
  const r = d.respond
  const [reason, setReason] = useState<FlagReason>("nobody")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={c.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sign">{r.flagTitle}</DialogTitle>
          <DialogDescription>{r.flagBody}</DialogDescription>
        </DialogHeader>
        <fieldset>
          <legend className="text-sm font-semibold">{r.reasonsLabel}</legend>
          <div className="mt-2 space-y-2">
            {(["nobody", "denied", "prank"] as const).map((key) => (
              <label
                key={key}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border-2 px-3 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                  reason === key ? "border-foreground" : "border-input"
                )}
              >
                <input type="radio" name="flag-reason" value={key} checked={reason === key} onChange={() => setReason(key)} className="size-4 accent-[var(--primary)]" />
                <span className="text-sm font-medium">{r.reasons[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {r.flagCancel}
          </Button>
          <Button variant="signal" onClick={() => onFlag(reason)}>
            <FlagIcon aria-hidden="true" />
            {r.flagSubmit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CheckInForm({ alert }: { alert: IncomingAlert }) {
  const { checkIn, flag, pending } = useDemo()
  const { d } = useCopy()
  const r = d.respond
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const [flagOpen, setFlagOpen] = useState(false)
  const busy = status.kind === "signing" || pending?.action === "checkin" || pending?.action === "flag"
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!/^\d{4}$/.test(code)) {
              setStatus({ kind: "error", text: r.codeFormat })
              return
            }
            setStatus({ kind: "signing" })
            const res = await checkIn(alert.id, code)
            if (res.ok) setStatus({ kind: "idle" })
            else if (res.reason === "wrong-code") setStatus({ kind: "error", text: r.codeWrong })
            else setStatus(failText(res, r.checkInFailed, r.checkInRejected))
          }}
        >
          <Label htmlFor="meet-code" className="font-semibold">
            {r.codeLabel}
          </Label>
          <p id="meet-code-help" className="text-sm text-muted-foreground">
            {r.codeHelp}
          </p>
          <div className="flex gap-2">
            <Input
              id="meet-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              aria-describedby="meet-code-help"
              aria-invalid={status.kind === "error" ? true : undefined}
              className="h-12 w-36 border-2 border-input text-center font-mono text-2xl tracking-[0.4em]"
              placeholder="····"
            />
            <Button type="submit" size="lg" disabled={busy} className="flex-1 sm:flex-none">
              <BadgeCheckIcon aria-hidden="true" />
              {r.checkIn}
            </Button>
          </div>
        </form>
      </div>
      {pending?.action === "checkin" ? <StatusLine status={{ kind: "pending", text: r.checkingIn }} /> : null}
      {pending?.action === "flag" ? <StatusLine status={{ kind: "pending", text: r.flagging }} /> : null}
      <StatusLine status={status} />
      <div className="rounded-md border-2 border-dashed p-3">
        <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <SmartphoneIcon className="size-3.5" aria-hidden="true" />
          {r.theirScreen}
        </p>
        {alert.hoax ? (
          <p className="mt-2 text-sm">{r.nobodyThere}</p>
        ) : (
          <>
            <CodePlate code={alert.code} title={d.live.codeTitle} size="md" className="mt-2" />
          </>
        )}
      </div>
      <Button variant="destructive" className="w-full" disabled={busy} onClick={() => setFlagOpen(true)}>
        <FlagIcon aria-hidden="true" />
        {r.nobody}
      </Button>
      <FlagDialog
        open={flagOpen}
        onOpenChange={setFlagOpen}
        onFlag={async (reason) => {
          setFlagOpen(false)
          setStatus({ kind: "signing" })
          const res = await flag(alert.id, reason)
          setStatus(res.ok ? { kind: "idle" } : failText(res, r.flagFailed, r.flagRejected))
        }}
      />
    </div>
  )
}

function AlertDetail({ alert, stage }: { alert: IncomingAlert; stage: IncomingStage }) {
  const { now, state, accept, decline, clearIncoming, pending } = useDemo()
  const { d, locale } = useCopy()
  const r = d.respond
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const locked = isLocked(alert, state.profile.score)
  const busy = status.kind === "signing" || pending?.action === "accept"
  const etaMin = alert.acceptedAt !== undefined ? ((alert.acceptedAt + alert.walkMs - now) * DEMO_TIME_SCALE) / 60_000 : 0
  const eta = etaMin < 1 ? d.live.etaSoon : t(d.live.etaMin, { min: Math.ceil(etaMin) })

  if (stage === "open")
    return (
      <div className="space-y-4">
        {locked ? (
          <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
            <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t(r.medicalLocked, { min: TRUSTED_AT, n: TRUSTED_AT - state.profile.score })}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            disabled={busy || locked}
            onClick={async () => {
              setStatus({ kind: "signing" })
              const res = await accept(alert.id)
              setStatus(res.ok ? { kind: "idle" } : failText(res, r.acceptFailed, r.acceptRejected))
            }}
          >
            <FootprintsIcon aria-hidden="true" />
            {r.accept}
          </Button>
          <Button size="lg" variant="outline" disabled={busy} onClick={() => (locked ? clearIncoming(alert.id) : decline(alert.id))}>
            {locked ? r.dismiss : r.decline}
          </Button>
        </div>
        {pending?.action === "accept" ? <StatusLine status={{ kind: "pending", text: r.accepting }} /> : null}
        <StatusLine status={status} />
      </div>
    )

  if (stage === "walking")
    return (
      <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-md bg-safe-wash p-3 text-sm font-medium">
          <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {r.pinUnlocked}
        </p>
        <p className="text-lg font-bold">{t(r.walking, { eta })}</p>
        <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full bg-accent" style={{ width: `${incomingProgress(alert, now) * 100}%` }} />
        </div>
        <Button size="lg" className="w-full" disabled>
          {r.imHere}
        </Button>
        <p className="text-sm text-muted-foreground">{r.arriveFirst}</p>
      </div>
    )

  if (stage === "arrived") return <CheckInForm alert={alert} />

  if (stage === "checked-in")
    return (
      <div className="space-y-4" aria-live="polite">
        <p className="flex items-start gap-2 text-lg font-bold">
          <BadgeCheckIcon className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
          {t(r.checkedIn, { name: alert.senderName })}
        </p>
        <Countdown total={SENDER_CONFIRM_MS} remaining={(alert.checkedInAt ?? now) + SENDER_CONFIRM_MS - now} label={r.confirmWindow} />
      </div>
    )

  if (stage === "paid")
    return (
      <div className="space-y-4" aria-live="polite">
        <div className="rounded-md bg-primary p-4 text-primary-foreground">
          <p className="font-sign text-lg">{t(r.paid, { name: alert.senderName })}</p>
          <p className="mt-2 font-mono text-3xl font-semibold">+{formatAmount(alert.reward ?? 0, locale)} {TOKEN}</p>
          <p className="mt-1 text-sm opacity-90">
            {alert.alsoGoing.length ? t(r.paidSplit, { names: formatNames(alert.alsoGoing, locale) }) : r.paidAlone} · {r.reputationUp}
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => clearIncoming(alert.id)}>
          {r.dismiss}
        </Button>
      </div>
    )

  if (stage === "flagged")
    return (
      <div className="space-y-4" aria-live="polite">
        <p className="flex items-start gap-2 text-lg font-bold">
          <FlagIcon className="mt-1 size-5 shrink-0 text-signal" aria-hidden="true" />
          {r.flagged}
        </p>
        <Countdown
          total={WINDOW_MS}
          remaining={(alert.flaggedAt ?? now) + WINDOW_MS - now}
          label={t(r.flaggedWindow, { time: formatClock((alert.flaggedAt ?? now) + WINDOW_MS - now) })}
        />
      </div>
    )

  if (stage === "upheld")
    return (
      <div className="space-y-4" aria-live="polite">
        <div className="rounded-md border-2 border-foreground bg-safe-wash p-4">
          <p className="font-semibold">{t(r.upheld, { amount: formatAmount(alert.reward ?? 0, locale) })}</p>
          <p className="mt-1 text-sm font-semibold text-primary">{r.reputationFlag}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => clearIncoming(alert.id)}>
          {r.dismiss}
        </Button>
      </div>
    )

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{r.declined}</p>
      <Button variant="ghost" size="sm" onClick={() => clearIncoming(alert.id)}>
        {r.dismiss}
      </Button>
    </div>
  )
}

function AlertCard({ alert, selected, onSelect }: { alert: IncomingAlert; selected: boolean; onSelect: () => void }) {
  const { now } = useDemo()
  const { d, locale } = useCopy()
  const r = d.respond
  const stage = incomingStage(alert, now)
  const live = stage === "open" || stage === "walking" || stage === "arrived"
  return (
    <li>
      <Panel className={cn("overflow-hidden", !selected && "border-border")}>
        <button
          type="button"
          onClick={onSelect}
          aria-expanded={selected}
          className="flex w-full items-start gap-3 px-4 py-3.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span className={cn("mt-1 size-3 shrink-0 rounded-full", live ? "bg-signal" : stage === "declined" ? "bg-border" : "bg-primary")} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{t(r.situationAt, { situation: d.raise.situations[alert.situation], area: alert.area })}</span>
            <span className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
              <span className="font-mono">{t(r.distance, { m: alert.distanceM })}</span>
              <span>{t(r.raisedAgo, { time: formatShortDuration(now - alert.spawnedAt, locale) })}</span>
            </span>
          </span>
          <Amount value={alert.deposit} className="shrink-0 text-sm font-semibold" />
        </button>
        {selected ? (
          <div className="space-y-4 border-t px-4 py-4">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="sr-only">{r.senderRep}</dt>
                <dd className="flex flex-col">
                  <span className="font-semibold">{alert.senderName}</span>
                  <TierTag score={alert.senderScore} />
                </dd>
              </div>
              <div>
                <dt className="sr-only">{r.nobodyElse}</dt>
                <dd className="text-muted-foreground">
                  {alert.alsoGoing.length ? t(r.alsoGoing, { names: formatNames(alert.alsoGoing, locale) }) : r.nobodyElse}
                </dd>
              </div>
            </dl>
            <AlertDetail alert={alert} stage={stage} />
          </div>
        ) : null}
      </Panel>
    </li>
  )
}

export function RespondView() {
  const { state, now, simulateIncoming } = useDemo()
  const { d } = useCopy()
  const r = d.respond
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const alerts = state.incoming
  const active = alerts.find((a) => a.phase === "accepted" || a.phase === "checked-in" || a.phase === "flagged")
  const selected = alerts.find((a) => a.id === selectedId) ?? active ?? alerts.find((a) => a.phase === "open") ?? alerts[0] ?? null

  const panel = !state.connected ? (
    <Gate />
  ) : (
    <div className="space-y-4">
      <div>
        <h1 className="font-sign text-2xl sm:text-3xl">{r.title}</h1>
      </div>
      {alerts.length ? (
        <ul aria-label={r.selectLabel} className="space-y-3">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} selected={selected?.id === a.id} onSelect={() => setSelectedId(a.id)} />
          ))}
        </ul>
      ) : (
        <Panel className="border-dashed">
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <RadioTowerIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-sign text-lg">{r.emptyTitle}</p>
            <p className="text-sm text-muted-foreground">{r.emptyBody}</p>
          </div>
        </Panel>
      )}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const id = simulateIncoming()
          setSelectedId(id)
        }}
      >
        <RadioTowerIcon aria-hidden="true" />
        {r.simulate}
      </Button>
    </div>
  )

  return (
    <div className="mx-auto grid w-full max-w-[1400px] flex-1 md:grid-cols-[minmax(380px,460px)_1fr] md:gap-6 md:px-6 md:py-6">
      <div className="order-2 px-4 py-5 md:order-1 md:p-0">{panel}</div>
      <div className="order-1 h-[38vh] min-h-60 border-b-2 border-foreground md:sticky md:top-[142px] md:order-2 md:h-[calc(100dvh-166px)] md:overflow-hidden md:rounded-lg md:border-2 lg:top-[90px] lg:h-[calc(100dvh-114px)]">
        <RespondMap alert={state.connected ? selected : null} now={now} />
      </div>
    </div>
  )
}
