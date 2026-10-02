"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAddress } from "@/components/ui/wallet"
import { GuardianMark } from "@/components/site/brand"
import { t } from "@/i18n/t"
import { NETWORK_NAME } from "@/lib/demo/chain"
import { useDemo } from "@/lib/demo/store"
import { formatAmount } from "@/lib/format"

import { useCopy } from "./app-context"
import { TestnetNote } from "./parts"

/** The simulated wallet: every transaction in the demo passes through this prompt. */
export function WalletPrompt() {
  const { prompt, answerPrompt, state } = useDemo()
  const { d, locale, c } = useCopy()
  const req = prompt?.request
  const p = d.prompt
  const action = req ? t(p.actions[req.action], { amount: req.amount !== undefined ? formatAmount(req.amount, locale) : "" }) : ""
  const movesValue = req?.action === "approve" || req?.action === "raise" || req?.action === "release"
  return (
    <Dialog open={!!prompt} onOpenChange={(open) => (!open ? answerPrompt("reject") : undefined)}>
      <DialogContent closeLabel={c.close} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <GuardianMark className="size-9" />
            <div className="text-left">
              <DialogTitle className="font-sign text-base">{p.title}</DialogTitle>
              <p className="text-xs text-muted-foreground">{p.subtitle}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{p.request}</p>
            <DialogDescription className="mt-1 text-base font-semibold text-foreground">{action}</DialogDescription>
          </div>
          <dl className="divide-y rounded-md border text-sm">
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-muted-foreground">{p.account}</dt>
              <dd>
                <WalletAddress address={state.profile.address} className="text-xs" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-muted-foreground">{p.network}</dt>
              <dd>
                <NetworkBadge name={NETWORK_NAME} variant="outline" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-muted-foreground">{p.fee}</dt>
              <dd className="font-mono text-xs">{req?.action === "connect" ? p.feeNone : p.feeValue}</dd>
            </div>
          </dl>
          {movesValue ? <TestnetNote /> : null}
        </div>
        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="outline" className="flex-1" onClick={() => answerPrompt("reject")}>
            {p.reject}
          </Button>
          <Button className="flex-1" onClick={() => answerPrompt("confirm")}>
            {p.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
