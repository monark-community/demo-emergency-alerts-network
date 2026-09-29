// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start        (serves on port 3154)
//        pnpm screenshots                (BASE_URL defaults to http://localhost:3154)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3154"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY ?? process.argv[2]

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: {
    connect: "Connect demo wallet",
    confirm: "Confirm",
    reject: "Reject",
    approve: /Approve 10/,
    hold: /Hold to raise/,
    live: "Alert live",
    arrived: /is here\. Show them your code/,
    verified: /Verified in person/,
    safe: "I'm safe",
    receipt: /You're safe/,
    failed: /The alert didn't go out/,
    accept: "I'll go",
    pin: /Exact pin unlocked/,
    code: "Their meet code",
    checkIn: "Check in",
    paid: /Thank you for going/,
  },
  fr: {
    connect: "Connecter le portefeuille de démo",
    confirm: "Confirmer",
    reject: "Refuser",
    approve: /Approuver 10/,
    hold: /Maintenir pour alerter/,
    live: "Alerte en cours",
    arrived: /est là\. Montrez-lui votre code/,
    verified: /Présence vérifiée/,
    safe: "Je suis en sécurité",
    receipt: /Vous êtes en sécurité/,
    failed: /L'alerte n'est pas partie/,
    accept: "J'y vais",
    pin: /Position exacte débloquée/,
    code: "Son code de rencontre",
    checkIn: "Confirmer ma présence",
    paid: /Merci d'y être allé/,
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  pageerror:", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  const path = `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`
  if (fullPage) {
    // Grow the viewport to the page height so sticky and fixed bars sit where a reader sees them.
    await page.evaluate(() => window.scrollTo(0, 0))
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewportSize({ width: sizes[v.w].width, height: Math.max(height, sizes[v.w].height) })
    await page.waitForTimeout(500)
    await page.screenshot({ path })
    await page.setViewportSize(sizes[v.w])
  } else {
    await page.waitForTimeout(300)
    await page.screenshot({ path })
  }
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const dialog = (page) => page.getByRole("dialog").last()
const go = (page, v, path) => page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
const confirm = async (page, v) => {
  await dialog(page).waitFor()
  await dialog(page).getByRole("button", { name: L[v.locale].confirm, exact: true }).click()
  await dialog(page).waitFor({ state: "detached" }).catch(() => {})
}
const controls = async (page) => {
  await page.getByRole("button", { name: /Demo controls|Contrôles de la démo/ }).first().click()
  await dialog(page).waitFor()
}
const closeSheet = async (page) => {
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
}
const hold = async (page, v) => {
  const btn = page.getByRole("button", { name: L[v.locale].hold })
  await btn.scrollIntoViewIfNeeded()
  const box = await btn.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(1300)
  await page.mouse.up()
}

async function connectAndApprove(page, v, capture) {
  await go(page, v, "/app")
  const btn = page.getByRole("main").getByRole("button", { name: L[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "flow1-01-gate")
  await btn.click()
  await dialog(page).waitFor()
  if (capture) {
    await shot(page, v, "flow1-02-connect-prompt")
    await dialog(page).getByRole("button", { name: L[v.locale].reject, exact: true }).click()
    await page.getByRole("alert").first().waitFor()
    await shot(page, v, "flow1-03-connect-rejected")
    await btn.click()
  }
  await confirm(page, v)
  const approve = page.getByRole("button", { name: L[v.locale].approve })
  await approve.waitFor()
  if (capture) await shot(page, v, "flow1-04-setup")
  await approve.click()
  if (capture) {
    await dialog(page).waitFor()
    await shot(page, v, "flow1-05-approve-prompt")
  }
  await confirm(page, v)
  await page.getByRole("button", { name: L[v.locale].hold }).waitFor({ timeout: 10000 })
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-street-does-not-exist"],
  ]) {
    await go(page, v, path)
    await page.waitForTimeout(2000)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await go(page, v, "")
    await page.getByRole("button", { name: "Open menu" }).click()
    await dialog(page).waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function raiseFlow(page, v, full) {
  await page.waitForTimeout(400)
  await shot(page, v, "flow2-01-raise", true)
  if (full) {
    // A failed broadcast first.
    await controls(page)
    await dialog(page).getByRole("switch").click()
    await closeSheet(page)
    await hold(page, v)
    await dialog(page).waitFor()
    await shot(page, v, "flow2-02-raise-prompt")
    await confirm(page, v)
    await page.getByText(L[v.locale].failed).waitFor({ timeout: 10000 })
    await page.getByText(L[v.locale].failed).scrollIntoViewIfNeeded()
    await shot(page, v, "flow2-03-failed")
  }
  await hold(page, v)
  await confirm(page, v)
  await page.waitForTimeout(500)
  await shot(page, v, "flow2-04-broadcasting")
  await page.getByText(L[v.locale].live).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(8500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow2-05-on-the-way")
  await page.getByText(L[v.locale].arrived).waitFor({ timeout: 20000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow2-06-arrived-code")
  await page.getByText(L[v.locale].verified).first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(400)
  await shot(page, v, "flow2-07-verified", true)
  await page.getByRole("button", { name: L[v.locale].safe }).click()
  await confirm(page, v)
  await page.getByText(L[v.locale].receipt).waitFor({ timeout: 10000 })
  await page.waitForTimeout(1400)
  await shot(page, v, "flow2-08-settled", true)
}

async function respondFlow(page, v) {
  await go(page, v, "/app/respond")
  await page.waitForTimeout(500)
  await shot(page, v, "flow3-01-nearby", true)
  await page.getByRole("button", { name: L[v.locale].accept }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-02-accept-prompt")
  await confirm(page, v)
  await page.getByText(L[v.locale].pin).waitFor({ timeout: 10000 })
  await page.waitForTimeout(5000)
  await shot(page, v, "flow3-03-walking")
  await page.getByLabel(L[v.locale].code).waitFor({ timeout: 20000 })
  await page.getByLabel(L[v.locale].code).fill("1234")
  await page.getByRole("button", { name: L[v.locale].checkIn }).click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-04-wrong-code", true)
  await page.getByLabel(L[v.locale].code).fill("2863")
  await page.getByRole("button", { name: L[v.locale].checkIn }).click()
  await confirm(page, v)
  await page.waitForTimeout(600)
  await shot(page, v, "flow3-05-checked-in", true)
  await page.getByText(L[v.locale].paid).waitFor({ timeout: 20000 })
  await shot(page, v, "flow3-06-paid", true)
}

async function flagFlow(page, v) {
  await page.getByRole("button", { name: "Simulate a nearby alert" }).click()
  await page.waitForTimeout(400)
  await page.getByRole("button", { name: "I'll go" }).click()
  await confirm(page, v)
  await page.getByLabel("Their meet code").waitFor({ timeout: 25000 })
  await shot(page, v, "flow4-01-nobody-there", true)
  await page.getByRole("button", { name: "Nobody here?" }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow4-02-flag-dialog")
  await dialog(page).getByRole("button", { name: "Flag alert" }).click()
  await confirm(page, v)
  await page.getByText(/Flag recorded/).waitFor({ timeout: 10000 })
  await shot(page, v, "flow4-03-flagged", true)
  await controls(page)
  await dialog(page).getByRole("button", { name: /Skip ahead/ }).click()
  await closeSheet(page)
  await page.getByText(/Not disputed/).waitFor({ timeout: 10000 })
  await page.waitForTimeout(300)
  await shot(page, v, "flow4-04-upheld", true)
  // Clear the finished alerts to reach the empty state.
  while ((await page.getByRole("button", { name: "Dismiss" }).count()) > 0) {
    await page.getByRole("button", { name: "Dismiss" }).first().click()
    await page.waitForTimeout(300)
  }
  await page.getByText("All quiet within 500 m.").waitFor()
  await shot(page, v, "flow3-07-empty", true)
}

async function recordFlow(page, v) {
  await go(page, v, "/app/record")
  await page.waitForTimeout(500)
  await shot(page, v, "flow5-01-record", true)
  await controls(page)
  await shot(page, v, "flow5-02-demo-controls")
  await dialog(page).getByRole("button", { name: "Reset demo" }).click()
  await page.getByRole("dialog", { name: "Reset the demo?" }).waitFor()
  await shot(page, v, "flow5-03-reset-confirm")
  await page.getByRole("dialog", { name: "Reset the demo?" }).getByRole("button", { name: "Reset", exact: true }).click()
  await page.waitForTimeout(600)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") {
      await go(page, v, "")
      await page.waitForTimeout(2000)
      await shot(page, v, "page-home", true)
      await connectAndApprove(page, v, false)
      await raiseFlow(page, v, false)
      await respondFlow(page, v)
    } else {
      await marketing(page, v)
      await connectAndApprove(page, v, true)
      await raiseFlow(page, v, true)
      await respondFlow(page, v)
      await flagFlow(page, v)
      await recordFlow(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
