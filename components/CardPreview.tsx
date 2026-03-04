'use client'

import { memo, useMemo, useState } from "react"
import { CheckSquare } from "lucide-react" // Make sure to install lucide-react for the icon
import { CardDetailsDrawer } from "./CardDetailsDrawer"

interface Task {
  text: string
  done: boolean
}

interface CardType {
  id: string
  title: string
  color: string // Used as a label/cover color now
  tasks: Task[]
}

interface CardPreviewProps {
  card: CardType
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

  const { completed, total, hasTasks, isAllDone } = useMemo(() => {
    const tasks = card.tasks ||[]
    const total = tasks.length
    const completed = tasks.filter((t) => t.done).length
    return {
      total,
      completed,
      hasTasks: total > 0,
      isAllDone: total > 0 && total === completed,
    }
  }, [card.tasks])

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
        // Modern UI: Clean border, standard card background, subtle hover lift
        className="
          group relative flex w-full cursor-pointer flex-col gap-2.5 
          rounded-xl border border-border bg-card p-3 shadow-xs 
          transition-all hover:border-primary/30 hover:shadow-md
         
        "
      >
        {/* 1. Trello-style Color Label */}
        {card.color && (
          <div
            className="h-2 w-12 rounded-full"
            style={{ backgroundColor: card.color }}
            aria-hidden="true"
          />
        )}

        {/* 2. Title: Sized down for Kanban readability */}
        <h4 className="line-clamp-3 wrap-break-word text-sm font-medium leading-relaxed text-card-foreground">
          {card.title}
        </h4>

        {/* 3. Footer / Task Badge */}
        {hasTasks && (
          <div className="mt-1 flex items-center">
            <div
              className={`
                flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors
                ${
                  isAllDone
                    ? "bg-green-500/15 text-green-700 dark:text-green-400" // Turns green when done!
                    : "text-muted-foreground group-hover:bg-muted"
                }
              `}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>
                {completed}/{total}
              </span>
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