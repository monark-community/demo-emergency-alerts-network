import walkHome from "../../public/images/walk-home-snow.jpg"
import walkingTogether from "../../public/images/walking-together.jpg"

/** Every photo on the site (Unsplash License, none are Unsplash+). Mirrors docs/assets.md. */
export const PHOTOS = {
  gap: {
    src: walkHome,
    page: "https://unsplash.com/photos/a-woman-walking-down-a-snow-covered-sidewalk-at-night-was-GsYCXQ0",
    name: "Alexander Lunyov",
    profile: "https://unsplash.com/@sunify",
  },
  responder: {
    src: walkingTogether,
    page: "https://unsplash.com/photos/a-group-of-people-walking-down-a-street-at-night-Zd9eCM6pRhw",
    name: "Phil Hearing",
    profile: "https://unsplash.com/@philhearing",
  },
} as const

export type PhotoKey = keyof typeof PHOTOS
