"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Zap } from "lucide-react"
import {
  INSTRUCTIONS_PROMPTS,
  INSTRUCTIONS_PROMPT_REMINDER
} from "@/lib/prompts"

import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"

interface AIToolsModalProps {
  open: boolean
  onClose: () => void
}

export default function AIToolsModal({ open, onClose }: AIToolsModalProps) {
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const projects = useProjectStore((state) => state.projects)
  const importProject = useProjectStore((state) => state.importProject)

  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState<string | null>(null)

  const [copiedCreator, setCopiedCreator] = useState(false)
  const [copiedExport, setCopiedExport] = useState(false)

  const creatorPrompt = INSTRUCTIONS_PROMPTS
  const formatReminder = INSTRUCTIONS_PROMPT_REMINDER

  const currentProject = projects.find((p) => p.id === activeProjectId)

  const handleCopy = (text: string, type?: "creator" | "export") => {
    navigator.clipboard.writeText(text)

    if (type === "creator") {
      setCopiedCreator(true)
      setTimeout(() => setCopiedCreator(false), 1600)
    }

    if (type === "export") {
      setCopiedExport(true)
      setTimeout(() => setCopiedExport(false), 1600)
    }
  }

  const handleImport = () => {
    try {
      setImportError(null)

      const jsonMatch = importText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        setImportError("No Canvas Code found. Make sure you pasted the full code.")
        return
      }

      const data = JSON.parse(jsonMatch[0])

      if (!data.name || !Array.isArray(data.columns)) {
        setImportError("Invalid Canvas Code. Missing 'name' or 'columns'.")
        return
      }

      importProject(data)
      setImportText("")
      setImportError(null)
      onClose()
    } catch (error) {
      setImportError("Failed to import. The pasted Canvas Code is not valid JSON.")
    }
  }


  const handleCopyProgress = () => {
    const project = projects.find((p) => p.id === activeProjectId)
    if (!project) return

    const cleanData = {
      name: project.name,
      columns: project.columns.map((col) => ({
        title: col.title,
        color: col.color,
        cards: col.cards.map((card) => ({
          title: card.title,
          color: card.color,
          tasks: card.tasks
        }))
      }))
    }

    const projectJson = JSON.stringify(cleanData, null, 2)

    const syncMessage = `Here is my current project progress for "${project.name}":\n\n${projectJson}\n\nReview this and suggest improvements. Return updated Canvas Code in the same format.`

    handleCopy(syncMessage, "export")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[960px] max-w-[95vw]
          h-[680px] max-h-[90vh]
          bg-card text-card-foreground
          border-2 border-border
          rounded-xl
          shadow-xl
          p-0
          flex flex-col
        "
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  AI Planning Tools
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Design your project workflow using the power of AI.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden pb-8 pr-2">
          <Tabs defaultValue="start" className="h-full flex flex-col">
            <TabsList
              variant={"line"}
              className="border-b w-full mb-4"
            >
              <TabsTrigger value="start" className="border-none">
                Start Fresh
              </TabsTrigger>
              <TabsTrigger value="import" className="border-none">
                Import
              </TabsTrigger>
              <TabsTrigger value="Export" className="border-none">
                Export
              </TabsTrigger>
            </TabsList>

            {/* ---------------- Start ---------------- */}

            <TabsContent
              value="start"
              className="
                px-8 pr-6
                flex-1 overflow-y-auto
                space-y-8
                focus-visible:outline-none
                data-[state=active]:animate-in
                data-[state=active]:fade-in-0

                [&::-webkit-scrollbar]:w-[4px]
                [&::-webkit-scrollbar-track]:bg-accent/70
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-sidebar-accent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-primary
              "
            >
              <div className="grid grid-cols-1 gap-6 items-start">
                {/* Left column */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Quick Start Guide</h3>
                    <p className="text-sm text-muted-foreground">
                      Follow these steps to bridge your AI chat to Chat2Canvas.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      "Plan your project in ChatGPT or Claude",
                      "Copy the specialized Creator Prompt below",
                      "Paste it to your AI to generate the code",
                      "Copy that code and head to the Import tab"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <Badge
                          variant="secondary"
                          className="
                            h-7 w-7 p-0 rounded-full
                            flex items-center justify-center
                            bg-muted text-accent-foreground
                            border border-border
                            group-hover:bg-background
                            group-hover:text-primary-foreground
                            transition-colors
                          "
                        >
                          {i + 1}
                        </Badge>

                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div
                    className="
                      bg-popover text-popover-foreground
                      rounded-lg p-4
                      shadow-lg
                      border border-border
                      relative
                    "
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        System Prompt
                      </p>

                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      </div>
                    </div>

                    <div
                      className="
                        pr-2 max-h-20 overflow-y-auto
                        font-mono text-[11px] text-muted-foreground leading-relaxed
                        [&::-webkit-scrollbar]:w-[4px]
                        [&::-webkit-scrollbar-track]:bg-accent/70
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-sidebar-accent
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb:hover]:bg-primary
                      "
                    >
                      {creatorPrompt}
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-primary/15 to-transparent rounded-b-lg" />
                  </div>

                  <Button
                    onClick={() => handleCopy(creatorPrompt, "creator")}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedCreator ? "Copied!" : "Copy Creator Prompt"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ---------------- Import ---------------- */}

            <TabsContent
              value="import"
              className="
                px-8
                flex-1 overflow-y-auto
                space-y-8
                focus-visible:outline-none
                data-[state=active]:animate-in
                data-[state=active]:fade-in-0

                [&::-webkit-scrollbar]:w-[4px]
                [&::-webkit-scrollbar-track]:bg-accent/70
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-sidebar-accent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-primary
              "
            >
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Paste Canvas Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste the <strong>Canvas Code</strong> provided by the AI.
                    Ensure you include the opening{" "}
                    <code className="bg-muted px-1">{"{"}</code> and closing{" "}
                    <code className="bg-muted px-1">{"}"}</code> braces.
                  </p>
                </div>

                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value)
                    if (importError) setImportError(null)
                  }}
                  className={`
    w-full h-70 p-5
    bg-background
    border
    rounded-lg
    font-mono text-xs
    resize-none
    shadow-inner
    focus-visible:outline-none
    focus-visible:ring-2
    transition
    placeholder:text-muted-foreground

    ${importError
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input focus-visible:ring-ring"
                    }
  `}
                  placeholder='{ "name": "Project Title", ... }'
                />

                {importError && (
                  <p className="text-sm text-destructive/80 mt-[-20px]">
                    {importError}
                  </p>
                )}
                <Button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Import Canvas
                </Button>

              </div>
            </TabsContent>

            {/* ---------------- Export ---------------- */}

            <TabsContent
              value="Export"
              className="
                px-8
                flex-1 overflow-y-auto
                space-y-8
                focus-visible:outline-none
                data-[state=active]:animate-in
                data-[state=active]:fade-in-0

                [&::-webkit-scrollbar]:w-[4px]
                [&::-webkit-scrollbar-track]:bg-accent/70
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-sidebar-accent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-primary
              "
            >
              <div className="space-y-5 flex flex-col h-full">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Export Current Canvas</h3>
                  <p className="text-sm text-muted-foreground">
                    Send your current progress back to the AI to refine your plan
                    or generate next steps.
                  </p>
                </div>

                <Button
                  onClick={handleCopyProgress}
                  disabled={!currentProject}
                  className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copiedExport ? "Copied to clipboard" : "Export Current Canvas"}
                </Button>

                {!currentProject && (
                  <p className="text-xs text-muted-foreground">
                    You need to create a project first before exporting.
                  </p>
                )}

                <div className="mt-auto pt-6 border-t border-border flex flex-col items-center space-y-5">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider text-center">
                    If AI forgot the format, copy the Creator Prompt from the
                    Start Fresh tab or use the button below.
                  </p>

                  <Button
                    variant={"outline"}
                    onClick={() => handleCopy(creatorPrompt, "creator")}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedCreator ? "Copied!" : "Copy Creator Prompt"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
