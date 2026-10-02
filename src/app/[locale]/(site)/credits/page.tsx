import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS, type PhotoKey } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const c = getDictionary(locale).credits
  return pageMetadata(locale, "/credits", c.metaTitle, c.metaDescription)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const c = getDictionary(locale).credits
  const keys = Object.keys(PHOTOS) as PhotoKey[]
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="font-sign text-4xl sm:text-5xl">{c.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.body}</p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {keys.map((key) => {
          const photo = PHOTOS[key]
          return (
            <li key={key} className="overflow-hidden rounded-lg border-2 border-foreground bg-card">
              <div className="relative aspect-[4/3]">
                <Image src={photo.src} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" placeholder="blur" />
              </div>
              <div className="space-y-1 p-4 text-sm">
                <p className="font-semibold">
                  {c.photoBy.split("{name}")[0]}
                  <a href={photo.profile} className="underline underline-offset-2">
                    {photo.name}
                  </a>
                  {c.photoBy.split("{name}")[1]}
                </p>
                <p className="text-muted-foreground">{t(c.usedOn, { where: c.places[key] })}</p>
                <a href={photo.page} className="inline-flex min-h-10 items-center text-primary underline underline-offset-2">
                  {c.view}
                </a>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-10 text-sm text-muted-foreground">{c.type}</p>
    </section>
  )
}
