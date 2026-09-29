import type { Metadata } from "next"

import { RespondView } from "@/components/demo/respond-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/respond">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app/respond", d.titles.respond, d.metaDescription)
}

export default function RespondPage() {
  return <RespondView />
}
