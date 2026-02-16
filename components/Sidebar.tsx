'use client'
import { Search, Plus } from "lucide-react"
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
        <div className="bg-sidebar w-60 h-screen pb-4 flex flex-col border-r border-sidebar-border">



            {/* Header */}
            <div className="h-20 flex justify-center items-center border-b border-sidebar-border">
                <h2 className="text-2xl font-bold text-sidebar-foreground">Chat2Canvas</h2>
            </div>

            {/* Projects Section */}
            <div className="flex-1 flex flex-col overflow-y-auto">

                <div className="space-y-2 p-4  ">

                    <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start px-3 py-1 ${isModalOpen
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Search className="shrink-0" />
                        <span>Search Projects</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start px-3 py-1 ${isModalOpen
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="shrink-0" />
                        <span>New Project</span>
                    </Button>

                </div>
                <div className="space-y-2 flex-1 p-4  border-t border-sidebar-border">
                    <h2 className="text-sidebar-foreground/70 text-sm  mb-4">Projects</h2>
                    {projects.map((project) => (
                        <div
                            role="button"
                            key={project.id}
                            tabIndex={0}
                            onClick={() => setActiveProject(project.id)}
                            className={`flex items-center justify-between px-3 py-1 rounded-md  cursor-pointer 
                                ${activeProjectId === project.id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                        >
                            <span className="flex-1 truncate max-w-[140px]">
                                {project.name
                                    .split(" ")
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5 p-0  transform rotate-90"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProjectId(project.id);
                                }}
                            >
                                ⋮
                            </Button>
                        </div>
                    ))}



                    {/* New Project */}

                </div>

            </div>

            {/* Dark/Light Toggle */}
            <div className="p-4 border-t border-sidebar-border">
                <Button variant="outline" size="sm" className="w-full">
                    Toggle Dark / Light
                </Button>
            </div>

            {/* Profile Section */}
            <div className="p-4 border-t border-sidebar-border flex items-center space-x-3">
                {/* Placeholder avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                    A
                </div>
                <div className="flex flex-col">
                    <span className="text-sidebar-foreground font-semibold">Alex Email</span>
                    <span className="text-sidebar-muted text-sm">alex@example.com</span>
                </div>
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
