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
        // Layout: Balanced padding (p-5), softened border, and sleek hover lift
        className="
          group relative flex w-full cursor-pointer flex-col 
          rounded-xl border border-border/60 bg-card p-5 
          shadow-sm transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-primary/40 hover:shadow-md
          overflow-hidden
        "
      >
        {/* 1. The Fused Modern Radial Glow */}
        {card.color && (
          <div
            // Opacity is perfectly tuned: 15% light mode, 25% dark mode (increases on hover)
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.50] transition-opacity duration-300 group-hover:opacity-[0.65] dark:opacity-[0.35] dark:group-hover:opacity-[0.45]"
            style={{
              // Switched to a radial gradient for a modern, smooth "spotlight" effect
              background: `radial-gradient(120% 120% at 0% 0%, ${card.color} 0%, transparent 80%)`,
            }}
          />
        )}

        {/* 2. Content Wrapper */}
        <div className="relative z-10 flex flex-col gap-4">
          
          {/* Title: Added tracking-tight for a more premium typography feel */}
          <h4 className="line-clamp-3 break-words text-xl font-semibold leading-snug tracking-tight text-card-foreground">
            {card.title}
          </h4>

          {/* Footer: Task count (Only shows if tasks exist) */}
         
            <div className="mt-1 flex items-center">
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