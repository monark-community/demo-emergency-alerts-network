import { intlLocale, type Locale } from "@/i18n/config"

/** tUSDC amounts: always two decimals, locale separators. */
export function formatAmount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

/** Signed amount for ledgers: +3.00 / −2.00. */
export function formatSigned(value: number, locale: Locale): string {
  if (value === 0) return formatAmount(0, locale)
  return `${value > 0 ? "+" : "−"}${formatAmount(Math.abs(value), locale)}`
}

/** m:ss for elapsed or remaining times. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function formatDateTime(at: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(at))
}

export function formatRelative(ms: number, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const s = Math.round(ms / 1000)
  if (Math.abs(s) < 60) return rtf.format(-s, "second")
  const m = Math.round(s / 60)
  if (Math.abs(m) < 60) return rtf.format(-m, "minute")
  const h = Math.round(m / 60)
  if (Math.abs(h) < 24) return rtf.format(-h, "hour")
  return rtf.format(-Math.round(h / 24), "day")
}

/** A short duration ("42 s", "3 min") for "raised … ago". */
export function formatShortDuration(ms: number, locale: Locale): string {
  const s = Math.max(0, Math.round(ms / 1000))
  const unit = s < 60 ? { value: s, unit: "second" as const } : { value: Math.round(s / 60), unit: "minute" as const }
  return new Intl.NumberFormat(intlLocale[locale], { style: "unit", unit: unit.unit, unitDisplay: "short" }).format(unit.value)
}

export function formatNames(names: string[], locale: Locale): string {
  return new Intl.ListFormat(intlLocale[locale], { style: "long", type: "conjunction" }).format(names)
}
