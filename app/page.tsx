'use client'
import TopBar from "@/components/Topbar"
import EmptyState from "@/components/WorkeSpaceEmpty"
import Column from "@/components/Column"
import { useProjectStore } from "@/store/projectStore"
import { Button } from "@/components/ui/button"
import { NewColumnDialog } from "@/components/NewColumnDialog "
import { useState } from "react"

export default function Home() {
 
  const [isNewColumnDialogOpen , setIsNewColumnDialogOpen ] = useState<boolean>(false)
  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)

  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <div className="flex-1 bg-gray-50">
      <TopBar />

      {!activeProject ? (
        <EmptyState />
      ) : (
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4">
            {activeProject.columns.map((col) =>

              <Column key={col.id} col={col} projectId={activeProject.id} />

            )}

            <div className=" bg-white rounded-lg p-4 w-80 shrink-0 shadow-sm border border-gray-200">
              <Button  onClick={()=>setIsNewColumnDialogOpen(true)} className="h-full w-full">
                + Add Colomn
              </Button>
              <NewColumnDialog  open={isNewColumnDialogOpen} onClose={()=>setIsNewColumnDialogOpen(false)} projectId={activeProject.id} />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}