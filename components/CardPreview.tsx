'use client'

import { memo, useMemo, useState } from "react"
import { CheckSquare, Check } from "lucide-react"
import { CardDetailsDrawer } from "./CardDetailsDrawer"
// Adjust this import path to match where your Zustand store is located
import { useProjectStore } from "@/store/projectStore"

interface Task {
  text: string
  done: boolean
}

// ✅ Updated to match the new store schema
interface CardType {
  id: string
  title: string
  description?: string 
  color: string
  isDone: boolean
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
  const[isOpen, setIsOpen] = useState(false)
  
  // ✅ Bring in the toggle function from your Zustand store
  const toggleCardIsDone = useProjectStore((state) => state.toggleCardIsDone)

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
  },[card.tasks])

  // ✅ Handler for clicking the Checkbox
  const handleToggleDone = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation() // Prevents the card drawer from opening
    e.preventDefault()
    toggleCardIsDone(projectId, colId, card.id)
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
        // We use data-done to easily style the entire card when it's completed
        data-done={card.isDone}
        className="
          group relative flex w-full cursor-pointer flex-col 
          rounded-xl border border-border/60 bg-card p-5 
          shadow-sm transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-primary/40 hover:shadow-md
          data-[done=true]:opacity-60 data-[done=true]:grayscale-[0.3]
          overflow-hidden
        "
      >
        {/* The Fused Modern Radial Glow (Using your exact tweaked opacities) */}
        {card.color && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.50] transition-opacity duration-300 group-hover:opacity-[0.65] dark:opacity-[0.35] dark:group-hover:opacity-[0.45]"
            style={{
              background: `radial-gradient(120% 120% at 0% 0%, ${card.color} 0%, transparent 80%)`,
            }}
          />
        )}

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col gap-4">
          
          <div className="flex items-start justify-between gap-3">
            {/* Title & Description Column */}
            <div className="flex flex-1 flex-col gap-1.5">
              <h4 
                className="line-clamp-2 wrap-break-word text-xl font-semibold leading-snug tracking-tight text-card-foreground transition-all group-data-[done=true]:line-through group-data-[done=true]:text-muted-foreground"
              >
                {card.title}
              </h4>
              
              {/* ✅ Added Description Field */}
              {card.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground/90">
                  {card.description}
                </p>
              )}
            </div>

            {/* ✅ Interactive Checkbox Button for Full Card Completion */}
            <button
              onClick={handleToggleDone}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleToggleDone(e)
              }}
              // Tailwind 4 size utility (size-6 = h-6 w-6)
              className="
                mt-1 flex size-6 shrink-0 items-center justify-center rounded-full 
                border-2 border-border/80 transition-all duration-200
                hover:scale-110 hover:border-green-500 hover:bg-green-500/10
                group-data-[done=true]:border-green-500 group-data-[done=true]:bg-green-500
              "
              aria-label={card.isDone ? "Mark as undone" : "Mark as done"}
            >
              {card.isDone && <Check className="size-3.5 text-white stroke-3" />}
            </button>
          </div>

          {/* Footer: Task count */}
          {hasTasks && (
            <div className="mt-1 flex items-center">
              <div
                className={`
                  flex items-center gap-1.5 text-xs font-medium transition-colors
                  ${
                    isAllDone || card.isDone
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground group-hover:text-card-foreground/80"
                  }
                `}
              >
                {/* Tailwind 4 size utility */}
                <CheckSquare className="size-4" />
                <span>
                  {completed} / {total} tasks completed
                </span>
              </div>
            </div>
          )}
          
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