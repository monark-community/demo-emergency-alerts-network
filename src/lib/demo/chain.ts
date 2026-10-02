/**
 * The simulated chain: hashes, blocks and latency. Deliberately tiny so it can be
 * replaced by wagmi/viem calls (writeContract + waitForTransactionReceipt).
 * Math.random is used on purpose: crypto.randomUUID is unavailable on plain-http LAN previews.
 */

export const NETWORK_NAME = "Base Sepolia"
export const TOKEN = "tUSDC"
export const EXPLORER_URL = undefined

const HEX = "0123456789abcdef"

export function randomHex(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) out += HEX[Math.floor(Math.random() * 16)]
  return out
}

export function makeHash(): string {
  return `0x${randomHex(64)}`
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/** Realistic confirmation latency for an L2 testnet: 1.2–2.4 s. */
export function latencyMs(): number {
  return 1200 + Math.floor(Math.random() * 1200)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
