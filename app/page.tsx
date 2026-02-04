'use client'
import TopBar from "@/components/Topbar"
import EmptyState from "@/components/WorkeSpaceEmpty"
import Column from "@/components/Column"
import { useProjectStore } from "@/store/projectStore"
import AIToolsModal from "@/components/AIToolsModal"
import Card from "@/components/Card"


export default function Home() {
  
const projects = useProjectStore((state) => state.projects)  
const activeProjectId = useProjectStore((state)=> state.activeProjectId)

const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <div className="flex-1 bg-gray-50">
      <TopBar />
      
      {!activeProject ? (
        <EmptyState />
      ) : (
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4">
            {activeProject.columns.map((col)=> 

            <Column title={activeProject.name} color="#4F46E5" cardCount={3} />

            )}
           
            <div>
              {}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}