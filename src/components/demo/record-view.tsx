"use client"

import { RotateCcwIcon, ShieldCheckIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { TokenAmount } from "@/components/ui/token-amount"
import { truncateHash } from "@/components/ui/tx-status"
import { Wallet } from "@/components/ui/wallet"
import { intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { TOKEN } from "@/lib/demo/chain"
import { ALLOWANCE_CHOICES, TIERS, tierFor } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import type { TxResult } from "@/lib/demo/types"
import { formatAmount, formatDateTime, formatSigned } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCopy } from "./app-context"
import { Gate } from "./gate"
import { Panel, StatusLine, type FlowStatus } from "./parts"
import { ResetDialog } from "./reset-dialog"

function failText(res: TxResult, failed: string, rejected: string): FlowStatus {
  if (res.ok) return { kind: "idle" }
  return res.reason === "rejected" ? { kind: "error", text: rejected } : { kind: "failed", text: failed, hash: res.hash }
}

function Reputation() {
  const { state } = useDemo()
  const { d } = useCopy()
  const rc = d.record
  const score = state.profile.score
  const tier = tierFor(score)
  const idx = TIERS.findIndex((x) => x.tier === tier)
  const next = TIERS[idx + 1]
  return (
    <Panel>
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div>
          <h2 className="font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">{rc.reputation}</h2>
          <p className="mt-1 font-mono text-6xl font-semibold tabular-nums">{score}</p>
          <p className="mt-1 font-sign text-lg">{t(rc.tierNow, { tier: rc.tiers[tier].name })}</p>
          <p className="text-sm text-muted-foreground">{next ? t(rc.nextTier, { n: next.min - score, tier: rc.tiers[next.tier].name }) : rc.topTier}</p>
        </div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIERS.map((x, i) => {
            const reached = i <= idx
            return (
              <li
                key={x.tier}
                aria-current={x.tier === tier ? "step" : undefined}
                className={cn(
                  "rounded-md border-2 p-3",
                  x.tier === tier ? "border-foreground bg-accent text-accent-foreground" : reached ? "border-foreground/40" : "border-dashed border-border text-muted-foreground"
                )}
              >
                <p className="flex items-baseline justify-between gap-2">
                  <span className="font-bold">{rc.tiers[x.tier].name}</span>
                  <span className="font-mono text-xs">{x.min}+</span>
                </p>
                <p className="mt-1 text-xs">{rc.tiers[x.tier].unlock}</p>
              </li>
            )
          })}
        </ol>
      </div>
      <dl className="grid grid-cols-3 divide-x border-t">
        {[
          { k: rc.stats.helps, v: state.profile.verifiedHelps },
          { k: rc.stats.raised, v: state.profile.alertsRaised },
          { k: rc.stats.flags, v: state.profile.flagsAgainst },
        ].map((s) => (
          <div key={s.k} className="px-4 py-3">
            <dt className="text-xs text-muted-foreground">{s.k}</dt>
            <dd className="font-mono text-2xl font-semibold">{s.v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

function WalletPanel() {
  const { state, approve, pending } = useDemo()
  const { d, locale } = useCopy()
  const rc = d.record
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const busy = status.kind === "signing" || pending?.action === "approve"
  const amount = (v: number) => (
    <TokenAmount value={BigInt(Math.round(v * 1_000_000))} decimals={6} fractionDigits={2} symbol={TOKEN} locale={intlLocale[locale]} className="text-2xl font-semibold" />
  )
  return (
    <Panel>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sign text-lg">{rc.wallet}</h2>
          <Wallet address={state.profile.address} name={d.wallet.you} size="sm" />
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">{rc.balance}</dt>
            <dd>{amount(state.profile.balance)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{rc.allowance}</dt>
            <dd>{amount(state.profile.allowance)}</dd>
          </div>
        </dl>
        <div>
          <p className="text-sm font-semibold">{rc.changeAllowance}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ALLOWANCE_CHOICES.map((a) => (
              <Button
                key={a}
                variant="outline"
                className="font-mono"
                disabled={busy}
                onClick={async () => {
                  setStatus({ kind: "signing" })
                  const res = await approve(a)
                  setStatus(
                    res.ok
                      ? { kind: "confirmed", text: t(rc.allowanceSet, { amount: formatAmount(a, locale) }), hash: res.hash }
                      : failText(res, d.setup.failed, d.setup.rejected)
                  )
                }}
              >
                <ShieldCheckIcon aria-hidden="true" />
                {a}
              </Button>
            ))}
          </div>
        </div>
        {pending?.action === "approve" ? <StatusLine status={{ kind: "pending", text: d.pending }} /> : null}
        <StatusLine status={status} />
      </div>
    </Panel>
  )
}

function Ledger() {
  const { state } = useDemo()
  const { d, locale } = useCopy()
  const rc = d.record
  return (
    <Panel>
      <h2 className="border-b-2 border-foreground px-5 py-3 font-sign text-lg">{rc.ledger}</h2>
      {state.ledger.length ? (
        <ul className="divide-y">
          {state.ledger.map((e) => (
            <li key={e.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 px-5 py-3">
              <span className="font-semibold">{rc.kinds[e.kind]}</span>
              <span
                className={cn(
                  "text-right font-mono font-semibold tabular-nums",
                  e.status === "failed" ? "text-muted-foreground line-through" : e.amount > 0 ? "text-primary" : ""
                )}
              >
                {e.amount !== 0 ? `${formatSigned(e.amount, locale)} ${TOKEN}` : "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(e.at, locale)} · <span className="font-mono">{truncateHash(e.hash)}</span>
              </span>
              <span className={cn("text-right text-xs font-semibold", e.status === "failed" ? "text-destructive" : "text-muted-foreground")}>
                {e.status === "failed" ? rc.failed : t(rc.block, { n: e.block.toLocaleString(intlLocale[locale]) })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">{rc.ledgerEmpty}</p>
      )}
    </Panel>
  )
}

function History() {
  const { state } = useDemo()
  const { d, locale } = useCopy()
  const rc = d.record
  return (
    <Panel>
      <h2 className="border-b-2 border-foreground px-5 py-3 font-sign text-lg">{rc.history}</h2>
      {state.history.length ? (
        <ul className="divide-y">
          {state.history.map((h) => (
            <li key={`${h.id}-${h.at}`} className="px-5 py-3">
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{rc.roles[h.role]}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(h.at, locale)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {d.raise.situations[h.situation]} · {rc.outcomes[h.outcome]}
                {h.amount ? (
                  <span className={cn("ml-2 font-mono font-semibold", h.amount > 0 ? "text-primary" : "text-foreground")}>
                    {formatSigned(h.amount, locale)} {TOKEN}
                  </span>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">{rc.historyEmpty}</p>
      )}
    </Panel>
  )
}

export function RecordView() {
  const { state } = useDemo()
  const { d } = useCopy()
  const rc = d.record
  if (!state.connected)
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-6">
        <Gate note={rc.connectFirst} />
      </div>
    )
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sign text-2xl sm:text-3xl">{rc.title}</h1>
        </div>
        <ResetDialog
          trigger={
            <Button variant="destructive">
              <RotateCcwIcon aria-hidden="true" />
              {rc.reset}
            </Button>
          }
        />
      </div>
      <Reputation />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <WalletPanel />
          <History />
        </div>
        <Ledger />
      </div>
    </div>
  )
}
