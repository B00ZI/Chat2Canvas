'use client'

import { memo, useMemo, useState } from "react"
import { CheckSquare } from "lucide-react" 
import { CardDetailsDrawer } from "./CardDetailsDrawer"

interface Task {
  text: string
  done: boolean
}

interface CardType {
  id: string
  title: string
  color: string 
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
        // Clean layout: Added a thick top border (border-t-4)
        className="
          group relative flex w-full cursor-pointer flex-col gap-3 
          rounded-xl border border-border border-t-4 bg-card p-4 
          shadow-xs transition-all hover:shadow-md
        "
        // Injects the dynamic color exactly into the top border
        style={{ borderTopColor: card.color || "var(--color-border)" }}
      >
        {/* Title: Bigger, bolder, and acts as the main content */}
        <h4 className="line-clamp-3 break-words text-base font-semibold leading-snug text-card-foreground">
          {card.title}
        </h4>

        {/* Footer: Icon + Explicit Text */}
        {hasTasks && (
          <div className="mt-1 flex items-center">
            <div
              className={`
                flex items-center gap-1.5 text-xs font-medium transition-colors
                ${
                  isAllDone
                    ? "text-green-600 dark:text-green-400" // Green when fully completed
                    : "text-muted-foreground group-hover:text-card-foreground/80"
                }
              `}
            >
              <CheckSquare className="h-4 w-4" />
              <span>
                {completed} / {total} tasks completed
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