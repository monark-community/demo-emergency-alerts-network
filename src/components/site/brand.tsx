import { cn } from "@/lib/utils"

/**
 * Guardian mark: a signage plate in exit green with a dot (you) and two arcs
 * (the radius) opening up and to the right: someone nearby is listening.
 */
export function GuardianMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect width="32" height="32" rx="6" className="fill-primary" />
      <circle cx="10.5" cy="21.5" r="3.2" className="fill-primary-foreground" />
      <path
        d="M10.5 13.2a8.3 8.3 0 0 1 8.3 8.3"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <path
        d="M10.5 6.4a15.1 15.1 0 0 1 15.1 15.1"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
    </svg>
  )
}

export function GuardianWordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <GuardianMark className={cn("size-7", markClassName)} />
      <span className="font-sign-wide text-[0.95rem] leading-none">GUARDIAN</span>
    </span>
  )
}
