# Guardian: site plan

Guardian is an independent civic-safety product incubated by Monark (`monark-branded: false`). This plan is the source of truth for the rebuild on `develop`; it is kept in sync with what ships.

- Authoritative description: https://www.monark.io/en/project/emergency-alerts-network
- Old Lovable site (documentation only, not a spec): https://guardian.monark.io/ and the Vite source on `main`
- Target host: `guardian.monark.io`

Decisions made unattended are marked **Decision:** with the reason.

**Revision (restraint pass).** After the owner's "too loaded" feedback (brand guidelines §8 "Restraint" and §11), the site was cut down before shipping: the home page went from eight sections to five (the accountability table and the FAQ moved to `/how-it-works`, the campuses section and its photo were cut, "four moves" became three), the hero lost its eyebrow, `/how-it-works` lost "on-chain vs not" and "what Guardian is not" (covered by the FAQ), the FAQ went from six to five questions, and the app lost its explanatory paragraphs (situation hints, deposit explanation now behind a "How is it used?" disclosure, repeated testnet notes). The testnet notice now appears once per transaction, in the wallet prompt, and the footer carries only "Demo · simulated data". This plan describes what shipped.

---

## 1. Product brief

**Target users.**

1. *People who might need help*: students walking home from a late lab, a night-shift worker at a bus stop, someone whose friend has had too much to drink, an older neighbour who slipped on ice. They are scared or unsure, not necessarily in a life-threatening emergency, and they need a person nearby within minutes.
2. *Responders*: ordinary people already in the area (students, residents, shop staff, campus volunteers) who are willing to walk two minutes to check on someone, if they can trust the alert is real and their time is respected.
3. *Communities that host them* (secondary, for the business): campuses, neighbourhood associations and venues that want a trusted responder network and can sponsor deposits.

**Core job to be done.** "When I feel unsafe and 911 feels like too much or too slow, get a trustworthy person physically next to me in minutes, without broadcasting my exact location to strangers."

**Domain concepts** (the names used across the site and demo).

| Concept | Meaning |
|-|-|
| Alert | An on-chain request for in-person help: situation, radius, deposit, time. Tied to the sender's wallet. |
| Radius | 150 m, 300 m or 500 m. Only responders inside it are notified. |
| Safety deposit | A small amount the sender pre-approves once (the *allowance*) and that moves into the alert's pool when they raise one. It pays whoever verifiably shows up. |
| Responder | A wallet-bound person who can accept alerts nearby. Has a reputation score and tier. |
| Approximate area vs exact pin | Notified responders see a ~100 m area. Only responders who accept see the exact pin. |
| Meet code | A 4-digit code on the sender's screen. The responder types it on arrival: proof they met in person. |
| Check-in | The on-chain record that a responder arrived and verified the code. |
| Settlement | Sender taps "I'm safe": checked-in responders split the deposit. If the sender doesn't answer, it auto-releases after 30 minutes. |
| Flag | A responder who arrives to nobody (or a prank) flags the alert. If the sender doesn't dispute it, the deposit goes to responders who came and the sender's reputation drops. |
| Reputation tiers | New (0–49), Neighbour (50–74), Trusted (75–89), Steward (90+). Trusted responders see medical alerts; Stewards review disputed flags. |

**What the Lovable version got wrong or left out.**

