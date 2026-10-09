# Guardian

**Help from the people already nearby.** Guardian asks neighbours within a few hundred metres to come to you when you feel unsafe. Your small deposit pays whoever verifiably shows up: they type the meet code on your screen, you tap "I'm safe", and the people who came split it. Cancel before anyone sets off and you get it back; raise a false alarm and it goes to the people who walked over, and your reputation drops.

Guardian brings neighbours, not emergency services. If a life is in danger, call 911 first.

This repository is an interactive demo: everything (wallet, network, responders, money) is simulated in the browser. Project brief: https://www.monark.io/en/project/emergency-alerts-network. Built with [Monark](https://www.monark.io).

## Run it locally

Requirements: Node 24 and pnpm 10.

```sh
pnpm install
pnpm dev          # http://localhost:3154
```

Other scripts:

```sh
pnpm lint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm build && pnpm start
pnpm screenshots  # with the production server running: Playwright screenshots into docs/screenshots/
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical host (default `https://guardian.monark.io`).

## What you can do in the demo

| Route | Flow |
|-|-|
| `/en/app` | Connect the demo wallet, pre-approve a maximum deposit, pick a situation and radius, **hold to raise**, watch responders accept and walk in on the map, show your meet code, tap "I'm safe" and see the deposit split. Or cancel. |
| `/en/app/respond` | See a nearby alert as an area only, accept it to unlock the exact pin, walk there, type the sender's code (a wrong code is refused), and get paid when they confirm. "Simulate a nearby alert" adds a false alarm you can flag. Medical alerts are locked below the Trusted tier. |
| `/en/app/record` | Reputation and tier ladder, balance and approved amount (change it), the full ledger with block numbers and failed transactions, alert history, **Reset demo**. |

Demo controls (the sliders button in the app bar): fail the next transaction, skip ahead one minute, simulate a nearby alert, reset.

## How the simulation works

All of it lives in `src/lib/demo/`, behind a small typed API so the UI could later be pointed at wagmi/viem without changes:

- `types.ts`: alerts, responders, ledger entries, transaction requests and results.
- `seed.ts`: the Milton-Parc (Montréal) map geometry, nine responders, scripted acceptances, incoming alert templates and the starting state.
- `chain.ts`: hashes, blocks and latency (1.2–2.4 s), `Base Sepolia` and `tUSDC`.
- `sim.ts`: pure functions of *(state, now)*: who was notified, where each responder is, ETAs, check-ins, settlement (shares, walk compensation, refunds), auto-release after the 30-minute window (20 s in the demo), sender confirmation and upheld flags.
- `store.tsx`: a React provider holding the state, a 250 ms clock, the wallet prompt (every transaction asks Confirm/Reject, then goes pending, then confirmed or failed), and persistence in `localStorage` (every access wrapped in try/catch; the demo works without storage).

Because every status is derived from timestamps, a reload or "Skip ahead" lands in the right place.

## Project structure

```
src/
  app/
    [locale]/              en and fr routes (proxy.ts redirects / by Accept-Language)
      (site)/              home, how-it-works, credits, pricing (unlinked, noindex), catch-all 404
      app/                 the demo: Get help, Respond, My record
      opengraph-image.tsx  per-locale OG image
    globals.css            Guardian tokens (light and dark) on top of the Monark UI registry theme
    icon.svg, robots.ts, sitemap.ts
  components/
    ui/                    shadcn and Monark UI registry components (wallet, connect-wallet, network-badge, tx-status, token-amount), re-themed
    site/                  header, footer, brand, locale switch, theme
    home/                  hero phone, privacy diagram, glyphs
    map/                   the code-drawn city map and its overlays
    demo/                  app shell, wallet prompt, flows
  i18n/                    typed EN/FR dictionaries
  lib/demo/                the simulated chain and wallet
docs/
  site-plan.md             product brief, identity, flows, content (matches what shipped)
  assets.md                photo credits and code-drawn assets
  screenshots/             Playwright screenshots, 390px and 1440px, light and dark, EN and FR
```

## Deploy to Vercel

Import the repository in Vercel and deploy with the defaults: Next.js is detected automatically, there is no `vercel.json`, and no environment variables are required. The Node version is pinned in `package.json` (`engines.node: 24.x`) and `pnpm-lock.yaml` is committed.
