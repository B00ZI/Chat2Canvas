'use client'

import { X } from "lucide-react"

interface TagPillProps {
  name: string
  color: string
  onRemove?: () => void
}

/** Small tinted tag pill — used on card faces and in the drawer editor. */
export function TagPill({ name, color, onRemove }: TagPillProps) {
  return (
    <span
      className="inline-flex max-w-32 shrink-0 items-center gap-1.5 rounded-full py-0.5 pl-2 text-[10px] font-semibold tracking-wide"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 16%, var(--card))`,
        color: `color-mix(in oklab, ${color} 55%, var(--foreground))`,
        paddingRight: onRemove ? "0.25rem" : "0.5rem",
      }}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate uppercase">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove tag ${name}`}
          className="hover:bg-black/10 dark:hover:bg-white/15 -mr-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  )
}
