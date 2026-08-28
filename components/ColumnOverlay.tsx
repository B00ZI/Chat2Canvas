'use client'

import { Column } from "@/lib/types"

interface ColumnOverlayProps {
  col: Column
}

/** Drag ghost for columns — mirrors the resting Column chrome. */
export function ColumnOverlay({ col }: ColumnOverlayProps) {
  return (
    <div
      style={{
        backgroundColor: col.color
          ? `color-mix(in oklab, ${col.color} 9%, var(--card))`
          : "var(--card)",
      }}
      className="rounded-xl p-4 w-80 shrink-0 flex flex-col max-h-[80vh]
                 shadow-xl border border-border-strong opacity-95"
    >
      <div className="flex items-center gap-2.5">
        {col.color && (
          <span
            aria-hidden
            className="mt-px size-3 shrink-0 rounded-full shadow-xs"
            style={{ backgroundColor: col.color }}
          />
        )}

        <h3 className="max-w-[9rem] truncate text-sm font-semibold tracking-tight text-foreground">
          {col.title}
        </h3>

        <span className="bg-muted text-muted-foreground mt-px shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none tabular-nums">
          {col.cards.length}
        </span>
      </div>

      <div className="scrollbar-slim mt-4 flex-1 space-y-3 overflow-x-hidden overflow-y-auto py-1 pr-0.5">
        {col.cards.map((card) => (
          <div
            key={card.id}
            className="text-card-foreground w-full rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <h4 className="truncate text-sm font-medium text-foreground">
              {card.title}
            </h4>
            {card.tasks.length > 0 && (
              <p className="text-muted-foreground mt-2 text-[11px] tabular-nums">
                {card.tasks.filter((t) => t.done).length}/{card.tasks.length} tasks
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
