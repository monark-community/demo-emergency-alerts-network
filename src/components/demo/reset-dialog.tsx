"use client"

import { useState, type ReactElement } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDemo } from "@/lib/demo/store"

import { useCopy } from "./app-context"

export function ResetDialog({ trigger, onDone }: { trigger: ReactElement; onDone?: () => void }) {
  const { reset } = useDemo()
  const { d, c } = useCopy()
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={c.close}>
        <DialogHeader>
          <DialogTitle className="font-sign">{d.record.resetTitle}</DialogTitle>
          <DialogDescription>{d.record.resetBody}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {d.record.resetCancel}
          </Button>
          <Button
            variant="signal"
            onClick={() => {
              reset()
              setOpen(false)
              onDone?.()
              toast(d.controls.toastReset)
            }}
          >
            {d.record.resetConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
