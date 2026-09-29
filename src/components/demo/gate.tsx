"use client"

import { WalletIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useDemo } from "@/lib/demo/store"

import { useCopy } from "./app-context"
import { Panel, StatusLine, type FlowStatus } from "./parts"

/** Step 1: connect the demo wallet. */
export function Gate({ note }: { note?: string }) {
  const { connect, pending } = useDemo()
  const { d } = useCopy()
  const g = d.gate
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })
  const busy = status.kind === "signing" || pending?.action === "connect"
  return (
    <Panel className="overflow-hidden">
      <div className="border-b-2 border-foreground bg-muted px-5 py-3 font-mono text-xs font-semibold tracking-wide uppercase">{g.eyebrow}</div>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h1 className="font-sign text-2xl leading-tight sm:text-3xl">{g.title}</h1>
          <p className="mt-3 text-muted-foreground">{note ?? g.body}</p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={busy}
          onClick={async () => {
            setStatus({ kind: "signing" })
            const res = await connect()
            setStatus(res.ok ? { kind: "idle" } : { kind: "error", text: g.rejected })
          }}
        >
          <WalletIcon aria-hidden="true" />
          {busy ? d.wallet.connecting : g.connect}
        </Button>
        <StatusLine status={status} />
      </div>
    </Panel>
  )
}
