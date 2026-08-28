'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import AIToolsModal from "@/components/AIToolsModal"
import { NewProjectDialog } from "@/components/NewProjectDialog"
import { Logo } from "@/components/Logo"
import { useProjectStore } from "@/store/projectStore"
import { titleCase } from "@/lib/utils"
import {
  Zap,
  Plus,
  Copy,
  ArrowRight,
  ChevronRight,
} from "lucide-react"

const STEPS = [
  {
    icon: Zap,
    title: "Describe your idea",
    body: "Tell ChatGPT or Claude what you're building and how you plan to work on it.",
  },
  {
    icon: Copy,
    title: "Copy the reply",
    body: "The AI returns a structured Canvas Code with sections, cards, tags, and tasks.",
  },
  {
    icon: ArrowRight,
    title: "Import it here",
    body: "Paste the code and your project appears instantly — refine it anytime.",
  },
]

export function WorkspaceEmpty() {
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)

  const projects = useProjectStore((state) => state.projects)
  const setActiveProject = useProjectStore((state) => state.setActiveProject)

  return (
    <>
      <div className="home-dots relative flex flex-1 flex-col overflow-y-auto">
        {/* Hero */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-16 pb-10 text-center">
          <Logo className="mb-6 h-9 opacity-80" />

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Plan projects with AI
          </h1>

          <p className="text-muted-foreground mt-3 max-w-md text-[15px] leading-relaxed">
            Describe your project to ChatGPT or Claude, import the structured
            plan as a Kanban board, or start one from scratch.
          </p>
        </div>

        {/* How it works */}
        <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-12">
          <h2 className="text-muted-foreground/70 mb-5 text-center text-xs font-medium tracking-wider uppercase">
            How it works
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="bg-card/60 border-border/60 relative rounded-xl border p-5"
              >
                <div className="bg-primary/12 text-primary mb-3 flex size-9 items-center justify-center rounded-lg">
                  <s.icon className="size-[18px]" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{s.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 pb-10">
          <Button onClick={() => setIsToolsOpen(true)} className="h-12 w-full gap-2 px-6 text-[15px]">
            <Zap className="size-[18px]" />
            Start with Canvas Tools
          </Button>
          <Button
            onClick={() => setIsNewProjectOpen(true)}
            variant="outline"
            className="h-12 w-full gap-2 px-6 text-[15px]"
          >
            <Plus className="size-[18px]" />
            Create project manually
          </Button>
        </div>

        {/* Recent projects — clean list, no separate background */}
        {projects.length > 0 && (
          <div className="relative z-10 mx-auto w-full max-w-xl px-6 pb-12">
            <h2 className="text-muted-foreground/70 mb-4 text-xs font-medium tracking-wider uppercase">
              Recent projects
            </h2>

            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/60">
              {projects.slice(0, 8).map((project) => {
                const cards = project.columns.flatMap((c) => c.cards)
                const done = cards.filter((c) => c.isDone).length

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setActiveProject(project.id)}
                    className="
                      group flex w-full items-center gap-4 px-4 py-3 text-left
                      transition-colors hover:bg-muted/40
                    "
                  >
                    <span className="flex-1 truncate text-sm font-medium">
                      {titleCase(project.name)}
                    </span>

                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {done}/{cards.length} cards
                    </span>

                    <ChevronRight className="text-muted-foreground/40 group-hover:text-foreground size-4 shrink-0 transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AIToolsModal open={isToolsOpen} onClose={() => setIsToolsOpen(false)} />

      <NewProjectDialog
        open={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
    </>
  )
}
