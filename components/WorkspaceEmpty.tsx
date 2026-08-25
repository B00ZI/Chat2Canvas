'use client'

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { useState } from "react"
import AIToolsModal from "@/components/AIToolsModal"
import { NewProjectDialog } from "@/components/NewProjectDialog"
import { LogoMark } from "@/components/Logo"

/** Ghost column skeletons rendered on a faint dot-grid canvas. */
function GhostBoard() {
  const columns = [
    { h: "h-16", delay: "0ms" },
    { h: "h-10", delay: "60ms" },
    { h: "h-20", delay: "120ms" },
    { h: "h-12", delay: "180ms" },
  ]

  return (
    <div
      aria-hidden
      className="canvas-dots mx-auto flex max-w-md items-start gap-3 px-6 py-8 opacity-70"
    >
      {columns.map((col, i) => (
        <div key={i} className="bg-card/50 flex flex-1 flex-col gap-2 rounded-xl border border-border/60 p-2">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="bg-primary/30 size-2 rounded-full" />
            <span className="bg-border h-1.5 w-10 rounded-full" />
          </div>
          <div className={`${col.h} bg-muted/40 rounded-lg`} style={{ transitionDelay: col.delay }} />
          {i % 2 === 0 && <div className="h-6 bg-muted/25 rounded-lg" />}
        </div>
      ))}
    </div>
  )
}

export function WorkspaceEmpty() {
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
        <Empty>
          <EmptyHeader>
            <LogoMark className="text-foreground/70 size-10" />

            <EmptyTitle className="font-display text-2xl font-semibold tracking-tight">
              Nothing on the canvas yet
            </EmptyTitle>

            <EmptyDescription>
              Plan a project with your favorite AI using Canvas tools, or start
              one from scratch.
            </EmptyDescription>
          </EmptyHeader>

          <GhostBoard />

          <EmptyContent className="flex-row justify-center gap-2">
            <Button onClick={() => setIsToolsOpen(true)}>Start with Canvas tools</Button>
            <Button onClick={() => setIsNewProjectOpen(true)} variant="outline">
              Create project manually
            </Button>
          </EmptyContent>
        </Empty>
      </div>

      <AIToolsModal open={isToolsOpen} onClose={() => setIsToolsOpen(false)} />

      <NewProjectDialog
        open={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
    </>
  )
}
