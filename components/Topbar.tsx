"use client"

import { Button } from "./ui/button"
import { useState } from "react"
import AIToolsModal from "./AIToolsModal"
import { useProjectStore } from "@/store/projectStore"
import { LayoutTemplate } from "lucide-react"

export default function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const projects = useProjectStore((state) => state.projects)

  if (!activeProjectId) return null
  const activeProject = projects.find((proj) => proj.id === activeProjectId)
  if (!activeProject) return null

  const allTasks = activeProject.columns.flatMap(col =>
    col.cards.flatMap(card => card.tasks)
  )
  const doneTasks = allTasks.filter(t => t.done).length

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
          {activeProject.name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </h1>

        <p className="text-xs text-sidebar-foreground/70 flex items-center gap-2 mt-1">
          {allTasks.length === 0 ? (
            "No tasks yet"
          ) : (
            <>
              <span
                className="px-2 py-0.5 rounded-sm
                           bg-sidebar-accent-foreground
                           text-sidebar-primary
                           text-xs font-medium"
              >
                {Math.round((doneTasks / allTasks.length) * 100)}%
              </span>

              <span>
                {doneTasks} of {allTasks.length} tasks completed
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

}
