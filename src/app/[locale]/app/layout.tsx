import { notFound } from "next/navigation"

import { AppShell } from "@/components/demo/app-shell"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const c = dict.common
  return (
    <AppShell
      copy={{
        locale,
        d: dict.app,
        c: {
          demoBadge: c.demoBadge,
          testnet: c.testnet,
          call911: c.call911,
          close: c.close,
          brandHome: c.brandHome,
          theme: c.theme,
          language: c.language,
          names: c.names,
          short: c.short,
          nav: c.nav,
        },
      }}
    >
      {children}
    </AppShell>
  )
}
