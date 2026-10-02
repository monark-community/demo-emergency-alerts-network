/**
 * Pure, time-driven simulation. Every derived status is a function of the
 * persisted state and "now", so a reload or "Skip ahead" lands in the right place.
 */
import { makeHash, makeId } from "./chain"
import {
  RESPONDER_SCRIPTS,
  RESPONDERS,
  respondersWithin,
  SENDER_CONFIRM_MS,
  WALK_COMP,
  WINDOW_MS,
} from "./seed"
import type { DemoState, IncomingAlert, OutgoingAlert, OutgoingOutcome, Payout, Point, Responder } from "./types"

export function routeLength(route: Point[]): number {
  let total = 0
  for (let i = 1; i < route.length; i++) total += Math.hypot(route[i]!.x - route[i - 1]!.x, route[i]!.y - route[i - 1]!.y)
  return total
}

export function pointAlong(route: Point[], fraction: number): Point {
  const f = Math.min(1, Math.max(0, fraction))
  const target = routeLength(route) * f
  let walked = 0
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]!
    const b = route[i]!
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (walked + seg >= target) {
      const t = seg === 0 ? 0 : (target - walked) / seg
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    walked += seg
  }
  return route[route.length - 1]!
}

/** The part of the route still to walk, starting at the current position. */
export function remainingRoute(route: Point[], fraction: number): Point[] {
  const f = Math.min(1, Math.max(0, fraction))
  const target = routeLength(route) * f
  let walked = 0
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]!
    const b = route[i]!
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (walked + seg >= target) return [pointAlong(route, f), ...route.slice(i)]
    walked += seg
  }
  return [route[route.length - 1]!]
}

export type ResponderStatus = "notified" | "on-the-way" | "arrived" | "checked-in" | "stood-down"

export interface OutgoingResponderView {
  responder: Responder
  notifiedAt: number
  status: ResponderStatus
  pos: Point
  etaMs: number
  acceptedAt?: number
  arrivedAt?: number
  checkedInAt?: number
  route?: Point[]
  progress: number
}

const NOTIFY_STAGGER_MS = 380

/** Everyone the alert reached, with what they are doing at `now`. Hidden until notified. */
export function outgoingView(alert: OutgoingAlert, now: number): OutgoingResponderView[] {
  const t = alert.phase === "resolved" && alert.resolvedAt ? Math.min(now, alert.resolvedAt) : now
  const reached = respondersWithin(alert.radius)
  const views: OutgoingResponderView[] = []
  reached.forEach((responder, i) => {
    const notifiedAt = alert.raisedAt + 500 + i * NOTIFY_STAGGER_MS
    if (t < notifiedAt) return
    const script = RESPONDER_SCRIPTS.find((s) => s.responderId === responder.id)
    const base: OutgoingResponderView = {
      responder,
      notifiedAt,
      status: "notified",
      pos: responder.home,
      etaMs: 0,
      progress: 0,
    }
    if (!script) {
      views.push(base)
      return
    }
    const acceptedAt = alert.raisedAt + script.acceptAfterMs
    const arrivedAt = acceptedAt + script.walkMs
    const checkedInAt = arrivedAt + script.checkInAfterMs
    if (t < acceptedAt) {
      views.push(base)
      return
    }
    const progress = Math.min(1, (t - acceptedAt) / script.walkMs)
    const view: OutgoingResponderView = {
      ...base,
      acceptedAt,
      arrivedAt,
      checkedInAt,
      route: responder.route,
      progress,
      pos: pointAlong(responder.route, progress),
      etaMs: Math.max(0, arrivedAt - t),
      status: t >= checkedInAt ? "checked-in" : t >= arrivedAt ? "arrived" : "on-the-way",
    }
    if (alert.phase === "resolved" && alert.stoodDown?.includes(responder.id)) view.status = "stood-down"
    views.push(view)
  })
  return views
}

export function firstCheckInAt(alert: OutgoingAlert): number | null {
  const times = outgoingView(alert, Number.POSITIVE_INFINITY)
    .map((v) => v.checkedInAt)
    .filter((x): x is number => typeof x === "number")
  return times.length ? Math.min(...times) : null
}

/** Close an outgoing alert: work out who gets what, and refund the rest. */
export function settleOutgoing(alert: OutgoingAlert, outcome: OutgoingOutcome, at: number): OutgoingAlert {
  const views = outgoingView({ ...alert, phase: "live" }, at)
  const checkedIn = views.filter((v) => v.status === "checked-in")
  const accepted = views.filter((v) => v.acceptedAt !== undefined && v.status !== "checked-in")
  let payouts: Payout[] = []
  let refund = 0
  if (outcome === "cancelled") {
    const walkers = views.filter((v) => v.acceptedAt !== undefined)
    const comp = Math.min(WALK_COMP, walkers.length ? alert.deposit / walkers.length : 0)
    payouts = walkers.map((v) => ({ responderId: v.responder.id, amount: comp, kind: "walk" as const }))
    refund = Math.max(0, alert.deposit - comp * walkers.length)
  } else if (checkedIn.length) {
    const share = alert.deposit / checkedIn.length
    payouts = checkedIn.map((v) => ({ responderId: v.responder.id, amount: share, kind: "share" as const }))
  } else {
    refund = alert.deposit
  }
  return {
    ...alert,
    phase: "resolved",
    resolvedAt: at,
    outcome,
    payouts,
    refund,
    stoodDown: outcome === "cancelled" ? [] : accepted.map((v) => v.responder.id),
  }
}

