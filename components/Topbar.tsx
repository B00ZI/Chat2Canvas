"use client"
import { Button } from "./ui/button"
import { useState } from "react"
import AIToolsModal from "./AIToolsModal"
import { useProjectStore } from "@/store/projectStore"

export default function TopBar() {
  // State to control modal open/closed
  const [isModalOpen, setIsModalOpen] = useState(false)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const projects = useProjectStore((state) => state.projects)
  if (!activeProjectId) {
    return
  }
  const activeProject = projects.find((proj) => proj.id === activeProjectId)
  if (!activeProject) {
    return
  }
  const allTasks = activeProject.columns.flatMap(col =>
    col.cards.flatMap(card => card.tasks)
  );

  let doneTasks = allTasks.filter(t => t.done).length




  return (
    <>
      <div className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        {/* Left - Project Name */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{activeProject.name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}</h1>
          
          <p className="text-sm text-gray-500">{allTasks.length=== 0 ? 'No tasks yet' : `${doneTasks} of ${allTasks.length} tasks completed `}</p>
        </div>

        {/* Right - Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}  // Opens modal
          >
            AI Tools
          </Button>
          <Button>New Column</Button>
        </div>
      </div>

      {/* Modal - controlled by state */}
      <AIToolsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}  // Closes modal
      />
    </>
  )
}