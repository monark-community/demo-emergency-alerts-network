import type { Metadata } from "next"

import { HelpView } from "@/components/demo/help-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).app
  return pageMetadata(locale, "/app", d.titles.help, d.metaDescription)
}

export default function HelpPage() {
  return <HelpView />
}
