import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "Guardian"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const ASPHALT = "#141a19"
const LIGHT = "#e7ebe5"
const GREEN = "#0b6b4b"
const GREEN_LIGHT = "#4fbf8e"
const HIVIS = "#f4ce2b"
const SIGNAL = "#e0513c"

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: ASPHALT, color: LIGHT }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="64" height="64" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="6" fill={GREEN} />
              <circle cx="10.5" cy="21.5" r="3.2" fill="#fff" />
              <path d="M10.5 13.2a8.3 8.3 0 0 1 8.3 8.3" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M10.5 6.4a15.1 15.1 0 0 1 15.1 15.1" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: 6 }}>GUARDIAN</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
            <div style={{ fontSize: 28, color: "#9ca8a3" }}>{d.meta.ogSub}</div>
          </div>
          <div style={{ display: "flex" }}>
            <span style={{ background: HIVIS, color: ASPHALT, fontSize: 20, fontWeight: 700, padding: "6px 12px", borderRadius: 4 }}>
              {d.common.demoBadge}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 500, height: 630 }}>
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 105,
              width: 420,
              height: 420,
              borderRadius: 210,
              border: `4px dashed ${SIGNAL}`,
              background: "rgba(224,81,60,0.10)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 215,
              width: 200,
              height: 200,
              borderRadius: 100,
              border: `3px dashed ${GREEN_LIGHT}`,
            }}
          />
          <div style={{ position: "absolute", left: 226, top: 291, width: 48, height: 48, borderRadius: 24, background: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: SIGNAL }} />
          </div>
          {[
            [110, 180],
            [360, 250],
            [300, 440],
          ].map(([x, y]) => (
            <div key={`${x}-${y}`} style={{ position: "absolute", left: x, top: y, width: 30, height: 30, borderRadius: 15, background: HIVIS, border: `4px solid ${ASPHALT}` }} />
          ))}
        </div>
      </div>
    ),
    size
  )
}
