'use client'

import { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useProjectStore } from "@/store/projectStore"
import {
  Check,
  Folder,
  LayoutTemplate,
  Monitor,
  Moon,
  Sun,
} from "lucide-react"
import { setStoredTheme, useTheme } from "@/lib/theme"

/** Global ⌘K palette: project switching + app actions.
 *  Opens via keyboard shortcut or the `c2c:open-command` event. */
export default function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    window.addEventListener("c2c:open-command", onOpen)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("c2c:open-command", onOpen)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)

  // SSR-safe current theme (no document reads during render).
  const [theme] = useTheme()

  const run = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search projects and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Projects">
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              value={project.name}
              onSelect={() => run(() => setActiveProject(project.id))}
            >
              <Folder />
              {project.name}
              {activeProjectId === project.id && (
                <Check className="text-primary ml-auto" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="open canvas tools ai planning"
            onSelect={() =>
              run(() =>
                window.dispatchEvent(new CustomEvent("c2c:open-canvas-tools"))
              )
            }
          >
            <LayoutTemplate />
            Open Canvas Tools
          </CommandItem>

          <CommandItem
            value="theme light appearance"
            onSelect={() => run(() => setStoredTheme("light"))}
          >
            <Sun />
            Light theme
            {theme === "light" && <Check className="text-primary ml-auto" />}
          </CommandItem>

          <CommandItem
            value="theme dark appearance"
            onSelect={() => run(() => setStoredTheme("dark"))}
          >
            <Moon />
            Dark theme
            {theme === "dark" && <Check className="text-primary ml-auto" />}
          </CommandItem>

          <CommandItem
            value="theme system appearance"
            onSelect={() => run(() => setStoredTheme("system"))}
          >
            <Monitor />
            System theme
            {theme === "system" && <Check className="text-primary ml-auto" />}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
