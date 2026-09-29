import type {
  DemoState,
  HistoryItem,
  IncomingAlert,
  LedgerEntry,
  Point,
  RadiusM,
  Responder,
  ResponderScript,
  Situation,
  Tier,
} from "./types"

/*
 * The demo is set in Milton-Parc, Montréal, next to the university campus.
 * The map is a 600 × 600 drawing where 1 unit = 1.5 m.
 */
export const METRES_PER_UNIT = 1.5

export const STREETS = {
  vertical: [
    { x: 90, name: "University" },
    { x: 230, name: "Durocher" },
    { x: 370, name: "Hutchison" },
    { x: 500, name: "av. du Parc" },
  ],
  horizontal: [
    { y: 90, name: "av. des Pins" },
    { y: 230, name: "Prince-Arthur" },
    { y: 370, name: "Milton" },
    { y: 510, name: "Sherbrooke" },
  ],
} as const

/** The sender's position (Milton, between Durocher and Hutchison). */
export const SENDER_POS: Point = { x: 300, y: 370 }
/** The visitor's position when responding (Durocher, south of Prince-Arthur). */
export const RESPONDER_POS: Point = { x: 230, y: 330 }

export const RADII: RadiusM[] = [150, 300, 500]
export const DEPOSIT_FOR_RADIUS: Record<RadiusM, number> = { 150: 2, 300: 4, 500: 6 }
export const ALLOWANCE_CHOICES = [5, 10, 20] as const
export const SITUATIONS: Situation[] = ["followed", "unsafe", "hurt", "other"]

/** Compressed demo timing: walking ETAs are shown 10x slower than they run. */
export const DEMO_TIME_SCALE = 10
/** The 30-minute auto-release and dispute windows, compressed to 20 s. */
export const WINDOW_MS = 20_000
export const WINDOW_LABEL_MIN = 30
/** Delay before the simulated sender confirms they're safe in the responder flow. */
export const SENDER_CONFIRM_MS = 5_000
export const WALK_COMP = 1
export const TRUSTED_AT = 75

export function tierFor(score: number): Tier {
  if (score >= 90) return "steward"
  if (score >= TRUSTED_AT) return "trusted"
  if (score >= 50) return "neighbour"
  return "new"
}

export const TIERS: { tier: Tier; min: number }[] = [
  { tier: "new", min: 0 },
  { tier: "neighbour", min: 50 },
  { tier: "trusted", min: 75 },
  { tier: "steward", min: 90 },
]

const r = (
  id: string,
  name: string,
  address: `0x${string}`,
  score: number,
  firstAid: boolean,
  route: Point[]
): Responder => ({ id, name, address, score, firstAid, home: route[0]!, route })

