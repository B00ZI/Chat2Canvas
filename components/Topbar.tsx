'use client'

import { Button } from "@/components/ui/button"
import { memo, useEffect, useState } from "react"
import AIToolsModal from "@/components/AIToolsModal"
import { useProjectStore } from "@/store/projectStore"
import { useShallow } from "zustand/react/shallow"
import { LayoutTemplate, PanelLeft, Maximize2 } from "lucide-react"
import { titleCase } from "@/lib/utils"
import { useFocusMode } from "@/lib/ui-state"

const TopBarInner = memo(function TopBarInner() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [focus, toggleFocus] = useFocusMode()

  // Command palette can open Canvas Tools remotely.
  useEffect(() => {
    const handler = () => setIsModalOpen(true)
    window.addEventListener("c2c:open-canvas-tools", handler)
    return () => window.removeEventListener("c2c:open-canvas-tools", handler)
  }, [])

  const project = useProjectStore(
    useShallow((state) => {
      const proj = state.projects.find((p) => p.id === state.activeProjectId)
      if (!proj) return null
      const cards = proj.columns.flatMap((c) => c.cards)
      return {
        name: proj.name,
        cardsDone: cards.filter((card) => card.isDone).length,
        cardsTotal: cards.length,
      }
    })
  )

  if (!project) return null

  // The ring tracks CARDS (whole-card completion), not subtasks — simpler
  // signal at a glance.
  const percent =
    project.cardsTotal === 0
      ? 0
      : Math.round((project.cardsDone / project.cardsTotal) * 100)
  const isComplete =
    project.cardsTotal > 0 && project.cardsDone === project.cardsTotal

  return (
    <>
      <header
        className={`bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30
                   border-b border-border backdrop-blur
                   flex h-[72px] shrink-0 items-center gap-3 px-4 md:px-6
                   transition-[margin,transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                     focus
                       ? "pointer-events-none -mt-[72px] -translate-y-3 opacity-0"
                       : ""
                   }`}
      >
        {/* Mobile sidebar trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={() => window.dispatchEvent(new CustomEvent("c2c:open-sidebar"))}
        >
          <PanelLeft />
        </Button>

        {/* Project profile: completion ring + name */}
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          {/* Progress ring "avatar" */}
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percent}% of cards completed`}
            title={`${project.cardsDone} of ${project.cardsTotal} cards done`}
            className="relative size-12 shrink-0"
          >
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                strokeWidth="4.5"
                className="stroke-muted"
              />
              {percent > 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${percent} 100`}
                  className={`transition-[stroke-dasharray] duration-500 ease-out ${
                    isComplete ? "stroke-success" : "stroke-primary"
                  }`}
                />
              )}
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums ${
                isComplete ? "text-success" : "text-foreground"
              }`}
            >
              {percent}%
            </span>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl leading-tight font-semibold tracking-tight">
              {titleCase(project.name)}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-[13px] tabular-nums">
              {project.cardsDone}/{project.cardsTotal} cards completed
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Enter focus mode"
            title="Focus mode — hide sidebar and top bar (Esc to exit)"
            onClick={toggleFocus}
            className="text-muted-foreground hover:text-foreground"
          >
            <Maximize2 />
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="shadow-xs hover:bg-primary/90 ml-1 flex items-center gap-2"
          >
            <LayoutTemplate />
            Canvas Tools
          </Button>
        </div>
      </header>

      <AIToolsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
})

export default memo(TopBarInner)
