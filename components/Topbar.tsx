'use client'

import { Button } from "@/components/ui/button"
import { memo, useEffect, useRef, useState } from "react"
import AIToolsModal from "@/components/AIToolsModal"
import { useProjectStore } from "@/store/projectStore"
import { useShallow } from "zustand/react/shallow"
import { PanelLeft, Maximize2, Home, Send, Search, X } from "lucide-react"
import { titleCase } from "@/lib/utils"
import { useFocusMode } from "@/lib/ui-state"

const TopBarInner = memo(function TopBarInner() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [focus, toggleFocus] = useFocusMode()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchQuery = useProjectStore((s) => s.searchQuery)
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery)

  // Command palette can open Canvas Tools remotely.
  useEffect(() => {
    const handler = () => setIsModalOpen(true)
    window.addEventListener("c2c:open-canvas-tools", handler)
    return () => window.removeEventListener("c2c:open-canvas-tools", handler)
  }, [])

  const project = useProjectStore(
    useShallow((state) => {
      const proj = state.projects.find((p) => p.id === state.activeProjectId)
      if (!proj) return null
      const cards = proj.columns.flatMap((c) => c.cards)
      return {
        name: proj.name,
        description: proj.description,
        cardsDone: cards.filter((card) => card.isDone).length,
        cardsTotal: cards.length,
      }
    })
  )
  const setActiveProject = useProjectStore((state) => state.setActiveProject)

  if (!project) return null

  return (
    <>
      <header
        className={`bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30
                   border-b border-border backdrop-blur
                   flex h-[72px] shrink-0 items-center gap-3 px-4 md:px-6
                   transition-[margin,transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                     focus
                       ? "pointer-events-none -mt-[72px] -translate-y-3 opacity-0"
                       : ""
                   }`}
      >
        {/* Mobile sidebar trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={() => window.dispatchEvent(new CustomEvent("c2c:open-sidebar"))}
        >
          <PanelLeft />
        </Button>

        {/* Home — return to the landing view */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to home"
          title="All projects"
          onClick={() => setActiveProject(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Home />
        </Button>

        {/* Project name + card count */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl leading-tight font-semibold tracking-tight">
            {titleCase(project.name)}
          </h1>
          {project.description && (
            <p className="text-muted-foreground truncate text-[13px] leading-snug">
              {project.description}
            </p>
          )}
          <p className="text-muted-foreground mt-0.5 text-[13px] tabular-nums">
            {project.cardsDone}/{project.cardsTotal} cards completed
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {searchOpen && (
            <div className="flex items-center gap-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                aria-label="Search cards"
                className="h-8 w-40 rounded-lg border border-border bg-background px-3 text-sm focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => { setSearchQuery(""); setSearchOpen(false) }}
                aria-label="Close search"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search cards"
            title="Search cards"
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (!searchOpen) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
              } else {
                setSearchQuery("");
              }
            }}
            className={`text-muted-foreground hover:text-foreground ${searchOpen ? "bg-accent" : ""}`}
          >
            <Search />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Enter focus mode"
            title="Focus mode — hide sidebar and top bar (Esc to exit)"
            onClick={toggleFocus}
            className="text-muted-foreground hover:text-foreground"
          >
            <Maximize2 />
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="shadow-xs hover:bg-primary/90 ml-1 flex items-center gap-2"
          >
            <Send />
            Share with AI
          </Button>
        </div>
      </header>

      <AIToolsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
})

export default TopBarInner
