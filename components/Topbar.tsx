'use client'

import { Button } from "@/components/ui/button"
import { memo, useEffect, useState } from "react"
import AIToolsModal from "@/components/AIToolsModal"
import { useProjectStore } from "@/store/projectStore"
import { useShallow } from "zustand/react/shallow"
import { LayoutTemplate, PanelLeft } from "lucide-react"
import { titleCase } from "@/lib/utils"

const TopBar = memo(function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      return {
        name: proj.name,
        cardsDone: proj.columns.flatMap((c) => c.cards).filter((card) => card.isDone).length,
        cardsTotal: proj.columns.reduce((acc, c) => acc + c.cards.length, 0),
      }
    })
  )

  if (!project) return null

  // The ring tracks CARDS (whole-card completion), not subtasks — simpler
  // signal at a glance.
  const percent =
    project.cardsTotal === 0 ? 0 : Math.round((project.cardsDone / project.cardsTotal) * 100)
  const isComplete = project.cardsTotal > 0 && project.cardsDone === project.cardsTotal

  return (
    <>
      <header
        className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30
                   border-b border-border backdrop-blur
                   flex h-16 shrink-0 items-center gap-3 px-4 md:px-6"
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
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Progress ring "avatar" */}
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percent}% of cards completed`}
            title={`${project.cardsDone} of ${project.cardsTotal} cards done`}
            className="relative size-10 shrink-0"
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
              className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums ${
                isComplete ? "text-success" : "text-foreground"
              }`}
            >
              {percent}%
            </span>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg leading-tight font-semibold tracking-tight">
              {titleCase(project.name)}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
              {project.cardsDone}/{project.cardsTotal} cards completed
            </p>
          </div>
        </div>

        {/* Actions */}
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="shadow-xs hover:bg-primary/90 flex items-center gap-2"
        >
          <LayoutTemplate />
          Canvas Tools
        </Button>
      </header>

      <AIToolsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
})

export default memo(TopBar)
