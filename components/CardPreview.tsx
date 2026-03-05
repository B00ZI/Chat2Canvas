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
        // Layout: Increased py-5 (top/bottom padding), added overflow-hidden for the background
        // Hover: -translate-y-1 makes it lift up slightly, shadow increases
        className="
          group relative flex w-full cursor-pointer flex-col 
          rounded-xl border border-border bg-card px-4 py-5 
          shadow-sm transition-all duration-200 ease-in-out
          hover:-translate-y-1 hover:border-primary/30 hover:shadow-md
          overflow-hidden
        "
      >
        {/* 1. The Fused Background Gradient */}
        {card.color && (
          <div 
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] transition-opacity duration-200 group-hover:opacity-[0.2] dark:opacity-[0.20] dark:group-hover:opacity-[0.28]"
            style={{ 
              background: `linear-gradient(135deg, ${card.color} 0%, transparent 80%)` 
            }}
          />
        )}

        {/* 2. Content Wrapper (z-10 keeps it above the background gradient) */}
        <div className="relative z-10 flex flex-col gap-3">
          
          {/* Title: Enlarged to text-lg and made bolder */}
          <h4 className="line-clamp-3 break-words text-xl font-semibold leading-snug text-card-foreground">
            {card.title}
          </h4>

          {/* Footer: Task count */}
          
            <div className="mt-2 flex items-center">
              <div
                className={`
                  flex items-center gap-1.5 text-xs font-medium transition-colors
                  ${
                    isAllDone
                      ? "text-green-600 dark:text-green-400" 
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
          
        </div>
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