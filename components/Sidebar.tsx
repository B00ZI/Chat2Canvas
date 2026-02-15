'use client'

import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { NewProjectDialog } from "./NewProjectDialog"
import { EditProjectDialog } from "./EditProjectDialog"
import { Button } from "@/components/ui/button"

export default function Sidebar() {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const setActiveProject = useProjectStore((state) => state.setActiveProject)

  const editingProject = projects.find(p => p.id === editingProjectId)

  return (
    <div className="bg-sidebar w-60 h-screen pb-4 flex flex-col space-y-4 border-r border-sidebar-border">
      
      {/* Header */}
      <div className="h-20 flex justify-center items-center border-b border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-foreground">Chat2Canvas</h2>
      </div>

      {/* Project list */}
      <div className="space-y-2 p-4 flex-1 overflow-y-auto">
        {projects.map((project) => (
          <Button
            key={project.id}
            variant={activeProjectId === project.id ? "default" : "secondary"}
            size="sm"
            className="w-full flex justify-between items-center px-3 py-2 rounded cursor-pointer"
            onClick={() => setActiveProject(project.id)}
          >
            <span>{project.name}</span>

            {/* Three dots button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                setEditingProjectId(project.id)
              }}
            >
              ⋮
            </Button>
          </Button>
        ))}

        {/* New Project */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start mt-2"
          onClick={() => setIsModalOpen(true)}
        >
          + New Project
        </Button>
      </div>

      {/* Dialogs */}
      {editingProject && (
        <EditProjectDialog
          open={true}
          onClose={() => setEditingProjectId(null)}
          projectId={editingProject.id}
          projectName={editingProject.name}
        />
      )}
      <NewProjectDialog open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
