'use client'

import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { closestCenter } from '@dnd-kit/core'

import TopBar from "@/components/Topbar"
import EmptyState from "@/components/WorkeSpaceEmpty"
import Column from "@/components/Column"
import { useProjectStore } from "@/store/projectStore"
import { Button } from "@/components/ui/button"
import { NewColumnDialog } from "@/components/NewColumnDialog "
import { useState } from "react"

export default function Home() {

  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState<boolean>(false)
  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const reorderCards = useProjectStore((state) => state.reorderCards)

  const activeProject = projects.find(p => p.id === activeProjectId)


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find which column contains the dragged card
    const column = activeProject?.columns.find(col =>
      col.cards.some(card => card.id === active.id)
    )

    if (!column) return

    const oldIndex = column.cards.findIndex(c => c.id === active.id)
    const newIndex = column.cards.findIndex(c => c.id === over.id)

    if (oldIndex !== newIndex && activeProject) {
      reorderCards(activeProject.id, column.id, oldIndex, newIndex)
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      <TopBar />

      {!activeProject ? (
        <EmptyState />
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="p-6 overflow-x-auto">
            <div className="flex gap-4">
              {activeProject.columns.map((col) =>

                <Column key={col.id} col={col} projectId={activeProject.id} />

              )}

              <div className=" bg-white rounded-lg p-4 w-80 shrink-0 shadow-sm border border-gray-200">
                <Button onClick={() => setIsNewColumnDialogOpen(true)} className="h-full w-full">
                  + Add Colomn
                </Button>
                <NewColumnDialog open={isNewColumnDialogOpen} onClose={() => setIsNewColumnDialogOpen(false)} projectId={activeProject.id} />
              </div>

            </div>
          </div>
        </DndContext>
      )}
    </div>
  )
}