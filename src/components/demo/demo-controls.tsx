"use client"

import { FastForwardIcon, RadioTowerIcon, RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { href } from "@/i18n/config"
import { useDemo } from "@/lib/demo/store"

import { LocaleSwitch } from "@/components/site/locale-switch"
import { ThemeToggle } from "@/components/site/theme"

import { useCopy } from "./app-context"
import { ResetDialog } from "./reset-dialog"

export function DemoControls() {
  const { state, setFailNext, skipAhead, simulateIncoming } = useDemo()
  const { d, locale, c } = useCopy()
  const k = d.controls
  const router = useRouter()
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label={k.open} title={k.open}>
          <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={c.close} className="w-full max-w-sm gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="font-sign">{k.title}</SheetTitle>
          <SheetDescription>{k.body}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col divide-y">
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <Label htmlFor="fail-next" className="font-semibold">
                {k.failNext}
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">{k.failNextHint}</p>
            </div>
            <Switch id="fail-next" checked={state.failNext} onCheckedChange={setFailNext} aria-label={k.failNext} className="mt-1" />
          </div>
          <div className="px-5 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                skipAhead(60_000)
                toast(k.toastSkipped)
              }}
            >
              <FastForwardIcon aria-hidden="true" />
              {k.skip}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">{k.skipHint}</p>
          </div>
          <div className="px-5 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                simulateIncoming()
                setOpen(false)
                router.push(href(locale, "/app/respond"))
              }}
            >
              <RadioTowerIcon aria-hidden="true" />
              {k.simulate}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">{k.simulateHint}</p>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-4 md:hidden">
            <LocaleSwitch locale={locale} label={c.language} names={c.names} short={c.short} />
            <ThemeToggle label={c.theme} />
          </div>
          <div className="px-5 py-4">
            <ResetDialog
              onDone={() => setOpen(false)}
              trigger={
                <Button variant="destructive" className="w-full justify-start">
                  <RotateCcwIcon aria-hidden="true" />
                  {k.reset}
                </Button>
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
