'use client'

import { Button } from "@/components/ui/button"
import { memo, useState } from "react"
import AIToolsModal from "@/components/AIToolsModal"
import { useProjectStore } from "@/store/projectStore"
import { useShallow } from "zustand/react/shallow"
import { LayoutTemplate } from "lucide-react"

const TopBar = memo(function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const project = useProjectStore(
    useShallow((state) => {
      const proj = state.projects.find(p => p.id === state.activeProjectId)
      if (!proj) return null
      const allTasks = proj.columns.flatMap(c => c.cards.flatMap(card => card.tasks))
      const doneTasks = allTasks.filter(t => t.done).length
      return { name: proj.name, allTasks: allTasks.length, doneTasks }
    })
  )

  if (!project) return null

  return (
  <>
    <div
      className="h-20 bg-sidebar text-sidebar-foreground
                 border-b border-sidebar-border
                 px-6 flex items-center justify-between"
    >
      {/* Left - Project Name */}
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">
          {project.name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </h1>

        <p className="text-xs text-sidebar-foreground/70 flex items-center gap-2 mt-1">
          {project.allTasks === 0 ? (
            "No tasks yet"
          ) : (
            <>
              <span
                className="px-2 py-0.5 rounded-sm
                           bg-sidebar-accent-foreground
                           text-sidebar-primary
                           text-xs font-medium"
              >
                {Math.round((project.doneTasks / project.allTasks) * 100)}%
              </span>

              <span>
                {project.doneTasks} of {project.allTasks} tasks completed
              </span>
            </>
          )}
        </p>
      </div>

      {/* Right - Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2
                     bg-sidebar-primary
                     text-sidebar-primary-foreground
                     shadow-xs
                     hover:opacity-90"
        >
          <LayoutTemplate className="h-4 w-4" />
          Canvas Tools
        </Button>
      </div>
    </div>

    {/* Modal */}
    <AIToolsModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </>
)

})

export default memo(TopBar)