export const RESPONDERS: Responder[] = [
  r("lea", "Léa T.", "0x8b3E41c07A9d2F56e1B0c4D7a93F2e6015C8dA42", 88, true, [
    { x: 230, y: 300 },
    { x: 230, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("omar", "Omar K.", "0x2F7a90D1c3B8e45A6f02d9C1E7b3A8546dF0c219", 71, false, [
    { x: 390, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("jonah", "Jonah B.", "0xC41d6E2a9F0b73D85c1A4e96B2f07D3a8E5c6B10", 58, false, [
    { x: 230, y: 430 },
    { x: 230, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("camille", "Camille R.", "0x6aD08F3b1E9c2475A0e8B6d3C1f94E27b5A07c3D", 80, false, [
    { x: 370, y: 230 },
    { x: 370, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("sunhee", "Sun-hee P.", "0x9E15bC7d3A2f0864D1c9E5a7B3f08C26d4E1a95F", 84, true, [
    { x: 370, y: 510 },
    { x: 370, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("noah", "Noah G.", "0x3C8f2A5e7D1b9064E3a0C6d8F2b41A7e9D5c0B36", 66, false, [
    { x: 120, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("priya", "Priya S.", "0xB7e04D9a1C6f3825E0b7A4c1D9e36F2a8C0d5E71", 93, true, [
    { x: 500, y: 230 },
    { x: 500, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("mateo", "Mateo A.", "0x0D6c3F8b2E5a1947C0d8B3e6A1f52D9c7E4b8A03", 34, false, [
    { x: 90, y: 180 },
    { x: 90, y: 370 },
    { x: 300, y: 370 },
  ]),
  r("aicha", "Aïcha D.", "0xE2a97C4f0B8d3651A9e2D7c0F4b83E1a6D9c2F58", 91, true, [
    { x: 560, y: 510 },
    { x: 500, y: 510 },
    { x: 500, y: 370 },
    { x: 300, y: 370 },
  ]),
]

export const RESPONDER_SCRIPTS: ResponderScript[] = [
  { responderId: "lea", acceptAfterMs: 3_200, walkMs: 12_000, checkInAfterMs: 2_600 },
  { responderId: "omar", acceptAfterMs: 5_400, walkMs: 17_000, checkInAfterMs: 2_600 },
]

export const SENDER_CODE = "4719"

export function distanceUnits(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function respondersWithin(radius: RadiusM): Responder[] {
  return RESPONDERS.filter((p) => distanceUnits(p.home, SENDER_POS) * METRES_PER_UNIT <= radius)
}

/** Incoming alerts the visitor can respond to, in the order "Simulate a nearby alert" spawns them. */
export const INCOMING_TEMPLATES: Omit<IncomingAlert, "id" | "template" | "spawnedAt" | "phase">[] = [
  {
    situation: "followed",
    senderName: "Amélie B.",
    senderAddress: "0x71cA3e9D0b5F2846a1E7c3B9d0F6a2E85C4b1D93",
    senderScore: 79,
    area: "Prince-Arthur × Hutchison",
    distanceM: 260,
    deposit: 4,
    code: "2863",
    alsoGoing: ["Camille R."],
    areaCentre: { x: 350, y: 250 },
    pin: { x: 370, y: 230 },
    route: [RESPONDER_POS, { x: 230, y: 230 }, { x: 370, y: 230 }],
    walkMs: 13_000,
  },
  {
    situation: "unsafe",
    senderName: "Kevin M.",
    senderAddress: "0x9c04B2e7A1d8F3560C9e2B7a4D1f08E36b5A2c7F",
    senderScore: 41,
    area: "av. du Parc × Milton",
    distanceM: 300,
    deposit: 2,
    code: "5170",
    alsoGoing: [],
    areaCentre: { x: 480, y: 330 },
    pin: { x: 500, y: 310 },
    route: [RESPONDER_POS, { x: 230, y: 370 }, { x: 500, y: 370 }, { x: 500, y: 310 }],
    walkMs: 12_000,
    hoax: true,
  },
  {
    situation: "hurt",
    senderName: "Hélène D.",
    senderAddress: "0x4Ee81B6c2D9a0F37E5b1C8d4A6f92B0e3D7c5A18",
    senderScore: 77,
    area: "Sherbrooke × University",
    distanceM: 240,
    deposit: 6,
    code: "9034",
    alsoGoing: ["Sun-hee P.", "Omar K."],
    areaCentre: { x: 175, y: 490 },
    pin: { x: 160, y: 510 },
    route: [RESPONDER_POS, { x: 230, y: 510 }, { x: 160, y: 510 }],
    walkMs: 12_000,
  },
]

const DAY = 86_400_000

export function spawnIncoming(template: number, now: number, idSuffix: string): IncomingAlert {
  const t = INCOMING_TEMPLATES[template % INCOMING_TEMPLATES.length]!
  return { ...t, id: `in-${idSuffix}`, template: template % INCOMING_TEMPLATES.length, spawnedAt: now, phase: "open" }
}

export function seedState(now: number): DemoState {
  const ledger: LedgerEntry[] = [
    { id: "l-4", kind: "reward", amount: 3, at: now - 9 * DAY + 5_400_000, hash: "0x5d0e8c21a7f94b3e60d2c8a19f7e4b05c3a6d182e9f07b4c5a1d3e8f2b6c9a07", block: 18_402_117, status: "confirmed", alertId: "a-hist-3" },
    { id: "l-3", kind: "checkin", amount: 0, at: now - 9 * DAY + 5_040_000, hash: "0x1c7b3e9f05a2d8c46e1f0b9a7d3c52e8f4a6b0d19c7e2f5a38b1d6c0e9f4a723", block: 18_402_031, status: "confirmed", alertId: "a-hist-3" },
    { id: "l-2", kind: "reward", amount: 2, at: now - 21 * DAY + 3_000_000, hash: "0xa93f1d07c6e2b5840f7a1c3e9d5b2f68a0c4e7d19b3f6a52c8e0d4b7f1a9c365", block: 17_981_554, status: "confirmed", alertId: "a-hist-2" },
    { id: "l-1", kind: "refund", amount: 2, at: now - 34 * DAY + 900_000, hash: "0x0e6c2a9d51f7b3e8c4a0d6f2b9e5c1a7d3f08b6e4c2a9f5d1b7e3c0a6f4d2b98", block: 17_522_870, status: "confirmed", alertId: "a-hist-1" },
    { id: "l-0", kind: "deposit", amount: -2, at: now - 34 * DAY, hash: "0x7f2b5e8a0c4d1f9b3e6a2c7d5f0b8e4a1c9d3f6b2e7a5c0d8f4b1e9a3c6d2f15", block: 17_522_801, status: "confirmed", alertId: "a-hist-1" },
  ]
  const history: HistoryItem[] = [
    { id: "a-hist-3", role: "responder", situation: "unsafe", at: now - 9 * DAY + 5_400_000, outcome: "paid", amount: 3 },
    { id: "a-hist-2", role: "responder", situation: "followed", at: now - 21 * DAY + 3_000_000, outcome: "paid", amount: 2 },
    { id: "a-hist-1", role: "sender", situation: "other", at: now - 34 * DAY, outcome: "cancelled", amount: 0 },
  ]
  return {
    version: 1,
    connected: false,
    profile: {
      address: "0x5e1C9a37D2b84F06a3cE7719b0D8f2A61c4E93b7",
      balance: 40,
      allowance: 0,
      score: 62,
      verifiedHelps: 7,
      alertsRaised: 1,
      flagsAgainst: 0,
    },
    outgoing: null,
    incoming: [spawnIncoming(0, now - 40_000, "seed")],
    ledger,
    history,
    failNext: false,
    clockOffset: 0,
    nextTemplate: 1,
    block: 18_655_300,
  }
}
