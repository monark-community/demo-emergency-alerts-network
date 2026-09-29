"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Locale } from "@/i18n/config"

import { GuardianWordmark } from "./brand"
import { LocaleSwitch } from "./locale-switch"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

export interface MobileMenuLabels {
  open: string
  close: string
  nav: string
  tagline: string
  cta: string
  theme: string
  language: string
  names: Record<Locale, string>
  short: Record<Locale, string>
}

export function MobileMenu({
  locale,
  items,
  appHref,
  labels,
}: {
  locale: Locale
  items: NavItem[]
  appHref: string
  labels: MobileMenuLabels
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open} className="md:hidden">
          <MenuIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={labels.close} className="w-full max-w-sm gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>
            <GuardianWordmark />
          </SheetTitle>
          <SheetDescription className="mt-2">{labels.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label={labels.nav} className="flex-1 px-2 py-3">
          <NavLinks
            items={items}
            className="flex flex-col"
            itemClassName="h-14 w-full border-b px-3 text-lg aria-[current=page]:after:inset-y-3 aria-[current=page]:after:left-0 aria-[current=page]:after:right-auto aria-[current=page]:after:h-auto aria-[current=page]:after:w-[3px]"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <div className="flex flex-col gap-4 border-t px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <LocaleSwitch locale={locale} label={labels.language} names={labels.names} short={labels.short} />
            <ThemeToggle label={labels.theme} />
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={appHref} onClick={() => setOpen(false)}>
              {labels.cta}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
