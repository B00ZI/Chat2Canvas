"use client"

import { Button } from "./ui/button"
import { useState } from "react"
import AIToolsModal from "./AIToolsModal"
import { useProjectStore } from "@/store/projectStore"
import { LayoutTemplate    } from "lucide-react"

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
      <div className="h-20 bg-sidebar border-b border-sidebar-foreground px-6 flex items-center justify-between">
        {/* Left - Project Name */}
        <div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">
            {activeProject.name
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h1>

          <p className="text-sm text-sidebar-foreground/70 flex items-center gap-2 mt-1">
            {allTasks.length === 0
              ? "No tasks yet"
              : `${doneTasks} of ${allTasks.length} tasks completed`}
          </p>
        </div>

        {/* Right - Buttons */}
        <div className="flex gap-2">
          <Button
          className="flex gap-2"
            variant="default"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          > 
            <LayoutTemplate   />
            AI Tools
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
