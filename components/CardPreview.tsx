'use client'

import { memo, useMemo, useState } from "react"
import { CheckSquare, Check } from "lucide-react"
import { CardDetailsDrawer } from "@/components/CardDetailsDrawer"
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
  const [isOpen, setIsOpen] = useState(false)

  const toggleCardIsDone = useProjectStore((state) => state.toggleCardIsDone)

  const { completed, total, hasTasks, percent, isAllDone } = useMemo(() => {
    const tasks = card.tasks || []
    const total = tasks.length
    const completed = tasks.filter((t) => t.done).length
    return {
      total,
      completed,
      hasTasks: total > 0,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      isAllDone: total > 0 && total === completed,
    }
  }, [card.tasks])

  const handleToggleDone = (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (!TEST_MODE) toggleCardIsDone(projectId, colId, card.id)
  }

  // Celebration trigger: fire once per transition into "done" (render-time
  // state adjustment — no effect, no setState-in-effect lint violation).
  const [pulse, setPulse] = useState<{ key: number } | null>(null)
  const [prevDone, setPrevDone] = useState(card.isDone)
  if (prevDone !== card.isDone) {
    setPrevDone(card.isDone)
    if (card.isDone) setPulse((p) => ({ key: (p?.key ?? 0) + 1 }))
  }

  return (
    <>
      <div
        {...dragHandleProps}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        // data-done drives the completed-card treatment
        data-done={card.isDone}
        className="
          group relative flex w-full cursor-pointer flex-col gap-3
          rounded-xl border border-border bg-card p-4
          shadow-xs transition-all duration-200 ease-out
          hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md
          focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none
          data-[done=true]:opacity-55 data-[done=true]:grayscale-[0.35]
          data-[done=true]:hover:opacity-70
        "
      >
        {/* Title row: content-color spine dot + title + completion toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            {card.color && (
              <span
                aria-hidden
                className="mt-[7px] size-2 shrink-0 rounded-full"
                style={{ backgroundColor: card.color }}
              />
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
          </div>

          <button
            onClick={handleToggleDone}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleToggleDone(e)
            }}
            aria-label={card.isDone ? "Mark as undone" : "Mark as done"}
            data-done={card.isDone}
            className={`after:absolute after:-inset-1.5 after:rounded-full after:content-['']
              relative mt-0 flex size-7 shrink-0 cursor-pointer items-center justify-center
              rounded-full border-2 transition-all duration-150 active:scale-90
              focus-visible:ring-ring/60 focus-visible:ring-2 focus-visible:outline-none ${
                card.isDone
                  ? // Done look is applied unconditionally so hovering can
                    // never make a completed card read as incomplete.
                    "border-success bg-success"
                  : "border-border-strong hover:border-success hover:bg-success/10"
              }`}
          >
            {/* One-shot radiating ring on completion */}
            {card.isDone && pulse && (
              <span
                key={`pulse-${pulse.key}`}
                aria-hidden
                className="done-pulse border-success pointer-events-none absolute inset-0 rounded-full border-2"
              />
            )}

            {card.isDone && (
              <Check
                key={`check-${pulse ? `pop-${pulse.key}` : "initial"}`}
                className="check-pop text-background relative size-4 stroke-[3]"
              />
            )}
          </button>
        </div>

        {card.description && (
          <p className="text-muted-foreground -mt-1.5 line-clamp-2 text-sm leading-relaxed">
            {card.description}
          </p>
        )}

        {/* Task progress: compact count + hairline bar */}
        {hasTasks && (
          <div className="flex items-center gap-2">
            <CheckSquare
              className={`size-3.5 shrink-0 ${
                isAllDone || card.isDone ? "text-success" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-[11px] font-medium tabular-nums ${
                isAllDone || card.isDone ? "text-success" : "text-muted-foreground"
              }`}
            >
              {completed}/{total}
            </span>
            <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                  isAllDone || card.isDone ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <CardDetailsDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        projectId={projectId}
        colId={colId}
        card={card}
      />
    </>
  )
}

export default memo(CardPreview)