export type IncomingStage = "open" | "walking" | "arrived" | "checked-in" | "paid" | "flagged" | "upheld" | "declined"

export function incomingStage(alert: IncomingAlert, now: number): IncomingStage {
  if (alert.phase === "accepted") {
    return alert.acceptedAt !== undefined && now >= alert.acceptedAt + alert.walkMs ? "arrived" : "walking"
  }
  return alert.phase === "open" ? "open" : alert.phase
}

export function incomingProgress(alert: IncomingAlert, now: number): number {
  if (alert.acceptedAt === undefined) return 0
  if (alert.phase !== "accepted") return 1
  return Math.min(1, (now - alert.acceptedAt) / alert.walkMs)
}

function addLedger(state: DemoState, entry: Omit<DemoState["ledger"][number], "id" | "hash" | "block" | "status">): DemoState {
  const block = state.block + 3
  return {
    ...state,
    block,
    ledger: [{ ...entry, id: makeId("l"), hash: makeHash(), block, status: "confirmed" }, ...state.ledger],
  }
}

/** Apply everything that happens on its own with time: payouts, auto-release, upheld flags. */
export function reconcile(state: DemoState, now: number): DemoState {
  let next = state

  // Sender side: auto-release 30 (demo: 20 s) after the first check-in if the sender hasn't answered.
  const out = next.outgoing
  if (out && out.phase === "live") {
    const first = firstCheckInAt(out)
    if (first !== null && now >= first + WINDOW_MS) {
      const settled = settleOutgoing(out, "auto", first + WINDOW_MS)
      next = applyOutgoingSettlement(next, settled)
    }
  }

  // Responder side: the sender confirms, or an unanswered flag is upheld.
  let changed = false
  const incoming = next.incoming.map((a) => {
    if (a.phase === "checked-in" && a.checkedInAt !== undefined && now >= a.checkedInAt + SENDER_CONFIRM_MS) {
      changed = true
      const reward = Math.round((a.deposit / (1 + a.alsoGoing.length)) * 100) / 100
      return { ...a, phase: "paid" as const, settledAt: a.checkedInAt + SENDER_CONFIRM_MS, reward }
    }
    if (a.phase === "flagged" && a.flaggedAt !== undefined && now >= a.flaggedAt + WINDOW_MS) {
      changed = true
      return { ...a, phase: "upheld" as const, settledAt: a.flaggedAt + WINDOW_MS, reward: a.deposit }
    }
    return a
  })
  if (changed) {
    for (const a of incoming) {
      const before = next.incoming.find((b) => b.id === a.id)
      if (!before || before.phase === a.phase) continue
      const reward = a.reward ?? 0
      const paid = a.phase === "paid"
      next = addLedger(next, { kind: paid ? "reward" : "compensation", amount: reward, at: a.settledAt ?? now, alertId: a.id })
      next = {
        ...next,
        profile: {
          ...next.profile,
          balance: next.profile.balance + reward,
          score: Math.min(100, next.profile.score + (paid ? 6 : 2)),
          verifiedHelps: next.profile.verifiedHelps + (paid ? 1 : 0),
        },
        history: [
          { id: a.id, role: "responder", situation: a.situation, at: a.settledAt ?? now, outcome: paid ? "paid" : "upheld", amount: reward },
          ...next.history,
        ],
      }
    }
    next = { ...next, incoming }
  }
  return next
}

/** Book an outgoing settlement: refund to the sender's balance, history entry. */
export function applyOutgoingSettlement(state: DemoState, settled: OutgoingAlert): DemoState {
  let next: DemoState = { ...state, outgoing: settled }
  if (settled.refund && settled.refund > 0) {
    next = addLedger(next, { kind: "refund", amount: settled.refund, at: settled.resolvedAt ?? Date.now(), alertId: settled.id })
    next = { ...next, profile: { ...next.profile, balance: next.profile.balance + settled.refund } }
  }
  const outcome = settled.outcome === "cancelled" ? "cancelled" : settled.outcome === "auto" ? "auto" : "safe"
  next = {
    ...next,
    history: [
      {
        id: settled.id,
        role: "sender",
        situation: settled.situation,
        at: settled.resolvedAt ?? Date.now(),
        outcome,
        amount: -(settled.deposit - (settled.refund ?? 0)),
      },
      ...next.history,
    ],
  }
  return next
}

export function responderById(id: string): Responder | undefined {
  return RESPONDERS.find((r) => r.id === id)
}
