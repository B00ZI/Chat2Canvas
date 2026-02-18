'use client'

import { Search, Plus, Shapes, SunMoon, LogOut, MoreVertical } from "lucide-react"
import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { NewProjectDialog } from "./NewProjectDialog"
import { EditProjectDialog } from "./EditProjectDialog"
import { DeleteProjecDIalog } from "./DeleteProjectDialog"
import { Button } from "@/components/ui/button"
import { Switch } from "./ui/switch"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PencilIcon, ShareIcon, TrashIcon } from "lucide-react"

export default function Sidebar({ dark, setDark }: any) {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editProjectId, setEditProjectId] = useState<string | null>(null)
    const [DeleteProjectId, setDeleteProjectId] = useState<string | null>(null)

    const projects = useProjectStore((state) => state.projects)
    const activeProjectId = useProjectStore((state) => state.activeProjectId)
    const setActiveProject = useProjectStore((state) => state.setActiveProject)

    const editProject = projects.find(p => p.id === editProjectId)
    const deleteProject = projects.find(p => p.id === DeleteProjectId)

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
                            title={project.name}
                            tabIndex={0}
                            onClick={() => setActiveProject(project.id)}
                            className={` group  transition-colors flex items-center justify-between px-3 py-1 rounded-md  cursor-pointer  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring
                                ${activeProjectId === project.id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                        >
                            <span className="flex-1 truncate max-w-[140px]">
                                {project.name
                                    .split(" ")
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                            </span>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className=" h-5 w-5 p-1 rotate-90 opacity-0 text-secondary group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-transparent hover:hover:text-white    transition-opacity   "

                                    >
                                        ⋮
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="bg-popover text-popover-foreground border border-border shadow-md rounded-md"
                                >
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation()
                                            setEditProjectId(project.id)
                                        }}>
                                            <PencilIcon />
                                            Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteProjectId(project.id)
                                        }} variant="destructive">
                                            <TrashIcon />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
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


                        <Switch checked={dark}
                            onCheckedChange={setDark} />

                    </div>
                </div>


            </div>

            {/* Dialogs */}
            {editProject && (
                <EditProjectDialog
                    open={true}
                    onClose={() => setEditProjectId(null)}
                    projectId={editProject.id}
                    projectName={editProject.name}
                />
            )}
            {deleteProject && (
                <DeleteProjecDIalog
                    open={true}
                    onClose={() => setDeleteProjectId(null)}
                    projectId={deleteProject.id}
                    projectName={deleteProject.name}
                />
            )}

            <NewProjectDialog open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>

    )
}
