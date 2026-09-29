"use client"

import { FootprintsIcon, IdCardIcon, Loader2Icon, SirenIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { GuardianMark, GuardianWordmark } from "@/components/site/brand"
import { LocaleSwitch } from "@/components/site/locale-switch"
import { ThemeToggle } from "@/components/site/theme"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { NetworkBadge } from "@/components/ui/network-badge"
import { Toaster } from "@/components/ui/sonner"
import { href } from "@/i18n/config"
import { NETWORK_NAME } from "@/lib/demo/chain"
import { DemoProvider, useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { AppCopyProvider, useCopy, type AppCopy } from "./app-context"
import { DemoControls } from "./demo-controls"
import { WalletPrompt } from "./wallet-prompt"

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return desktop
}

function Tabs({ variant }: { variant: "top" | "bottom" }) {
  const { d, locale } = useCopy()
  const pathname = usePathname() ?? ""
  const { state } = useDemo()
  const openIncoming = state.incoming.filter((a) => a.phase === "open").length
  const tabs = [
    { href: href(locale, "/app"), label: d.tabs.help, icon: SirenIcon, badge: state.outgoing?.phase === "live" },
    { href: href(locale, "/app/respond"), label: d.tabs.respond, icon: FootprintsIcon, count: openIncoming },
    { href: href(locale, "/app/record"), label: d.tabs.record, icon: IdCardIcon },
  ]
  if (variant === "top")
    return (
      <nav aria-label={d.tabsLabel} className="hidden md:block">
        <ul className="flex items-center gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className="relative inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background"
                >
                  <tab.icon className="size-4" aria-hidden="true" />
                  {tab.label}
                  {tab.badge ? <span className="size-2 rounded-full bg-signal" aria-hidden="true" /> : null}
                  {tab.count ? (
                    <span className="rounded-sm bg-accent px-1.5 font-mono text-[11px] text-accent-foreground">{tab.count}</span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  return (
    <nav aria-label={d.tabsLabel} className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-card md:hidden">
      <ul className="grid grid-cols-3">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-muted-foreground aria-[current=page]:text-foreground"
              >
                <span className={cn("relative grid h-7 w-12 place-items-center rounded-md", active && "bg-foreground text-background")}>
                  <tab.icon className="size-[18px]" aria-hidden="true" />
                  {tab.badge ? <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-signal" aria-hidden="true" /> : null}
                  {tab.count ? (
                    <span className="absolute -top-1.5 -right-2 rounded-sm bg-accent px-1 font-mono text-[10px] text-accent-foreground">{tab.count}</span>
                  ) : null}
                </span>
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Header() {
  const { d, c, locale } = useCopy()
  const { state, hydrated, pending, connect, disconnect } = useDemo()
  const [connecting, setConnecting] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <Link href={href(locale)} aria-label={c.brandHome} className="shrink-0 rounded-sm">
          <GuardianMark className="size-8 sm:hidden" />
          <GuardianWordmark className="hidden sm:inline-flex" />
        </Link>
        <span className="rounded-sm bg-accent px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-accent-foreground">{c.demoBadge}</span>
        <div className="ml-4 hidden lg:block">
          <Tabs variant="top" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {pending ? (
            <span role="status" className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground xl:inline-flex">
              <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
              {d.pending}
            </span>
          ) : null}
          <NetworkBadge name={NETWORK_NAME} variant="outline" className="hidden xl:inline-flex" />
          <div className="hidden items-center gap-1 md:flex">
            <LocaleSwitch locale={locale} label={c.language} names={c.names} short={c.short} />
            <ThemeToggle label={c.theme} />
          </div>
          <DemoControls />
          {hydrated ? (
            <ConnectWallet
              status={state.connected ? "connected" : connecting ? "connecting" : "disconnected"}
              address={state.profile.address}
              name={d.wallet.you}
              connectLabel={<span className="hidden sm:inline">{d.wallet.connect}</span>}
              connectingLabel={d.wallet.connecting}
              disconnectLabel={d.wallet.disconnect}
              onConnect={async () => {
                setConnecting(true)
                await connect()
                setConnecting(false)
              }}
              onDisconnect={disconnect}
              className="[&_[data-slot=wallet-address]]:hidden sm:[&_[data-slot=wallet-address]]:inline [&>div>span:first-child]:hidden sm:[&>div>span:first-child]:inline"
            />
          ) : null}
        </div>
      </div>
      <div className="hidden border-t md:block lg:hidden">
        <div className="mx-auto max-w-[1400px] px-4 py-1.5 sm:px-6">
          <Tabs variant="top" />
        </div>
      </div>
    </header>
  )
}

function Chrome({ children }: { children: ReactNode }) {
  const desktop = useIsDesktop()
  const { d } = useCopy()
  const { hydrated } = useDemo()
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col pb-24 outline-none md:pb-0">
        {hydrated ? (
          children
        ) : (
          <p role="status" className="flex flex-1 items-center justify-center gap-2 p-10 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            {d.loading}
          </p>
        )}
      </main>
      <Tabs variant="bottom" />
      <WalletPrompt />
      <Toaster
        position={desktop ? "top-right" : "bottom-center"}
        offset={{ top: 84, right: 24 }}
        mobileOffset={{ bottom: 92, left: 12, right: 12 }}
      />
    </>
  )
}

export function AppShell({ copy, children }: { copy: AppCopy; children: ReactNode }) {
  return (
    <AppCopyProvider value={copy}>
      <DemoProvider>
        <Chrome>{children}</Chrome>
      </DemoProvider>
    </AppCopyProvider>
  )
}
