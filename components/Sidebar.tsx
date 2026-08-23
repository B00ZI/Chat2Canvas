'use client'

import { Search, Plus, Shapes, SunMoon, Check, Monitor, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { useProjectStore } from "@/store/projectStore"
import { NewProjectDialog } from "@/components/NewProjectDialog"
import { EditProjectDialog } from "@/components/EditProjectDialog"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PencilIcon, TrashIcon, MoreVertical } from "lucide-react"
import { titleCase } from "@/lib/utils"
import { useTheme, type Theme } from "@/lib/theme"
import { toast } from "sonner"

/** Opens the global command palette (registered in CommandPalette.tsx). */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("c2c:open-command"))
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  const [theme, setTheme] = useTheme()

  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const setActiveProject = useProjectStore((state) => state.setActiveProject)
  const deleteP = useProjectStore((state) => state.deleteProject)

  const editProject = projects.find((p) => p.id === editProjectId)
  const deleteProject = projects.find((p) => p.id === deleteProjectId)

  function handleDelete() {
    if (!deleteProjectId || !deleteProject) return
    deleteP(deleteProjectId)
    toast.success(`"${deleteProject.name}" deleted`)
  }

  function selectProject(id: string) {
    setActiveProject(id)
    onNavigate?.()
  }

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="bg-primary text-primary-foreground shadow-xs flex h-8 w-8 items-center justify-center rounded-lg">
          <Shapes className="h-4 w-4" />
        </div>
        <h2 className="font-display text-base leading-none font-semibold tracking-tight">
          Chat2Canvas
        </h2>
      </div>

      {/* Actions */}
      <div className="space-y-1 p-3">
        {/* Search — hands off to the command palette */}
        <button
          type="button"
          onClick={openCommandPalette}
          className="
            hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            focus-visible:ring-sidebar-ring flex w-full cursor-pointer items-center gap-2
            rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors
            focus-visible:ring-2 focus-visible:outline-none
          "
        >
          <Search className="size-4 shrink-0" />
          <span>Search</span>
          <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 select-none items-center rounded-sm border border-border px-1.5 font-mono text-[10px] font-medium tracking-wide">
            ⌘K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="sm"
          className="
            text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            focus-visible:ring-sidebar-ring w-full justify-start gap-2
          "
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="size-4 shrink-0" />
          New project
        </Button>
      </div>

      {/* Projects */}
      <div className="scrollbar-slim flex-1 overflow-y-auto px-2 pt-2 pb-3">
        <h3 className="text-muted-foreground/70 px-2 pb-2 text-xs font-medium tracking-wider uppercase">
          Projects
        </h3>

        <nav className="space-y-0.5">
          {projects.map((project) => {
            const isActive = activeProjectId === project.id

            return (
              <div
                role="button"
                key={project.id}
                title={project.name}
                tabIndex={0}
                onClick={() => selectProject(project.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    selectProject(project.id)
                  }
                }}
                className={`
                  group relative flex cursor-pointer items-center justify-between gap-2
                  rounded-md px-2.5 py-1.5 text-sm transition-colors
                  focus-visible:ring-sidebar-ring focus-visible:ring-2 focus-visible:outline-none
                  ${
                    isActive
                      ? "bg-primary/12 text-primary font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="bg-primary absolute top-1/2 left-0 h-4 w-[2px] -translate-y-1/2 rounded-full"
                  />
                )}

                <span className="flex-1 truncate pl-1">{titleCase(project.name)}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Options for ${project.name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="
                        text-current/60 hover:bg-black/5 dark:hover:bg-white/10
                        opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100
                        focus-visible:opacity-100
                      "
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="min-w-36">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditProjectId(project.id)
                        }}
                      >
                        <PencilIcon />
                        Rename
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteProjectId(project.id)
                        }}
                      >
                        <TrashIcon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}

          {projects.length === 0 && (
            <p className="text-muted-foreground/70 px-2 py-4 text-center text-xs">
              No projects yet
            </p>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="
                text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                focus-visible:ring-sidebar-ring w-full justify-start gap-2
              "
            >
              <SunMoon className="size-4 shrink-0" />
              Appearance
              <span className="text-muted-foreground ml-auto text-xs capitalize">
                {theme}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" side="top" className="min-w-36">
            <DropdownMenuGroup>
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
                  <Icon />
                  {label}
                  {theme === value && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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

      <NewProjectDialog open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Topbar hamburger requests the off-canvas sidebar on small screens.
  useEffect(() => {
    const handler = () => setMobileOpen(true)
    window.addEventListener("c2c:open-sidebar", handler)
    return () => window.removeEventListener("c2c:open-sidebar", handler)
  }, [])

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile off-canvas */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 gap-0 p-0" showClose={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
