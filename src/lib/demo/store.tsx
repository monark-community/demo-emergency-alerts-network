"use client"

import * as React from "react"

import { latencyMs, makeHash, makeId, sleep } from "./chain"
import { DEPOSIT_FOR_RADIUS, SENDER_CODE, seedState, spawnIncoming, tierFor, TRUSTED_AT } from "./seed"
import { applyOutgoingSettlement, incomingStage, reconcile, settleOutgoing } from "./sim"
import type { DemoState, FlagReason, LedgerKind, RadiusM, Situation, TxRequest, TxResult } from "./types"

const STORAGE_KEY = "guardian-demo:v1"
const TICK_MS = 250

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    return parsed?.version === 1 ? parsed : null
  } catch {
    return null
  }
}

function save(state: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private mode or storage full: the demo keeps working in memory.
  }
}

function clear() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function ledger(s: DemoState, kind: LedgerKind, amount: number, hash: string, block: number, at: number, alertId?: string): DemoState {
  return {
    ...s,
    ledger: [{ id: makeId("l"), kind, amount, at, hash, block, status: "confirmed", alertId }, ...s.ledger],
  }
}

export interface PromptState {
  request: TxRequest
  resolve: (answer: "confirm" | "reject") => void
}

export type CheckInResult = TxResult | { ok: false; reason: "wrong-code" }

interface DemoContextValue {
  state: DemoState
  hydrated: boolean
  /** Simulated "now" (includes Skip ahead). Ticks four times a second. */
  now: number
  prompt: PromptState | null
  pending: TxRequest | null
  answerPrompt: (answer: "confirm" | "reject") => void
  connect: () => Promise<TxResult>
  disconnect: () => void
  approve: (amount: number) => Promise<TxResult>
  raise: (situation: Situation, radius: RadiusM) => Promise<TxResult>
  release: () => Promise<TxResult>
  cancelOutgoing: () => Promise<TxResult>
  dismissOutgoing: () => void
  accept: (id: string) => Promise<TxResult>
  decline: (id: string) => void
  checkIn: (id: string, code: string) => Promise<CheckInResult>
  flag: (id: string, reason: FlagReason) => Promise<TxResult>
  clearIncoming: (id: string) => void
  simulateIncoming: () => string
  skipAhead: (ms: number) => void
  setFailNext: (value: boolean) => void
  reset: () => void
}

const DemoContext = React.createContext<DemoContextValue | null>(null)

