import { BadgeCheckIcon, FootprintsIcon } from "lucide-react"

import { CityMap, MapPin, MapRing, MapRoute, MapYou } from "@/components/map/city-map"
import type { Dictionary } from "@/i18n"
import { RESPONDERS, SENDER_POS } from "@/lib/demo/seed"
import { pointAlong, remainingRoute } from "@/lib/demo/sim"

/** The hero visual: the real product mid-alert, drawn with the same map and pins as the demo. */
export function HeroPhone({ dict }: { dict: Dictionary }) {
  const p = dict.home.phone
  const lea = RESPONDERS.find((r) => r.id === "lea")!
  const omar = RESPONDERS.find((r) => r.id === "omar")!
  const others = RESPONDERS.filter((r) => ["jonah", "camille", "sunhee", "noah"].includes(r.id))
  return (
    <figure aria-label={p.label} className="relative mx-auto w-full max-w-[340px]">
      <div className="rounded-[2.4rem] border-[3px] border-foreground bg-foreground p-2.5">
        <div className="overflow-hidden rounded-[1.9rem] bg-background">
          {/* Live banner with the reflective tape edge */}
          <div className="tape h-1.5" aria-hidden="true" />
          <div className="flex items-center justify-between bg-signal px-4 py-2.5 text-destructive-foreground">
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <span className="size-2 rounded-full bg-destructive-foreground motion-safe:animate-pulse" aria-hidden="true" />
              {p.live}
            </span>
            <span className="font-mono text-xs">{p.elapsed}</span>
          </div>
          <div className="relative h-[250px]" aria-hidden="true">
            <CityMap label="" campusLabel={dict.app.map.campus} parkLabel={dict.app.map.park} focus={[110, 200, 380, 330]}>
              <MapRing at={SENDER_POS} radiusM={300} animate />
              <MapRing at={SENDER_POS} radiusM={150} animate delay={250} />
              {others.map((r) => (
                <MapPin key={r.id} at={r.home} tone="idle" />
              ))}
              <MapRoute points={remainingRoute(lea.route, 0.55)} />
              <MapRoute points={remainingRoute(omar.route, 0.25)} />
              <MapPin at={pointAlong(lea.route, 0.55)} tone="moving" label="Léa" />
              <MapPin at={pointAlong(omar.route, 0.25)} tone="moving" label="Omar" />
              <MapYou at={SENDER_POS} label={dict.app.map.you} live />
            </CityMap>
            <div className="absolute top-3 left-3 flex gap-1.5 text-[11px] font-semibold">
              <span className="rounded-sm border border-foreground/70 bg-card px-1.5 py-0.5">{p.notified}</span>
              <span className="rounded-sm border border-foreground bg-accent px-1.5 py-0.5 text-accent-foreground">{p.onTheWay}</span>
            </div>
          </div>
          <div className="space-y-2 border-t-2 border-foreground bg-card px-3.5 pt-3 pb-4">
            {[
              { name: p.lea, meta: p.leaMeta, eta: p.leaEta, aid: true },
              { name: p.omar, meta: p.omarMeta, eta: p.omarEta, aid: false },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-md border px-2.5 py-2">
                <span className="grid size-8 place-items-center rounded-full border-2 border-foreground bg-accent text-accent-foreground">
                  <FootprintsIcon className="size-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex items-center gap-1 text-sm font-bold">
                    {r.name}
                    {r.aid ? <BadgeCheckIcon className="size-3.5 text-primary" aria-hidden="true" /> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.meta}</span>
                </span>
                <span className="font-mono text-sm font-semibold">{r.eta}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 rounded-md border-2 border-foreground bg-accent px-3 py-2 text-accent-foreground">
              <span className="text-xs font-bold">{p.code}</span>
              <span className="font-mono text-xl font-semibold tracking-[0.3em]">4719</span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}
