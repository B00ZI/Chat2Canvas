'use client'
import { Search, Plus, Shapes, SunMoon, LogOut } from "lucide-react"
import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { NewProjectDialog } from "./NewProjectDialog"
import { EditProjectDialog } from "./EditProjectDialog"
import { Button } from "@/components/ui/button"
import { Switch } from "./ui/switch"

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
            <div className="h-20 flex items-center gap-3 px-4 border-b border-sidebar-border">
                <div
                    className="h-8 w-8 flex items-center justify-center rounded-md
               text-sidebar-accent"
                >
                    <Shapes className="h-6 w-6" />
                </div>

                <h2 className="text-xl font-semibold tracking-tight text-sidebar-foreground leading-none">
                    Chat2Canvas
                </h2>
            </div>


            {/* Projects Section */}
            <div className="flex-1 flex flex-col overflow-y-auto">

                <div className="space-y-2 p-4  ">

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Search className="shrink-0" />
                        <span>Search Projects</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                            className={`flex items-center justify-between px-3 py-1 rounded-md  cursor-pointer  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring
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

            <div className="mt-auto border-t border-sidebar-border">

                {/* Profile */}
                <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sidebar-accent text-sidebar-accent-foreground
                    flex items-center justify-center text-sm font-semibold">
                        A
                    </div>

                    <div className="min-w-0">
                        <div className="text-sm font-medium text-sidebar-foreground leading-tight truncate">
                            Alex
                        </div>
                        <div className="text-xs text-sidebar-foreground/60 truncate">
                            alex@example.com
                        </div>
                    </div>
                </div>


                {/* Logout */}
                <div className="px-4 pb-2">
                    <div
                        className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer
              text-destructive
             hover:bg-destructive hover:text-destructive-foreground
             focus-visible:outline-none focus-visible:ring-1
             focus-visible:ring-sidebar-ring"
                    >
                        <LogOut className="h-4 w-4 shrink-0 " />
                        <span>Log out</span>
                    </div>
                </div>

                {/* Theme toggle row */}
                <div className="px-4 pb-1">
                    <div
                        role="button"
                        tabIndex={0}

                        className="flex items-center justify-between rounded-md px-3 py-2
               text-sm text-sidebar-foreground/80 cursor-pointer
               hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
               focus-visible:outline-none focus-visible:ring-1
               focus-visible:ring-sidebar-ring"
                    >
                        <div className="flex items-center gap-3">
                            <SunMoon className="h-4 w-4 shrink-0" />
                            <span>Appearance</span>
                        </div>


                        <Switch onClick={(e) => e.stopPropagation()} />

                    </div>
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