- It implied Guardian "contacts emergency services" ("Emergency services contacted! Help is on the way"). That's dangerous. Guardian brings neighbours, not police, fire or ambulance, and the site must say "call 911 first" whenever life is at risk.
- It never showed the actual mechanism from the documentation: the pre-funded deposit, verified assistance, the payout to responders, and the accountability for false alarms. The core idea (help that is paid for, alarms that aren't free) was absent.
- No responder side: you could not accept an alert, walk to it, check in or get paid.
- No privacy model: it broadcast raw coordinates and asked for the browser's real geolocation.
- A single SEND ALERT button with no protection against pocket presses, no cancel path, and no failure states.
- Invented metrics ("2.3s avg response", "$12K rewards distributed"), a wallet-first gate in the hero, "Earn by helping" as the headline benefit, purple-to-red gradients and frosted glass.

## 2. Value proposition

**For people who feel unsafe on campus or in their neighbourhood, Guardian gets a verified neighbour to their side in minutes. Unlike a group chat or a panic button, a small deposit pays whoever actually shows up, so help is real and false alarms cost something.**

Supporting benefits (outcomes):

1. **Someone is beside you before you'd have finished explaining the situation to a dispatcher.** Only people within a few hundred metres are asked, and you watch them come.
2. **Strangers never learn where you are unless they've said yes.** Everyone else sees an approximate area; the exact pin goes only to the people on their way.
3. **Helping is worth someone's time, and crying wolf isn't free.** Responders who verifiably arrive are paid from your deposit and build a record; pranks cost the sender both.

## 3. Hero

- **Headline (EN):** "Help from the people already nearby." (6 words) · **FR:** « L'aide des gens déjà autour de vous. »
- **Subheadline (EN):** "Guardian asks neighbours within a few hundred metres to come to you when you feel unsafe. Your small deposit pays whoever verifiably shows up." · **FR:** « Guardian demande aux voisins à quelques centaines de mètres de venir vous rejoindre quand vous ne vous sentez pas en sécurité. Votre petit dépôt rémunère ceux qui se présentent vraiment. »
- **Primary CTA:** "Try the live demo" → `/{locale}/app` · **Secondary CTA:** "How it works" → `/{locale}/how-it-works`
- **Safety line under the CTAs:** "Life in danger? Call 911 first. Guardian brings neighbours, not emergency services."
- **Hero visual:** the product itself, built in code: a phone showing the Milton-Parc street map mid-alert, with the radius rings rolling out, two responder pins moving in, and the status card "Léa · Trusted · 2 min away". The rings animate once on load (static with reduced motion). **Why:** the moment Guardian works is the whole pitch; a photo of a worried person would be a cliché and a diagram would be abstract.

## 4. Page map

Every route lives under `/[locale]` (`en`, `fr`); `/` redirects by `Accept-Language` (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` | Explain the product in 60 seconds and send people to the demo | Hero (phone mid-alert, 911 safety line) · 1 "The gap" (photo, one line) · 2 Three moves (hold to raise, meet in person, settle) · 3 Privacy (area vs pin diagram, night band) · 4 Be a responder (photo) · 5 Closing CTA |
| `/app` | Interactive demo: raise an alert (sender view) | App shell · setup gate (connect, pre-approve) · situation + radius + hold-to-raise · live map and responder list · meet code · settle |
| `/app/respond` | Interactive demo: responder view | Nearby alerts (or empty state) · accept · walk (map) · meet code entry · awaiting confirmation · paid / flagged |
| `/app/record` | Your record: reputation, wallet, ledger, allowance | Reputation and tier ladder · wallet and allowance (change it) · ledger of every simulated tx · alert history · Reset demo |
| `/how-it-works` | The rules in full, for sceptical users and institutions | Lifecycle diagram · accountability rules table · where the deposit goes (per radius) · who sees what · reputation tiers and changes · FAQ (5) · CTA to the demo |
| `/credits` | Photo credits and licences | Photographer list |
| `/pricing` | Internal strategy review only (never linked, noindex) | Three plans · reasoning · what is never charged |
| 404 | Friendly not-found | Message · links home and to the demo |

**Justification for extra pages.** `/how-it-works` exists because the rules (who pays whom, when, and what a false alarm costs) are the product's trust contract; campuses and sceptical users need them written out in full and they don't fit on the home page. `/credits` is required for photo licensing. No `/use-cases` or `/developers` page: the audience is the public and community organisers, and the two scenarios (sender, responder) are already the demo's two tabs.

**Header:** Guardian wordmark · "How it works" · "Demo" · EN/FR switch · theme toggle · primary button "Open the demo" (inside the app: the wallet control instead). Mobile: wordmark + menu button opening a sheet with the same items.

**Footer:** one-line description · links (Home, How it works, Demo, Credits, Project brief, Source code) · "Demo · simulated data" chip · © year Guardian · photo credits link · "Built with Monark" credit (muted, 13px). No pricing link. The testnet notice lives only in the wallet prompt of value-moving transactions.

**App shell:** one top bar (wordmark, "Demo · simulated data" chip, tabs on desktop, network badge on wide screens, EN/FR, theme, demo controls, wallet), tabs "Get help" / "Respond" / "My record" (bottom bar on mobile), demo controls sheet (fail next transaction, skip ahead 1 min, simulate a nearby alert, reset demo; EN/FR and theme on mobile). Toasts sit top-right on desktop and at the top (over the map, below the bar) on mobile, never over the active panel.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Demo flow that proves it |
|-|-|-|-|
| Hold-to-raise with radius | You can't raise an alert by accident, and you choose how far it reaches | Home hero, `/app` | Flow 2 |
| Approximate area until accepted | Your exact location only goes to people who said yes | Home privacy section, `/how-it-works`, `/app/respond` (area → pin on accept) | Flow 3 |
| Meet-code check-in | Help is verified as in-person, not claimed | Home "Three moves", `/app` (code plate), `/app/respond` (code entry, wrong-code error) | Flows 2 and 3 |
| Deposit that pays who showed up | Responders' time is respected; the rule is simple and visible | `/how-it-works` rules, `/app` settle, `/app/record` ledger | Flow 2 (settle), Flow 3 (paid) |
| False-alarm flag | Pranks cost the prankster; responders still get paid for coming | `/how-it-works`, `/app/respond` | Flow 4 |
| Reputation tiers | Reliable responders are recognised and unlock more trust | `/app/record`, `/how-it-works` | Flows 3–5 |

## 6. Key flows

Every transaction goes through the simulated wallet prompt (Confirm / Reject), then pending (1.2–2.4 s), then confirmed (hash and block) or failed (Demo controls: "Fail the next transaction"). Walking ETAs are shown 10× slower than they run; the 30-minute auto-release and dispute windows are shortened to 20 seconds in the demo.

**Flow 1: Set up before you need it (connect + pre-approve).**
1. `/app` shows the gate: "Set up Guardian before you need it." → Connect demo wallet → wallet prompt → *Rejected:* inline alert "You declined the connection. Nothing was shared." → retry → connected.
2. Pre-approve a safety deposit: choose 5, 10 or 20 tUSDC → Approve → prompt → *pending* "Approving 10.00 tUSDC…" → *confirmed:* "Approved. Up to 10.00 tUSDC can move into an alert pool, never more." → the raise panel appears. *Failed:* "The approval didn't go through. No allowance was set." with Try again.

**Flow 2: Raise an alert and get help (sender).**
1. Choose the situation (Being followed · Feel unsafe · Someone is hurt · Other) and radius (150 / 300 / 500 m). The deposit (4 tUSDC for 300 m) is shown; "How is it used?" expands the rule.
2. Press and hold "Hold to raise" for 1 second (keyboard: hold Space or Enter). Releasing early shows "Keep holding to raise."
3. Wallet prompt → *pending* "Broadcasting to responders within 300 m…" → *failed:* "The alert didn't go out. Your deposit hasn't moved. If you're in danger, call 911 now." with Try again → *confirmed:* rings roll out over the map; "6 responders notified".
4. Responders accept in turn (Léa, Trusted, first-aid attested; then Omar) and walk in along the streets; ETAs count down.
5. Léa arrives: the yellow meet-code plate shows "4 7 1 9". She checks in (on-chain) → "Léa is with you. Verified in person."
6. "I'm safe" → prompt → *pending* "Releasing your deposit…" → *confirmed:* settle moment: the deposit splits to checked-in responders; anyone still walking is stood down with thanks. Receipt and reputation change.
7. Alternatives: *Cancel* before anyone accepts → full refund. Cancel after someone accepted → 1.00 tUSDC to each responder on the way, rest refunded. No answer → auto-release after 30 min (Demo controls: Skip ahead).

**Flow 3: Respond to a nearby alert (responder).**
1. `/app/respond` lists one open alert: "Being followed · Prince-Arthur × Hutchison · ~260 m · 4 tUSDC". Area only, no pin. *Empty state:* "All quiet within 500 m." with "Simulate a nearby alert".
2. Accept → prompt → *pending* "Telling them you're coming…" → *confirmed:* exact pin unlocks; route and ETA. *Failed:* "Couldn't accept. They haven't been told you're coming."
3. Walk (animated); "I'm here" enables on arrival.
4. Enter the 4-digit code they show you (the demo shows "their screen" beside it). *Wrong code:* "That code doesn't match. Ask them to read it again." → correct → check-in tx → "Checked in. Waiting for them to confirm they're safe (auto-releases in 30 min)."
5. Sender confirms → *paid:* "+2.00 tUSDC (split with Camille R.) · +6 reputation". Ledger updated. Medical alerts appear locked for responders below Trusted (75).

**Flow 4: Flag a false alarm.**
1. "Simulate a nearby alert" adds a second alert (av. du Parc × Milton) that turns out to be a false alarm. Accept, walk; on arrival "their screen" is empty: "Nobody here?" → dialog with reasons (Nobody at the location · They say they didn't send it · Clearly a prank) → Flag → prompt → *pending* → *confirmed:* "Flag recorded. The sender has 30 minutes to dispute it."
2. Skip ahead (or wait) → *upheld:* "Not disputed. You received 4.00 tUSDC for your time; the sender's reputation dropped by 25." *Failed tx:* "Your flag wasn't recorded. Try again."

**Flow 5: Your record.** `/app/record`: reputation score, tier ladder with what the next tier unlocks, wallet balance and allowance (change allowance → approval tx), full ledger with statuses, alert history, and Reset demo (confirmation dialog).

## 7. Content (EN and FR)

Tone: calm, direct, plain words, short sentences, no hype and no fear-mongering. Speak like a good neighbour who is also a careful engineer. French is written for Québec readers (Montréal is the demo's city), with "vous".

All strings live in `src/i18n/dictionaries/en.ts` and `fr.ts`; the tables below are the drafts they were written from.

### Home

| Section | EN | FR |
|-|-|-|
| H1 | Help from the people already nearby. | L'aide des gens déjà autour de vous. |
| Sub | Guardian asks neighbours within a few hundred metres to come to you when you feel unsafe. Your small deposit pays whoever verifiably shows up. | Guardian demande aux voisins à quelques centaines de mètres de venir vous rejoindre quand vous ne vous sentez pas en sécurité. Votre petit dépôt rémunère ceux qui se présentent vraiment. |
| CTAs | Try the live demo · How it works | Essayer la démo · Comment ça marche |
| Safety line | Life in danger? Call 911 first. Guardian brings neighbours, not emergency services. | Une vie en danger ? Composez d'abord le 911. Guardian mobilise des voisins, pas les services d'urgence. |
| Gap H2 | Most frightening moments aren't a 911 call. Yet. | La plupart des moments inquiétants ne justifient pas le 911. Pas encore. |
| Gap line | Followed home, a friend who can't stand, a fall on the ice. People two minutes away would help, if you could ask. | Suivie en rentrant, une amie qui ne tient plus debout, une chute sur la glace. Des gens à deux minutes aideraient, si on pouvait leur demander. |
| Moves H2 | Three moves, start to finish | Trois gestes, du début à la fin |
| 1 | **Hold to raise.** One second, so a pocket can't. Only people inside your radius are asked. | **Maintenez pour alerter.** Une seconde, pour qu'une poche ne puisse pas le faire. Seuls les gens de votre rayon sont sollicités. |
| 2 | **Meet in person.** They type the 4-digit code on your screen. That's the proof they came. | **Rencontre en personne.** Ils saisissent le code à 4 chiffres affiché chez vous. C'est la preuve de leur présence. |
| 3 | **Settle.** Tap "I'm safe". Whoever checked in splits your deposit. | **Règlement.** Touchez « Je suis en sécurité ». Ceux qui sont venus se partagent votre dépôt. |
| Privacy H2 | Your exact location goes only to people who said yes. | Votre position exacte ne va qu'aux gens qui ont dit oui. |
| Privacy line | Responders nearby see a block-wide area. Only those who accept get your pin. | Les répondants proches voient un secteur d'un pâté de maisons. Seuls ceux qui acceptent reçoivent votre position. |
| Responder H2 | Be someone's two-minute neighbour. | Soyez le voisin à deux minutes de quelqu'un. |
| Responder line | Only alerts within walking distance. Decline any time. Paid only for verified, in-person help. | Seulement des alertes à distance de marche. Refusez quand vous voulez. Payé seulement pour une aide vérifiée, en personne. |
| Responder CTA | Try responding | Essayer en tant que répondant |
| Closing H2 | Set it up tonight. Hope you never need it. | Configurez-le ce soir. En espérant ne jamais en avoir besoin. |
| Closing line | Two minutes: raise an alert, watch Léa walk over, settle. | Deux minutes : lancez une alerte, regardez Léa arriver, réglez. |

### How it works

| Section | EN | FR |
|-|-|-|
| H1 | The rules, in full. | Les règles, au complet. |
| Rules H2 | Help is paid for. False alarms aren't free. | L'aide est rémunérée. Les fausses alertes ont un prix. |
| Rules rows | You cancel before anyone accepts → full refund · You cancel after someone set off → 1 tUSDC each for their walk, the rest back to you · You tap "I'm safe" → responders who checked in split the deposit · You don't answer → it releases to them after 30 minutes · Nobody was there → responders who came keep the deposit; the sender's reputation drops | Vous annulez avant toute acceptation → remboursement complet · Vous annulez après un départ → 1 tUSDC chacun pour le déplacement, le reste vous revient · « Je suis en sécurité » → ceux qui se sont présentés se partagent le dépôt · Vous ne répondez pas → versé après 30 minutes · Personne sur place → les répondants gardent le dépôt ; la réputation de l'expéditeur baisse |

**FAQ, on `/how-it-works` only (EN / FR).**

1. *Does Guardian call the police or an ambulance?* No. Guardian brings nearby people. If a life is at risk, call 911 first; you can raise a Guardian alert as well. / *Guardian appelle-t-il la police ou une ambulance ?* Non. Guardian mobilise des gens à proximité. Si une vie est en danger, composez d'abord le 911 ; vous pouvez aussi lancer une alerte Guardian.
2. *Who can see where I am?* Responders in your radius see an area about a block wide. Only those who accept see your exact pin, and only until the alert closes. / *Qui peut voir où je suis ?* Les répondants dans votre rayon voient un secteur d'environ un pâté de maisons. Seuls ceux qui acceptent voient votre position exacte, et seulement jusqu'à la fermeture de l'alerte.
3. *Why do I pay a deposit to ask for help?* So responders know the alert is real and their time counts. It's small, you set the maximum in advance, and you get it back if you cancel before anyone sets off. / *Pourquoi payer un dépôt pour demander de l'aide ?* Pour que les répondants sachent que l'alerte est réelle et que leur temps compte. Il est modeste, vous en fixez le maximum à l'avance, et il vous est rendu si vous annulez avant tout départ.
4. *What if someone accepts and never comes?* They're only paid after typing your meet code in person. Accepting and not arriving lowers their reputation. / *Et si quelqu'un accepte sans jamais venir ?* On n'est payé qu'après avoir saisi votre code en personne. Accepter sans se présenter fait baisser la réputation.
5. *Can I respond without being trained?* Yes, for most alerts. Medical alerts only go to Trusted responders with a first-aid attestation. / *Puis-je répondre sans formation ?* Oui, pour la plupart des alertes. Les alertes médicales ne vont qu'aux répondants Fiables ayant une attestation de premiers soins.

**Empty and error states.**

| Where | EN | FR |
|-|-|-|
| Respond, no alerts | All quiet within 500 m. You'll hear about alerts close enough to walk to. | Tout est calme dans un rayon de 500 m. Vous serez avisé des alertes à distance de marche. |
| Record, no ledger | No transactions yet. Your approvals, alerts and rewards will appear here. | Aucune transaction pour l'instant. Vos approbations, alertes et récompenses apparaîtront ici. |
| Connect rejected | You declined the connection. Nothing was shared. | Vous avez refusé la connexion. Rien n'a été partagé. |
| Raise failed | The alert didn't go out. Your deposit hasn't moved. If you're in danger, call 911 now. | L'alerte n'est pas partie. Votre dépôt n'a pas bougé. Si vous êtes en danger, composez le 911 maintenant. |
| Allowance too low | Your approved amount is below this deposit. Raise it in My record. | Votre montant approuvé est inférieur à ce dépôt. Augmentez-le dans Mon dossier. |
| Wrong meet code | That code doesn't match. Ask them to read it again. | Ce code ne correspond pas. Demandez-leur de le relire. |
| Generic tx failed | The network didn't confirm the transaction. Nothing changed. | Le réseau n'a pas confirmé la transaction. Rien n'a changé. |
| 404 | This street isn't on our map. | Cette rue n'est pas sur notre carte. |
| Error boundary | Something went wrong on our side. Your demo data is safe in this browser. | Un problème est survenu de notre côté. Vos données de démo sont intactes dans ce navigateur. |

## 8. Aesthetics

**Concept: exit-sign calm, street-level, legible under stress.**
Guardian is used at night, outdoors, by someone whose hands may be shaking. The identity borrows from the one visual language everybody already trusts in a crisis: public wayfinding and safety signage. Exit-sign green means "this way to safety", hi-vis yellow means "a person who is here to help", signal red is reserved for the one thing that is live right now. Wide, sturdy letterforms read at a glance, like street signs. Nothing is decorative for its own sake; everything looks like it would still work on a cracked phone under a sodium lamp.

**Palette** (hex; ratios computed with the WCAG formula, `.scratch`-style script kept out of the repo).

| Role | Light | Dark ("night street") |
|-|-|-|
| `background` | `#F1F2EE` concrete | `#0E1312` asphalt |
| `foreground` | `#141A19` | `#E7EBE5` |
| `card` / `popover` | `#FBFBF8` | `#151B1A` |
| `primary` (exit green) | `#0B6B4B` | `#4FBF8E` |
| `primary-foreground` | `#FFFFFF` | `#06140E` |
| `muted` | `#E3E6E0` | `#1E2624` |
| `muted-foreground` | `#4D5653` | `#9CA8A3` |
| `accent` (hi-vis yellow) | `#F4CE2B` | `#EFCB3A` |
| `accent-foreground` | `#141A19` | `#141A19` |
| `border` | `#C9CFC8` | `#2B3532` |
| `input` (form control outlines, 3:1) | `#7E8883` | `#6B7773` |
| `ring` | `#0B6B4B` | `#4FBF8E` |
| `destructive` / signal red | `#B3261E` | `#F26A55` |
| `destructive-foreground` | `#FFFFFF` | `#1A0604` |
| `chart-1` … `chart-5` | `#0B6B4B` `#C99A00` `#B3261E` `#2F6A8A` `#6E6A5E` | `#4FBF8E` `#EFCB3A` `#F26A55` `#7DB3D1` `#A8A293` |

Contrast (AA needs 4.5 for text, 3 for UI outlines):

| Pair | Light | Dark |
|-|-|-|
| foreground / background | 15.67 | 15.54 |
| foreground / card | 17.00 | 14.47 |
| muted-foreground / background | 6.74 | 7.62 |
| muted-foreground / muted | 6.01 | 6.29 |
| primary-foreground / primary | 6.52 | 8.24 |
| primary / background (links) | 5.80 | 8.19 |
| accent-foreground / accent | 11.51 | 11.14 |
| destructive-foreground / destructive | 6.54 | 6.50 |
| destructive / background | 5.81 | 6.22 |
| input outline / background | 3.26 | 4.03 |
| input outline / card | 3.53 | 3.75 |

`border` is decorative (1.4–1.5) and never the only boundary of an interactive control; form controls use `input`.

**Type** (two families via `next/font/google`):
- **Archivo** (variable, width axis) for everything readable: headings set at width 112–125 and weight 700–800 like street signage; body at width 100, weight 400/500. Scale: 12 / 14 / 16 / 18 / 22 / 28 / 40 / 56 / 72 px (fluid clamp for H1).
- **JetBrains Mono** (400/600) for the things you'd read out loud or verify: meet codes, distances, ETAs, amounts in ledgers, hashes and addresses.

**Logo.** The mark is a rounded signage plate in exit green with a white dot (you) and two white arcs (the radius) opening upward and right: "someone nearby is listening". The wordmark "GUARDIAN" is Archivo at width 125, weight 800, tracked +4%. Favicon: the plate alone (`src/app/icon.svg`).

**Shape.** Radius 6px (signage plates, not pills), 2px borders on the things that matter (live alert card, meet-code plate), 1px hairlines elsewhere. Flat: no drop shadows except a crisp 1px offset under map pins. The only "texture" is a diagonal reflective-tape stripe (yellow/ink) used on exactly two things: the live-alert banner and the meet-code plate. Motion: short (150–250 ms), purposeful; radius rings expand at 1.6 s ease-out; everything static under `prefers-reduced-motion`.

**Imagery.** Documentary night photography: real streets, lamplight, people seen from behind or at a distance (no faces in fear, no staged "victim" shots, no police lights). Photos are toned together with a slight desaturation. The map is drawn in code: a stylised Milton-Parc (Montréal) street grid, not a map tile provider.

**Signature moments.**
1. **Hold to raise.** A ring fills around the button over one second; on release the rings roll out over the map and responder pins light up one by one with a running count.
2. **The meet-code handshake.** The sender's screen shows the code on a hi-vis plate; the responder types it; the two pins snap together with a single pulse and the line "Verified in person".
3. **The settle.** The deposit bar divides into equal segments that slide to each checked-in responder's row, the amounts tick in, and the reputation number steps up.

**What we deliberately avoid, and why.** Purple/blue "AI gradients", frosted glass, neon, glowing coins and 3D blobs (they signal crypto hype, not safety). Red as a brand colour (alarmist, and it must stay free to mean "live alert"). Police-light blue/red, sirens and shield icons (Guardian is not law enforcement). Map tiles from a provider (visual noise and a privacy smell). Default shadcn grey and rounded-pill everything: plates and hairlines instead.

## 9. Assets

**Photography** (Unsplash License, free; none are Unsplash+; details and credits in `docs/assets.md` and on `/credits`):

| File | Purpose | Placement |
|-|-|-|
| `public/images/walk-home-snow.jpg` (Alexander Lunyov) | A person walking alone at night: the not-911 moment | Home, "The gap" |
| `public/images/walking-together.jpg` (Phil Hearing) | People walking together under a street lamp: the network | Home, "Be a responder" |

**Built in code:** logo mark and wordmark, favicon, Open Graph image (per locale), the Milton-Parc map (hero phone and app), radius rings and pins, the area-vs-pin privacy diagram, the four-moves strip, the alert lifecycle diagram, the tier ladder, the reflective-tape stripe.

**Icons:** `lucide-react` at stroke 1.75 (footprints, map-pin, hand-helping, timer, badge-check, flag, undo, wallet).

## 10. Pricing strategy

**Model: free for people, paid by the communities that want coverage.** Charging someone a subscription to ask for help would be wrong and would kill adoption; the deposit already goes 100% to responders.

| Plan | Price | Who | What |
|-|-|-|-|
| Neighbours | Free, 0% fee on deposits and rewards | Individuals | Raise and respond, reputation, full ledger |
| Community | CA$149 / month | Associations, venues, co-ops (up to 2,000 members) | Sponsored deposit pool (members raise alerts at no cost), verified responder roster, anonymous heatmap of alert areas, monthly report |
| Campus | CA$1.20 per member per year (minimum CA$4,800) | Universities, colleges, large employers | Everything in Community, safety-office console (sees live alerts in its zone, can send staff as responders), SSO, first-aid attestations issued by the institution, quarterly coverage review |

Reasoning: campus safety budgets already pay for escort services and blue-light phones (typically tens of thousands a year); Guardian costs a fraction and adds a network of volunteers. A per-member price scales with the risk population and is how campus software is bought. Sponsored pools are topped up at cost; Guardian never takes a cut of deposits or rewards, which keeps the incentive clean.

`/pricing` is built as a real page for internal review, **never linked** anywhere, excluded from `sitemap.xml`, and has `robots: { index: false, follow: false }`. No price is mentioned anywhere else on the site.

## 11. Out of scope

- Real GPS, real maps, real push notifications or SMS.
- Any link to 911 or emergency dispatch (the demo shows the "call 911" advice but doesn't dial).
- Real wallets, signing, chains or tokens: everything runs in the browser on a pretend testnet with `tUSDC`.
- Identity verification and issuing first-aid attestations (shown as existing badges).
- The Steward dispute review, chat between sender and responders, and the campus safety-office console (described, not built).
- Accounts, backend, analytics.
