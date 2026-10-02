"use client"

import { CityMap, MapPin, MapRing, MapRoute, MapYou, type PinTone } from "@/components/map/city-map"
import { t } from "@/i18n/t"
import { SENDER_POS } from "@/lib/demo/seed"
import { outgoingView, remainingRoute } from "@/lib/demo/sim"
import type { OutgoingAlert, RadiusM } from "@/lib/demo/types"

import { useCopy } from "./app-context"

// Where people who reached you stand around your pin, so pins don't overlap.
const HUDDLE = [
  { x: -26, y: -20 },
  { x: 26, y: -20 },
  { x: 0, y: -34 },
]

export function HelpMap({ alert, previewRadius, now }: { alert: OutgoingAlert | null; previewRadius?: RadiusM; now: number }) {
  const { d } = useCopy()
  const views = alert ? outgoingView(alert, now) : []
  const live = alert?.phase === "live"
  const notified = views.length
  const moving = views.filter((v) => v.status === "on-the-way").length
  const withYou = views.filter((v) => v.status === "checked-in" || v.status === "arrived").length
  let huddle = 0
  return (
    <div className="relative size-full">
      <CityMap
        label={t(d.map.label, { detail: d.map.detailSender })}
        campusLabel={d.map.campus}
        parkLabel={d.map.park}
        focus={[40, 110, 520, 520]}
      >
        {alert ? (
          <MapRing key={alert.id} at={SENDER_POS} radiusM={alert.radius} animate tone={live ? "signal" : "primary"} />
        ) : previewRadius ? (
          <MapRing at={SENDER_POS} radiusM={previewRadius} />
        ) : null}
        {views.map((v) =>
          v.status === "on-the-way" && v.route ? <MapRoute key={`r-${v.responder.id}`} points={remainingRoute(v.route, v.progress)} /> : null
        )}
        {views.map((v) => {
          const atSender = v.status === "arrived" || v.status === "checked-in"
          const offset = atSender ? HUDDLE[huddle++ % HUDDLE.length]! : { x: 0, y: 0 }
          const tone: PinTone =
            v.status === "on-the-way" ? "moving" : v.status === "checked-in" ? "done" : v.status === "arrived" ? "here" : "idle"
          const first = v.responder.name.split(" ")[0]
          const clasp = v.status === "checked-in" && v.checkedInAt !== undefined && now - v.checkedInAt < 1600
          return (
            <MapPin
              key={v.responder.id}
              at={{ x: v.pos.x + offset.x, y: v.pos.y + offset.y }}
              tone={tone}
              label={v.acceptedAt !== undefined && v.status !== "stood-down" ? first : undefined}
              clasp={clasp}
            />
          )
        })}
        <MapYou at={SENDER_POS} label={d.map.you} live={live} />
      </CityMap>
      {alert ? (
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 text-xs font-semibold" aria-hidden="true">
          <span className="rounded-sm border border-foreground/70 bg-card px-2 py-1">
            <span className="font-mono">{notified}</span> {d.live.notified}
          </span>
          <span className="rounded-sm border border-foreground bg-accent px-2 py-1 text-accent-foreground">
            <span className="font-mono">{moving}</span> {d.live.onTheWay}
          </span>
          <span className="rounded-sm border border-foreground bg-primary px-2 py-1 text-primary-foreground">
            <span className="font-mono">{withYou}</span> {d.live.withYou}
          </span>
        </div>
      ) : null}
    </div>
  )
}
