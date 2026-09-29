import { CityMap, MapArea, MapPin, MapRoute, MapYou } from "@/components/map/city-map"
import type { Dictionary } from "@/i18n"
import { INCOMING_TEMPLATES, RESPONDER_POS } from "@/lib/demo/seed"
import { remainingRoute } from "@/lib/demo/sim"

/** Before accepting: an area. After accepting: the pin and a route. Same map as the demo. */
export function PrivacyDiagram({ dict }: { dict: Dictionary }) {
  const d = dict.home.privacy
  const alert = INCOMING_TEMPLATES[0]!
  const panels = [
    { title: d.before, body: d.beforeBody, after: false },
    { title: d.after, body: d.afterBody, after: true },
  ]
  return (
    <div role="img" aria-label={d.diagramLabel} className="grid gap-4 sm:grid-cols-2">
      {panels.map((panel) => (
        <div key={panel.title} className="overflow-hidden rounded-lg border-2 border-foreground bg-card">
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-foreground px-4 py-2.5">
            <span className="font-sign text-sm">{panel.title}</span>
            <span className="text-xs text-muted-foreground">{panel.body}</span>
          </div>
          <div className="h-56" aria-hidden="true">
            <CityMap label="" campusLabel={dict.app.map.campus} parkLabel={dict.app.map.park} focus={[150, 150, 300, 260]}>
              {panel.after ? (
                <>
                  <MapRoute points={remainingRoute(alert.route, 0.35)} />
                  <MapPin at={alert.pin} tone="here" />
                  <circle cx={alert.pin.x} cy={alert.pin.y} r={9} className="fill-signal stroke-foreground" strokeWidth={2} />
                </>
              ) : (
                <MapArea at={alert.areaCentre} />
              )}
              <MapYou at={RESPONDER_POS} label={dict.app.map.you} />
            </CityMap>
          </div>
        </div>
      ))}
    </div>
  )
}
