'use client'

import { Search, Plus, Shapes, SunMoon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useProjectStore } from "@/store/projectStore"
import { NewProjectDialog } from "./NewProjectDialog"
import { EditProjectDialog } from "./EditProjectDialog"
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog"
import { Button } from "@/components/ui/button"
import { Switch } from "./ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PencilIcon, TrashIcon } from "lucide-react"

export default function Sidebar({ dark, setDark }: any) {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)
  const [DeleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  // NEW
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [searchOpen])

  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const setActiveProject = useProjectStore((state) => state.setActiveProject)
  const deleteP = useProjectStore(state => state.deleteProject)

  const editProject = projects.find(p => p.id === editProjectId)
  const deleteProject = projects.find(p => p.id === DeleteProjectId)

  function handleDelete() {
    if (!DeleteProjectId) return null
    deleteP(DeleteProjectId)
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-sidebar text-sidebar-foreground w-60 h-screen flex flex-col border-r border-sidebar-border">

      {/* Header */}
      <div className="h-20 flex items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="h-8 w-8 flex items-center justify-center rounded-md bg-sidebar-accent/20 text-sidebar-accent shadow-xs">
          <Shapes className="h-5 w-5" />
        </div>

        <h2 className="text-base font-semibold tracking-tight leading-none">
          Chat2Canvas
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top actions */}
        <div className="p-3 space-y-1">

          {/* 🔍 Animated search bar */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setSearchOpen(true)
              }
            }}
            className="
    flex items-center gap-2
    rounded-md
    px-2 py-1.5
    text-sidebar-foreground/80
    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
    focus-visible:ring-1 focus-visible:ring-sidebar-ring
    transition
    cursor-text
  "
          >
            <Search className="h-4 w-4 shrink-0" />

            <div
              className={`
      relative overflow-hidden
      transition-all duration-300 ease-out
      ${searchOpen ? "w-full" : "w-[120px]"}
    `}
            >
              {/* text */}
              <span
                className={`
        absolute left-0 top-1/2 -translate-y-1/2
        text-sm whitespace-nowrap
        transition-all duration-200
        ${searchOpen
                    ? "opacity-0 translate-x-2 pointer-events-none"
                    : "opacity-100 translate-x-0"}
      `}
              >
                Search projects
              </span>

              {/* input */}
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => {
                  // ✅ close + reset filter when user leaves search
                  setSearch("")
                  setSearchOpen(false)
                }}
                onClick={(e) => e.stopPropagation()}
                type="text"
                placeholder="Search projects…"
                className={`
        w-full bg-transparent text-sm outline-none
        transition-all duration-200
        ${searchOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none"}
      `}
              />
            </div>
          </div>

          {/* New project */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-md
           
              text-sidebar-foreground/80
              hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
              focus-visible:ring-1 focus-visible:ring-sidebar-ring"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="text-sm">New project</span>
          </Button>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto border-t border-sidebar-border px-2 py-3">
          <div className="px-2 pb-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
              Projects
            </h2>
          </div>

          <div className="space-y-1">
            {filteredProjects.map((project) => {
              const isActive = activeProjectId === project.id

              return (
                <div
                  role="button"
                  key={project.id}
                  title={project.name}
                  tabIndex={0}
                  onClick={() => setActiveProject(project.id)}
                  className={`
                    group relative flex items-center justify-between gap-2
                    px-2.5 py-1.5 rounded-md cursor-pointer
                    text-sm transition-colors
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring
                    ${isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-sidebar-primary-foreground/80" />
                  )}

                  <span className="flex-1 truncate pl-1">
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
                        onClick={(e) => e.stopPropagation()}
                        className="
                          h-6 w-6 rounded-md
                          text-current/70
                          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                          hover:bg-black/5 dark:hover:bg-white/10
                          focus-visible:ring-1 focus-visible:ring-sidebar-ring
                          transition
                        "
                      >
                        ⋮
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="min-w-36"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditProjectId(project.id)
                          }}
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteProjectId(project.id)
                          }}
                          variant="destructive"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border py-4">

        <div className="px-3 ">
          <div
            className="
              flex items-center justify-between rounded-md px-2.5 py-2
              text-sm text-sidebar-foreground/80 cursor-pointer
              hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring
              transition
            "
          >
            <div className="flex items-center gap-2">
              <SunMoon className="h-4 w-4 shrink-0" />
              <span>Appearance</span>
            </div>

            <Switch
              checked={dark}
              onCheckedChange={setDark}
            />
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
        <ConfirmDeleteDialog
          open={true}
          onClose={() => setDeleteProjectId(null)}
          title={`Delete "${deleteProject.name}"?`}
          description="This action cannot be undone. This will permanently delete your project."
          confirmLabel="Delete project"
          onConfirm={handleDelete}
        />
      )}

      <NewProjectDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}