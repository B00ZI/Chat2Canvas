'use client'

import { memo, useMemo } from "react"
import { GripHorizontal } from "lucide-react"
import { CardDetailsDrawer } from "@/components/CardDetailsDrawer"
import { TagPill } from "@/components/TagPill"
import { useProjectStore, TEST_MODE } from "@/store/projectStore"
import { Card } from "@/lib/types"

interface CardPreviewProps {
  card: Card
  projectId: string
  colId: string
  dragHandleProps?: Record<string, unknown>
}

function CardPreview({
  card,
  projectId,
  colId,
  dragHandleProps,
}: CardPreviewProps) {
  // Drawer state is global so the floating panel can swap cards live
  // without closing (see CardDetailsDrawer).
  const openCard = useProjectStore((s) => s.openCard)
  const setOpenCard = useProjectStore((s) => s.setOpenCard)

  const isOpen = openCard?.cardId === card.id

  function openDrawer() {
    if (!TEST_MODE) setOpenCard({ colId, cardId: card.id })
  }

  const { total, completed, hasTasks, isAllDone } = useMemo(() => {
    const tasks = card.tasks || []
    const total = tasks.length
    const completed = tasks.filter((t) => t.done).length
    return {
      total,
      completed,
      hasTasks: total > 0,
      isAllDone: total > 0 && total === completed,
    }
  }, [card.tasks])

  // Completion reads as success whether the card was explicitly marked
  // done or every subtask got checked.
  const progressComplete = card.isDone || isAllDone

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDrawer}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openDrawer()
          }
        }}
        aria-expanded={isOpen}
        data-done={card.isDone}
        className="
          group relative flex w-full cursor-pointer flex-col gap-2
          rounded-xl border border-border bg-card p-3.5 pt-3
          shadow-xs transition-all duration-200 ease-out
          hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md
          focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none
          data-[done=true]:opacity-55 data-[done=true]:grayscale-[0.35]
          data-[done=true]:hover:opacity-70
        "
      >
        {/* Tags — small pills above the title; title stays dominant */}
        {(card.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags!.map((tag, i) => (
              <TagPill key={`${tag.name}-${i}`} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}

        <h4
          className="
            line-clamp-2 wrap-break-word text-base leading-snug font-semibold tracking-tight
            transition-all group-data-[done=true]:text-muted-foreground
            group-data-[done=true]:line-through
          "
        >
          {card.title}
        </h4>

        {card.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {card.description}
          </p>
        )}

        {/* Segmented task progress */}
        {hasTasks && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completed}
            aria-label={`${completed} of ${total} subtasks done`}
            className="border-t border-border/60 pt-2.5"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                Progress
              </span>
              <span
                className={`text-xs font-medium tabular-nums ${
                  progressComplete ? "text-success" : "text-muted-foreground"
                }`}
              >
                {completed}/{total}
              </span>
            </div>

            {/* One segment per task */}
            <div className="mt-1.5 flex gap-[3px]">
              {(card.tasks ?? []).map((task, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    task.done
                      ? progressComplete
                        ? "bg-success"
                        : "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dedicated drag zone — full-width footer strip, the only place a
            card can be grabbed from. Body clicks stay pure "open". */}
        <div
          {...dragHandleProps}
          aria-label="Drag card"
          onClick={(e) => e.stopPropagation()}
          className="
            -mx-3.5 -mb-3.5 mt-2 flex cursor-grab items-center justify-center
            rounded-b-xl border-t border-border/60 bg-muted/20 py-2
            select-none touch-none active:cursor-grabbing hover:bg-muted/50
          "
        >
          <GripHorizontal className="text-muted-foreground/60 size-[18px] shrink-0 transition-colors group-hover:text-muted-foreground" />
        </div>
      </div>

      {isOpen && (
        <CardDetailsDrawer
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) setOpenCard(null)
          }}
          projectId={projectId}
          colId={colId}
          card={card}
        />
      )}
    </>
  )
}

export default memo(CardPreview)
