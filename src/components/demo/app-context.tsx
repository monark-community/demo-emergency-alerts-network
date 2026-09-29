"use client"

import * as React from "react"

import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"

export interface AppCopy {
  locale: Locale
  d: Dictionary["app"]
  c: Pick<Dictionary["common"], "demoBadge" | "testnet" | "call911" | "close" | "brandHome" | "theme" | "language" | "names" | "short" | "nav">
}

const Ctx = React.createContext<AppCopy | null>(null)

export function AppCopyProvider({ value, children }: { value: AppCopy; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCopy(): AppCopy {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useCopy must be used inside <AppCopyProvider>")
  return v
}
