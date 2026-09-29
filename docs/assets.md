# Guardian: assets

## Photographs

Both photographs are from Unsplash under the [Unsplash License](https://unsplash.com/license) (free; neither is Unsplash+: both download anonymously, which Unsplash+ images don't). Each was downloaded at 1600px on its long edge, JPEG quality 72, and is served with `next/image` from `public/images/`. They are credited on `/en/credits` and `/fr/credits`, linked from the footer.

| File | Unsplash page | Photographer | Used on |
|-|-|-|-|
| `public/images/walk-home-snow.jpg` | https://unsplash.com/photos/a-woman-walking-down-a-snow-covered-sidewalk-at-night-was-GsYCXQ0 | [Alexander Lunyov](https://unsplash.com/@sunify) | Home, "The gap" |
| `public/images/walking-together.jpg` | https://unsplash.com/photos/a-group-of-people-walking-down-a-street-at-night-Zd9eCM6pRhw | [Phil Hearing](https://unsplash.com/@philhearing) | Home, "Be someone's two-minute neighbour" |

Selection: documentary night photography under sodium street light, people seen from behind, no faces in fear and no police lights. Both are slightly desaturated on the page (`saturate-[0.85]`) and dimmed in dark mode. A third photo (a foggy campus path by Hayden Pollard) was chosen for a campuses section, then cut with that section in the restraint pass.

## Built in code

| Asset | Where |
|-|-|
| Mark (signage plate, dot and two radius arcs) and `GUARDIAN` wordmark | `src/components/site/brand.tsx`; header, footer, app bar, wallet prompt |
| Favicon | `src/app/icon.svg` |
| Open Graph image (per locale) | `src/app/[locale]/opengraph-image.tsx` |
| Milton-Parc map, radius rings, pins, routes, approximate area | `src/components/map/city-map.tsx`; hero phone, privacy diagram, app |
| Hero phone mid-alert | `src/components/home/hero-phone.tsx` |
| Area-vs-pin privacy diagram | `src/components/home/privacy-diagram.tsx` |
| Three-moves glyphs | `src/components/home/move-glyph.tsx` |
| Alert lifecycle diagram, tier ladder | `src/app/[locale]/(site)/how-it-works/page.tsx` |
| Hold-to-raise ring | `src/components/demo/hold-button.tsx` |
| Meet-code plate with reflective tape | `src/components/demo/parts.tsx` (`CodePlate`), `.tape` in `src/app/globals.css` |
| 404 street sign | `src/app/[locale]/not-found.tsx` |

## Icons and type

- Icons: `lucide-react`, stroke 1.75–2.
- Fonts via `next/font/google`: Archivo (variable width axis; wide and heavy for headings) and JetBrains Mono (codes, distances, amounts, hashes).
