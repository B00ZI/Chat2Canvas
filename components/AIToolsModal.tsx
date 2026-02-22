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
import { Copy, FileJson, RefreshCw, Zap } from "lucide-react"
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

  const creatorPrompt = INSTRUCTIONS_PROMPTS
  const formatReminder = INSTRUCTIONS_PROMPT_REMINDER

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleImport = () => {
    try {
      const jsonMatch = importText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        alert("No Canvas Code found. Make sure you copied the entire code.")
        return
      }

      const data = JSON.parse(jsonMatch[0])

      if (!data.name || !Array.isArray(data.columns)) {
        alert("Invalid Canvas Code. Missing 'name' or 'columns'.")
        return
      }

      importProject(data)
      setImportText("")
      onClose()
    } catch (error) {
      alert("Failed to import. Make sure the Canvas Code is valid." + error)
    }
  }

  const handleCopyProgress = () => {
    const currentProject = projects.find((p) => p.id === activeProjectId)

    if (!currentProject) {
      alert("No active project to sync!")
      return
    }

    const cleanData = {
      name: currentProject.name,
      columns: currentProject.columns.map((col) => ({
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

    const syncMessage = `Here is my current project progress for "${currentProject.name}":\n\n${projectJson}\n\nReview this and suggest improvements. Return updated Canvas Code in the same format.`

    handleCopy(syncMessage)
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
        {/* Header (fixed) */}
        <div className="px-8 pt-8 pb-4 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex flex-col ">
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

        {/* Body (scroll area) */}
        <div className="flex-1  overflow-hidden  pb-8 pr-2 ">
          <Tabs

            defaultValue="start"
            className="h-full flex flex-col"
          >
            <TabsList
              variant={'line'}

              className="
                border-b
                w-full

                mb-6
                
              "
            >
              <TabsTrigger
                value="start"
                className="border-none"
              >
                Start Fresh
              </TabsTrigger>

              <TabsTrigger
                value="import"
                className=" border-none"
              >
                Import
              </TabsTrigger>

              <TabsTrigger
                value="Export"
                className=" border-none"
              >
                Export
              </TabsTrigger>
            </TabsList>

            {/* ---------------- Start ---------------- */}

            <TabsContent
              value="start"
              className="
              
                px-8
                pr-6
                
                flex-1 overflow-y-auto
                space-y-8
                focus-visible:outline-none
                data-[state=active]:animate-in
                data-[state=active]:fade-in-0
                [&::-webkit-scrollbar]:w-[4px]
                     [&::-webkit-scrollbar-track]:bg-accent/70 [&::-webkit-scrollbar-track]:rounded-full
                     [&::-webkit-scrollbar-thumb]:bg-sidebar-accent [&::-webkit-scrollbar-thumb]:rounded-full
                     [&::-webkit-scrollbar-thumb:hover]:bg-primary
              "
            >
              <div className="grid grid-cols-1  gap-6 items-start">
                {/* Left column */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">
                      Quick Start Guide
                    </h3>
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
                      <div
                        key={i}
                        className="flex items-center gap-4 group"
                      >
                        <Badge
                          variant="secondary"
                          className="
                            h-7 w-7 p-0 rounded-full
                            flex items-center justify-center
                            bg-muted  text-accent-foreground
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

                {/* Right column (sticky tool panel) */}
                <div className="space-y-4 ">
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
                      <p

                        className="
                          text-[10px]
                          uppercase tracking-widest
                          text-muted-foreground
                        "
                      >
                        System Prompt
                      </p>

                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      </div>
                    </div>

                    <div className="pr-2 max-h-20 overflow-y-auto font-mono text-[11px] text-muted-foreground leading-relaxed
                     [&::-webkit-scrollbar]:w-[4px]
                     [&::-webkit-scrollbar-track]:bg-accent/70 [&::-webkit-scrollbar-track]:rounded-full
                     [&::-webkit-scrollbar-thumb]:bg-sidebar-accent [&::-webkit-scrollbar-thumb]:rounded-full
                     [&::-webkit-scrollbar-thumb:hover]:bg-primary">
                      {creatorPrompt}
                    </div>

                    {/* [&::-webkit-scrollbar]:w-[4px]
            [&::-webkit-scrollbar-track]:bg-sidebar [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-sidebar-accent [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb:hover]:bg-primary */}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-primary/15 to-transparent rounded-b-lg" />
                  </div>

                  <Button
                    onClick={() => handleCopy(creatorPrompt)}
                    className="
                      w-full "
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Creator Prompt
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
              "
            >
              <div className="space-y-5">

                <div className="space-y-1">
                  <h3 className="font-bold text-lg">
                    Paste Canvas Code
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Paste the <strong>Canvas Code</strong> provided by the AI.
                    Ensure you include the opening{" "}
                    <code className="bg-muted px-1 ">{"{"}</code>{" "}
                    and closing{" "}
                    <code className="bg-muted px-1 ">{"}"}</code>{" "}
                    braces.
                  </p>
                </div>


                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="
                    w-full h-70 p-5
                    bg-background
                    border border-input
                    rounded-lg
                    font-mono text-xs
                    resize-none
                    shadow-inner
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-ring
                    transition
                    placeholder:text-muted-foreground
                  "
                  placeholder='{ "name": "Project Title", ... }'
                />

                <Button
                  onClick={() => handleCopy(creatorPrompt)}
                  className="
                      w-full "
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Plan Canvas
                </Button>
              </div>
            </TabsContent>

            {/* ---------------- Sync ---------------- */}

            <TabsContent
              value="Export"
              className="
              px-8
                flex-1 overflow-y-auto
                space-y-8
                focus-visible:outline-none
                data-[state=active]:animate-in
                data-[state=active]:fade-in-0
              "
            >
              <div className="space-y-5 flex flex-col h-full">

                <div className="space-y-1">
                  <h3 className="font-bold text-lg">
                    Export Current Canvas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send your current progress back to the AI to refine your plan
                    or generate next steps.
                  </p>
                </div>



                <Button
                  onClick={() => handleCopy(creatorPrompt)}
                  className="
                      w-full "
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Export Current Canvas
                </Button>

                <div className="mt-auto pt-6 border-t border-border flex flex-col items-center space-y-5">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    If Ai Forgot the format just Coppy the Creator prompt from the  Start frecsh Tab or from the btn bellow
                  </p>

                  <Button
                  variant={"outline"}
                    onClick={() => handleCopy(creatorPrompt)}
                    className="
                      w-full "
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Creator Prompt
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
