/**
 * Guardian demo domain types. Everything here is simulated in the browser; the
 * shapes mirror what an on-chain alert contract and an indexer would expose, so
 * the UI could later be pointed at wagmi/viem without changing components.
 */

export type Situation = "followed" | "unsafe" | "hurt" | "other"
export type RadiusM = 150 | 300 | 500
export type Tier = "new" | "neighbour" | "trusted" | "steward"

/** Map coordinates in the demo's Milton-Parc drawing (1 unit = 1.5 m). */
export interface Point {
  x: number
  y: number
}

export interface Responder {
  id: string
  name: string
  address: `0x${string}`
  score: number
  firstAid: boolean
  /** Where they are when the alert goes out. */
  home: Point
  /** Street route to the sender, first point = home. */
  route: Point[]
}

/** Scripted behaviour for the responders who accept an outgoing alert. */
export interface ResponderScript {
  responderId: string
  acceptAfterMs: number
  walkMs: number
  checkInAfterMs: number
}

export type OutgoingPhase = "live" | "resolved"
export type OutgoingOutcome = "safe" | "cancelled" | "auto"

export interface Payout {
  responderId: string
  amount: number
  kind: "share" | "walk"
}

export interface OutgoingAlert {
  id: string
  situation: Situation
  radius: RadiusM
  deposit: number
  code: string
  raisedAt: number
  txHash: string
  phase: OutgoingPhase
  resolvedAt?: number
  outcome?: OutgoingOutcome
  payouts?: Payout[]
  refund?: number
  /** Responders asked to stand down (accepted but not checked in when it closed). */
  stoodDown?: string[]
}

export type IncomingPhase = "open" | "accepted" | "checked-in" | "paid" | "flagged" | "upheld" | "declined"
export type FlagReason = "nobody" | "denied" | "prank"

export interface IncomingAlert {
  id: string
  template: number
  situation: Situation
  senderName: string
  senderAddress: `0x${string}`
  senderScore: number
  area: string
  distanceM: number
  deposit: number
  code: string
  /** Other responders already heading there (the reward is split with them). */
  alsoGoing: string[]
  spawnedAt: number
  phase: IncomingPhase
  /** The approximate area shown before accepting (centre is offset from the pin). */
  areaCentre: Point
  pin: Point
  route: Point[]
  walkMs: number
  acceptedAt?: number
  checkedInAt?: number
  flaggedAt?: number
  flagReason?: FlagReason
  settledAt?: number
  reward?: number
  /** True for the alert that turns out to be a false alarm (nobody at the pin). */
  hoax?: boolean
}

export type LedgerKind =
  | "approve"
  | "deposit"
  | "refund"
  | "reward"
  | "compensation"
  | "accept"
  | "checkin"
  | "flag"
  | "release"
  | "cancel"

export interface LedgerEntry {
  id: string
  kind: LedgerKind
  /** Signed change to the visitor's tUSDC balance (0 for non-value transactions). */
  amount: number
  at: number
  hash: string
  block: number
  status: "confirmed" | "failed"
  alertId?: string
}

export interface HistoryItem {
  id: string
  role: "sender" | "responder"
  situation: Situation
  at: number
  outcome: "safe" | "cancelled" | "auto" | "paid" | "upheld"
  amount: number
}

export interface Profile {
  address: `0x${string}`
  balance: number
  allowance: number
  score: number
  verifiedHelps: number
  alertsRaised: number
  flagsAgainst: number
}

export interface DemoState {
  version: 1
  connected: boolean
  profile: Profile
  outgoing: OutgoingAlert | null
  incoming: IncomingAlert[]
  ledger: LedgerEntry[]
  history: HistoryItem[]
  failNext: boolean
  /** Added to Date.now() by "Skip ahead" in demo controls. */
  clockOffset: number
  nextTemplate: number
  block: number
}

export type TxResult =
  | { ok: true; hash: string; block: number }
  | { ok: false; reason: "rejected" | "failed"; hash?: string }

export interface TxRequest {
  /** Dictionary key of the action shown in the wallet prompt. */
  action:
    | "connect"
    | "approve"
    | "raise"
    | "cancel"
    | "release"
    | "accept"
    | "checkin"
    | "flag"
  amount?: number
  /** Extra line shown in the prompt (already localized). */
  detail?: string
}