export function useDemo(): DemoContextValue {
  const ctx = React.useContext(DemoContext)
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>")
  return ctx
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DemoState>(() => seedState(0))
  const [hydrated, setHydrated] = React.useState(false)
  const [now, setNow] = React.useState(0)
  const [prompt, setPrompt] = React.useState<PromptState | null>(null)
  const [pending, setPending] = React.useState<TxRequest | null>(null)
  // Every state change goes through a path that also updates this ref, so async flows read fresh state.
  const stateRef = React.useRef(state)

  const simNow = React.useCallback(() => Date.now() + stateRef.current.clockOffset, [])

  // Hydrate from localStorage after mount (the server render uses the seed).
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const stored = load()
      const initial = stored ?? seedState(Date.now())
      stateRef.current = initial
      setState(initial)
      setNow(Date.now() + initial.clockOffset)
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  React.useEffect(() => {
    if (hydrated) save(state)
  }, [state, hydrated])

  // The clock: advance "now" and apply whatever happens on its own.
  React.useEffect(() => {
    if (!hydrated) return
    const id = window.setInterval(() => {
      const t = Date.now() + stateRef.current.clockOffset
      setNow(t)
      const next = reconcile(stateRef.current, t)
      if (next !== stateRef.current) {
        stateRef.current = next
        setState(next)
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [hydrated])

  const update = React.useCallback((fn: (s: DemoState) => DemoState) => {
    const next = fn(stateRef.current)
    stateRef.current = next
    setState(next)
  }, [])

  const promptRef = React.useRef<PromptState | null>(null)

  const openPrompt = React.useCallback(
    (request: TxRequest) =>
      new Promise<"confirm" | "reject">((resolve) => {
        promptRef.current?.resolve("reject")
        const next = { request, resolve }
        promptRef.current = next
        setPrompt(next)
      }),
    []
  )

  const answerPrompt = React.useCallback((answer: "confirm" | "reject") => {
    const current = promptRef.current
    promptRef.current = null
    setPrompt(null)
    current?.resolve(answer)
  }, [])

  /** Wallet prompt → pending → confirmed or failed. `apply` books the confirmed effects. */
  const runTx = React.useCallback(
    async (request: TxRequest, kind: LedgerKind, apply: (s: DemoState, hash: string, block: number, at: number) => DemoState, alertId?: string): Promise<TxResult> => {
      const answer = await openPrompt(request)
      if (answer === "reject") return { ok: false, reason: "rejected" }
      setPending(request)
      await sleep(latencyMs())
      setPending(null)
      const hash = makeHash()
      const at = simNow()
      if (stateRef.current.failNext) {
        update((s) => ({
          ...s,
          failNext: false,
          ledger: [{ id: makeId("l"), kind, amount: 0, at, hash, block: s.block, status: "failed", alertId }, ...s.ledger],
        }))
        return { ok: false, reason: "failed", hash }
      }
      let block = 0
      update((s) => {
        block = s.block + 1 + Math.floor(Math.random() * 3)
        return apply({ ...s, block }, hash, block, at)
      })
      return { ok: true, hash, block }
    },
    [openPrompt, simNow, update]
  )

  const connect = React.useCallback(async (): Promise<TxResult> => {
    const answer = await openPrompt({ action: "connect" })
    if (answer === "reject") return { ok: false, reason: "rejected" }
    setPending({ action: "connect" })
    await sleep(700)
    setPending(null)
    update((s) => ({ ...s, connected: true }))
    return { ok: true, hash: "", block: 0 }
  }, [openPrompt, update])

  const disconnect = React.useCallback(() => update((s) => ({ ...s, connected: false })), [update])

  const approve = React.useCallback(
    (amount: number) =>
      runTx({ action: "approve", amount }, "approve", (s, hash, block, at) =>
        ledger({ ...s, profile: { ...s.profile, allowance: amount } }, "approve", 0, hash, block, at)
      ),
    [runTx]
  )

  const raise = React.useCallback(
    (situation: Situation, radius: RadiusM) => {
      const deposit = DEPOSIT_FOR_RADIUS[radius]
      const id = makeId("a")
      return runTx(
        { action: "raise", amount: deposit },
        "deposit",
        (s, hash, block, at) =>
          ledger(
            {
              ...s,
              outgoing: { id, situation, radius, deposit, code: SENDER_CODE, raisedAt: at, txHash: hash, phase: "live" },
              profile: {
                ...s.profile,
                balance: s.profile.balance - deposit,
                allowance: Math.max(0, s.profile.allowance - deposit),
                alertsRaised: s.profile.alertsRaised + 1,
              },
            },
            "deposit",
            -deposit,
            hash,
            block,
            at,
            id
          ),
        id
      )
    },
    [runTx]
  )

  const release = React.useCallback(() => {
    const out = stateRef.current.outgoing
    return runTx({ action: "release", amount: out?.deposit }, "release", (s, hash, block, at) => {
      if (!s.outgoing || s.outgoing.phase !== "live") return s
      const settled = settleOutgoing(s.outgoing, "safe", at)
      return applyOutgoingSettlement(ledger(s, "release", 0, hash, block, at, settled.id), settled)
    }, out?.id)
  }, [runTx])

  const cancelOutgoing = React.useCallback(() => {
    const out = stateRef.current.outgoing
    return runTx({ action: "cancel", amount: out?.deposit }, "cancel", (s, hash, block, at) => {
      if (!s.outgoing || s.outgoing.phase !== "live") return s
      const settled = settleOutgoing(s.outgoing, "cancelled", at)
      return applyOutgoingSettlement(ledger(s, "cancel", 0, hash, block, at, settled.id), settled)
    }, out?.id)
  }, [runTx])

  const dismissOutgoing = React.useCallback(() => update((s) => ({ ...s, outgoing: null })), [update])

  const accept = React.useCallback(
    (id: string) =>
      runTx({ action: "accept" }, "accept", (s, hash, block, at) =>
        ledger(
          {
            ...s,
            incoming: s.incoming.map((a) => (a.id === id ? { ...a, phase: "accepted" as const, acceptedAt: at } : a)),
          },
          "accept",
          0,
          hash,
          block,
          at,
          id
        ),
        id
      ),
    [runTx]
  )

  const decline = React.useCallback(
    (id: string) => update((s) => ({ ...s, incoming: s.incoming.map((a) => (a.id === id ? { ...a, phase: "declined" as const } : a)) })),
    [update]
  )

  const checkIn = React.useCallback(
    async (id: string, code: string): Promise<CheckInResult> => {
      const alert = stateRef.current.incoming.find((a) => a.id === id)
      if (!alert || code.trim() !== alert.code) return { ok: false, reason: "wrong-code" }
      return runTx({ action: "checkin" }, "checkin", (s, hash, block, at) =>
        ledger(
          { ...s, incoming: s.incoming.map((a) => (a.id === id ? { ...a, phase: "checked-in" as const, checkedInAt: at } : a)) },
          "checkin",
          0,
          hash,
          block,
          at,
          id
        ),
        id
      )
    },
    [runTx]
  )

  const flag = React.useCallback(
    (id: string, reason: FlagReason) =>
      runTx({ action: "flag" }, "flag", (s, hash, block, at) =>
        ledger(
          { ...s, incoming: s.incoming.map((a) => (a.id === id ? { ...a, phase: "flagged" as const, flaggedAt: at, flagReason: reason } : a)) },
          "flag",
          0,
          hash,
          block,
          at,
          id
        ),
        id
      ),
    [runTx]
  )

  const clearIncoming = React.useCallback(
    (id: string) => update((s) => ({ ...s, incoming: s.incoming.filter((a) => a.id !== id) })),
    [update]
  )

  const simulateIncoming = React.useCallback(() => {
    const s = stateRef.current
    const alert = spawnIncoming(s.nextTemplate, simNow(), Math.random().toString(36).slice(2, 8))
    update((prev) => ({
      ...prev,
      nextTemplate: prev.nextTemplate + 1,
      // Keep the list short: finished alerts make way for the new one.
      incoming: [alert, ...prev.incoming.filter((a) => a.phase === "open" || a.phase === "accepted" || a.phase === "checked-in" || a.phase === "flagged")].slice(0, 4),
    }))
    return alert.id
  }, [simNow, update])

  const skipAhead = React.useCallback((ms: number) => update((s) => ({ ...s, clockOffset: s.clockOffset + ms })), [update])

  const setFailNext = React.useCallback((value: boolean) => update((s) => ({ ...s, failNext: value })), [update])

  const reset = React.useCallback(() => {
    clear()
    const fresh = seedState(Date.now())
    stateRef.current = fresh
    setState(fresh)
    setNow(Date.now())
    promptRef.current?.resolve("reject")
    promptRef.current = null
    setPrompt(null)
    setPending(null)
  }, [])

  const value = React.useMemo<DemoContextValue>(
    () => ({
      state,
      hydrated,
      now,
      prompt,
      pending,
      answerPrompt,
      connect,
      disconnect,
      approve,
      raise,
      release,
      cancelOutgoing,
      dismissOutgoing,
      accept,
      decline,
      checkIn,
      flag,
      clearIncoming,
      simulateIncoming,
      skipAhead,
      setFailNext,
      reset,
    }),
    [state, hydrated, now, prompt, pending, answerPrompt, connect, disconnect, approve, raise, release, cancelOutgoing, dismissOutgoing, accept, decline, checkIn, flag, clearIncoming, simulateIncoming, skipAhead, setFailNext, reset]
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export { incomingStage, tierFor, TRUSTED_AT }
